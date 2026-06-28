import {
  degradedProfileForModel,
  profileForModel,
  type RuntimeProfile,
} from '@/features/inference/profiles';
import type { CatalogModel } from '@/lib/models';
import { AppState } from 'react-native';
import {
  initLlama,
  type CompletionParams,
  type LlamaContext,
  type NativeCompletionResult,
} from 'llama.rn';

export type LlamaStatus = 'idle' | 'loading' | 'ready' | 'generating' | 'unloading' | 'error';

export interface LlamaStatusSnapshot {
  status: LlamaStatus;
  modelId: string | null;
  warm: boolean;
  error?: string;
}

type Listener = () => void;

class LlamaService {
  private context: LlamaContext | null = null;
  private modelId: string | null = null;
  private status: LlamaStatus = 'idle';
  private error: string | undefined;
  private warm = false;
  private snapshot: LlamaStatusSnapshot = { status: 'idle', modelId: null, warm: false };
  private loadToken = 0;
  private generating = false;
  private backgroundReleaseTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<Listener>();

  constructor() {
    AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        if (this.backgroundReleaseTimer) clearTimeout(this.backgroundReleaseTimer);
        this.backgroundReleaseTimer = setTimeout(() => {
          this.backgroundReleaseTimer = null;
          void this.release();
        }, 15000);
        return;
      }

      if (state === 'active' && this.backgroundReleaseTimer) {
        clearTimeout(this.backgroundReleaseTimer);
        this.backgroundReleaseTimer = null;
      }
    });
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getStatus = (): LlamaStatusSnapshot => this.snapshot;

  async load(model: CatalogModel, filePath: string): Promise<void> {
    if (this.modelId === model.id && this.context) return;

    const token = ++this.loadToken;
    this.setStatus('loading', null);
    await this.disposeContext();

    try {
      await this.initAndAdopt(model, filePath, profileForModel(model), token);
    } catch {
      if (token !== this.loadToken) return;
      this.setStatus('loading', null);

      try {
        await this.initAndAdopt(model, filePath, degradedProfileForModel(model), token);
      } catch (error) {
        if (token === this.loadToken) {
          await this.disposeContext();
          this.setStatus('error', error instanceof Error ? error.message : 'Unable to load model');
        }
        throw error;
      }
    }
  }

  async generate(params: CompletionParams, onToken: (token: string) => void): Promise<string> {
    const result = await this.complete(params, onToken);
    return result.text;
  }

  async complete(
    params: CompletionParams,
    onToken: (token: string) => void
  ): Promise<NativeCompletionResult> {
    if (!this.context) throw new Error('No model loaded');
    if (this.generating) throw new Error('Generation already in progress');

    const context = this.context;
    const token = this.loadToken;
    this.generating = true;
    this.setStatus('generating');

    try {
      const result = await context.completion({ n_predict: -1, ...params }, (data) => {
        if (data.token) onToken(data.token);
      });
      return result;
    } finally {
      if (token === this.loadToken) {
        this.warm = true;
        this.generating = false;
        if (this.status === 'generating') this.setStatus('ready');
      }
    }
  }

  async stop(): Promise<void> {
    if (!this.generating) return;
    await this.context?.stopCompletion().catch(() => {});
  }

  async release(): Promise<void> {
    const token = ++this.loadToken;
    if (this.backgroundReleaseTimer) {
      clearTimeout(this.backgroundReleaseTimer);
      this.backgroundReleaseTimer = null;
    }
    if (this.context) this.setStatus('unloading');
    await this.disposeContext();
    if (token !== this.loadToken) return;
    this.error = undefined;
    if (this.status !== 'idle') this.setStatus('idle');
  }

  private async initContext(filePath: string, profile: RuntimeProfile): Promise<LlamaContext> {
    return initLlama({ model: filePath, ...profile });
  }

  private async initAndAdopt(
    model: CatalogModel,
    filePath: string,
    profile: RuntimeProfile,
    token: number
  ): Promise<void> {
    const ctx = await this.initContext(filePath, profile);
    if (token !== this.loadToken) {
      await ctx.release().catch(() => {});
      return;
    }

    this.context = ctx;
    this.modelId = model.id;
    this.warm = false;
    if (token === this.loadToken) this.setStatus('ready');
  }

  private async disposeContext(): Promise<void> {
    const context = this.context;
    if (!context) {
      this.modelId = null;
      this.warm = false;
      this.generating = false;
      return;
    }

    const wasGenerating = this.generating;
    this.context = null;
    this.modelId = null;
    this.warm = false;
    this.generating = false;

    if (wasGenerating) await context.stopCompletion().catch(() => {});
    await context.release().catch(() => {});
  }

  private setStatus(status: LlamaStatus, error?: string | null) {
    this.status = status;
    if (error !== undefined) this.error = error ?? undefined;
    this.snapshot = {
      status: this.status,
      modelId: this.modelId,
      warm: this.warm,
      error: this.error,
    };
    this.emit();
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }
}

export const llamaService = new LlamaService();
export type { CompletionParams, NativeCompletionResult };
