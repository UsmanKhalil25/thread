# Plan: Faster first-message prefill (GPU offload) + cold-start label

## Problem

After switching from chat 1 (model 1) to chat 2 (model 2) and sending the first message, the
response takes ~30+ seconds; subsequent messages are fast.

**Root cause:** the first `completion()` after a model (re)load must prefill the entire chat
history into an empty KV cache, and inference is currently **CPU-only** with small batch sizes:

```ts
// features/inference/profiles.ts (current `base`)
n_threads: 4,
n_batch: 256,
n_ubatch: 128,
n_gpu_layers: 0,   // <- nothing offloaded to the GPU
```

The second message is fast because the KV cache is now warm (only the newly appended tokens are
processed).

This plan does two things:

1. **#1 — Enable GPU offload + larger batches** so cold prefill (and generation) is much faster.
2. **Cold-start label** — while that first prefill runs, the assistant bubble currently shows
   "Thinking", which reads like a hang. Show a clearer message until the first token streams.

> Related: `docs/plans/chat-resume-and-inflight-switch.md` (lifecycle/interrupt fixes). This plan
> is independent and can land before or after it.

---

## Change 1 — GPU offload in the runtime profile

**File:** `features/inference/profiles.ts`

Move GPU-on, larger batches into the primary profile, and make the **degraded** profile the
CPU-only fallback. The existing loader already retries with `degradedProfileForModel` when the
first init throws (`features/inference/llama-service.ts:68-83`), so devices without a usable GPU
still load.

### `base` (primary)

```ts
const base = {
  n_threads: 4,
  n_batch: 512,        // was 256 — bigger prefill batch
  n_ubatch: 512,       // was 128 — bigger micro-batch
  n_gpu_layers: 99,    // was 0 — offload all layers (clamps to the model's real layer count)
  flash_attn_type: 'on',
  use_mmap: true,
  use_mlock: false,
} as const;
```

The `b <= 1.3` branch currently overrides `n_batch: 512`; that's now redundant with the new `base`
but harmless — leave it or drop the duplicate `n_batch`, your call. Do not change `n_ctx` or
`cache_type_*` values in the size branches.

### `degradedProfileForModel` (CPU-only fallback)

```ts
export function degradedProfileForModel(model: CatalogModel): RuntimeProfile {
  const profile = profileForModel(model);
  return {
    ...profile,
    n_gpu_layers: 0,   // CPU-only fallback for devices without usable GPU offload
    n_batch: 256,
    n_ubatch: 128,
    n_ctx: Math.max(Math.floor((profile.n_ctx ?? 2048) / 2), 1024),
    cache_type_k: 'q4_0',
    cache_type_v: 'q4_0',
  };
}
```

### Caveats to verify on-device

- **iOS:** Metal offload works well; very large models may need fewer than 99 layers if memory is
  tight. If init fails, the degraded (CPU) profile already kicks in.
- **Android:** GPU offload (Vulkan/OpenCL) depends on how the llama.rn native lib was built. If it
  isn't supported, init may throw → degraded CPU fallback handles it. Confirm the build actually
  has a GPU backend, otherwise `n_gpu_layers: 99` is effectively a no-op on Android.
- Watch memory pressure with GPU layers on big models; if a model OOMs only on GPU, consider a
  per-model `n_gpu_layers` cap in `profileForModel`.

---

## Change 2 — Cold-start label instead of "Thinking"

While the first prefill runs (no tokens yet), show a clearer message. We detect "cold" by tracking
whether the loaded context has produced output yet: a freshly loaded model is **cold** until its
first completion completes; after that the KV cache is warm and we revert to "Thinking".

### a) Track `warm` in the inference service

**File:** `features/inference/llama-service.ts`

1. Add `warm` to the snapshot type:

```ts
export interface LlamaStatusSnapshot {
  status: LlamaStatus;
  modelId: string | null;
  warm: boolean;
  error?: string;
}
```

2. Add a private field and initialize the snapshot:

```ts
private warm = false;
// ...
private snapshot: LlamaStatusSnapshot = { status: 'idle', modelId: null, warm: false };
```

3. Include it in every emitted snapshot — in `setStatus`:

```ts
this.snapshot = {
  status: this.status,
  modelId: this.modelId,
  warm: this.warm,
  error: this.error,
};
```

4. A freshly adopted context is cold — in `initAndAdopt`, right after adopting:

```ts
this.context = ctx;
this.modelId = model.id;
this.warm = false;            // fresh context: KV cache is cold
if (token === this.loadToken) this.setStatus('ready');
```

5. Mark warm once a completion finishes (the prompt prefix is now cached). In `complete`'s
   `finally`, set it before flipping status back to `ready`:

```ts
} finally {
  if (token === this.loadToken) {
    this.warm = true;          // KV cache now holds the processed prompt
    this.generating = false;
    if (this.status === 'generating') this.setStatus('ready');
  }
}
```

> If the other plan (`chat-resume-and-inflight-switch.md`) lands first, `complete` will already use
> the `token === this.loadToken` guard shown above — just add the `this.warm = true` line inside it.
> If this plan lands first, introduce the `token`/guard as part of this edit.

6. Reset on dispose for cleanliness — in `disposeContext`, set `this.warm = false` when clearing
   state (alongside `this.modelId = null`).

> Note: `load()` early-returns when the same model is already loaded, so re-selecting the current
> model keeps `warm` as-is (its cache may still be warm) — that's correct.

### b) Use the cold-start label in the UI

**File:** `features/chat/hooks/use-chat-session.ts`

`useLlamaStatus` is already imported. In `useChatSession`, read it and pick the label:

```ts
export function useChatSession() {
  const { activeChatId } = useChat();
  const session = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const actions = useChatActions();
  const llamaStatus = useLlamaStatus();

  useEffect(() => {
    if (activeChatId === session.chatId) return;
    void loadChatMessages(activeChatId);
  }, [activeChatId, session.chatId]);

  const thinkingLabel = session.titlePhase
    ? 'Generating title for chat'
    : llamaStatus.warm
      ? 'Thinking'
      : 'Warming up…';

  return useMemo(
    () => ({ ...session, ...actions, loadOlderMessages, thinkingLabel }),
    [actions, session, thinkingLabel]
  );
}
```

Behavior:
- **Resumed chat, cold model** (the slow case): `warm` is `false` → bubble shows **"Warming up…"**
  during the prefill, then switches to streamed content as tokens arrive.
- **After the first response**: `warm` is `true` → later turns show **"Thinking"** as before.
- The label only renders while `message.status === 'generating' && !message.content`
  (`features/chat/components/message-bubble.tsx:27`), so it disappears the moment streaming starts.

> Copy is adjustable — "Warming up…", "Preparing context…", or "Catching up on the conversation…"
> all work. Pick one; default to **"Warming up…"**.

---

## Verification

- **Prefill speed:** resume a chat with substantial history, send → first response starts in a few
  seconds (down from ~30s) on a GPU-capable device.
- **Fallback:** force/init failure (or a no-GPU device) still loads via the degraded CPU profile.
- **Label:** first message after a switch shows "Warming up…" (not "Thinking") until the first
  token; subsequent messages in the same session show "Thinking".
- **No regression:** generation, stop, and status transitions behave as before; title generation
  still shows "Generating title for chat".

## Files touched

- `features/inference/profiles.ts`
- `features/inference/llama-service.ts`
- `features/chat/hooks/use-chat-session.ts`
