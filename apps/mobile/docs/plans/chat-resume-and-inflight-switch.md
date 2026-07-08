# Plan: Fix chat resume + handle model/chat switches during generation

## Problem

Two related symptoms reported:

1. **Resuming a previous chat gives no response.** The model loads but sending produces nothing.
2. **Response only appears after ~100s, "when the model changed."** A previous generation
   keeps running and the switch stalls until it drains.

### Root causes (in code)

- `features/inference/llama-service.ts` — `disposeContext()` runs **before** the new model
  initializes during a switch (`load()` does `await this.disposeContext()` first). It can block
  for a long time behind an unbounded (`n_predict: -1`) completion's `context.release()`. This is
  the "~100s, only after model changed" symptom.
- `features/chat/contexts/chat-context.tsx` — model/chat switches **silently bail** while a
  generation is in flight:
  - line ~45: the resume effect returns early if `status === 'generating'`, so the resumed chat's
    model is never applied.
  - line ~60: `selectModel` returns early if `status === 'generating'`, so tapping a model does
    nothing.
- Latent wedge: if an in-flight `complete()` never settles after its context is released,
  `this.generating` stays `true` and every later `complete()` throws
  `"Generation already in progress"` — no responses until app reload.

## Product decisions (already finalized with the user)

1. **In-flight switch (model OR chat) → interrupt & keep the partial response.** Stop the running
   generation, persist the partial text as an `interrupted` message in its original chat, then
   proceed with the switch. No silently-ignored taps.
2. **No send queue.** Sending while the model is still loading stays blocked. The input already
   shows `"Loading model..."` and disables send (`features/chat/components/chat-input.tsx:56-64`),
   so the blocked state is already legible. **No change needed in `chat-input.tsx`.**

## Changes

### 1. `features/inference/llama-service.ts`

**a) Tokenize generation** so an orphaned `complete()` (whose context was swapped/released
mid-flight) cannot wedge `generating`/status. In `complete()`:

- Capture `const context = this.context;` and `const token = this.loadToken;` before awaiting.
- Call `context.completion(...)` on the captured `context` (not `this.context`).
- In the `finally`, only reset shared state when `token === this.loadToken`:

```ts
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
    // If the context was swapped/released while we were generating, a newer
    // load owns the shared state now — don't stomp its flags or status.
    if (token === this.loadToken) {
      this.generating = false;
      if (this.status === 'generating') this.setStatus('ready');
    }
  }
}
```

**b) Make `disposeContext()` detach state synchronously and stop before releasing**, so a swap is
never gated on a stale `generating` flag and the running completion is signalled to stop before the
(potentially slow) release:

```ts
private async disposeContext(): Promise<void> {
  const context = this.context;
  if (!context) {
    this.modelId = null;
    this.generating = false;
    return;
  }

  const wasGenerating = this.generating;
  // Detach immediately: any in-flight completion is now orphaned and its
  // finally is guarded by the load token, so it can't wedge these flags.
  this.context = null;
  this.modelId = null;
  this.generating = false;

  if (wasGenerating) await context.stopCompletion().catch(() => {});
  await context.release().catch(() => {});
}
```

> Note: the old `if (this.context === context)` re-check is removed because state is now detached
> synchronously and adoption ordering is already guarded by the load token in `load()` /
> `initAndAdopt()`.

`stop()` is unchanged and stays correct: after dispose detaches, `this.generating` is `false`, so
`stop()` no-ops; during a real generation it still calls `stopCompletion()`.

### 2. `features/chat/hooks/use-chat-session.ts`

**a) Export the interrupt helper.** Rename `interruptActiveGeneration` → `interruptGeneration` and
`export` it (it is already idempotent: returns early when nothing is active). Update its existing
caller in the `stop` action (~line 496).

**b) Interrupt-and-keep-partial on chat switch.** At the top of `loadChatMessages`, after setting
`loadingChatId`, await the interrupt so leaving a generating chat saves its partial and frees the
service:

```ts
async function loadChatMessages(chatId: string | null) {
  loadingChatId = chatId;
  await interruptGeneration(); // keep partial of the chat we're leaving, free the service

  if (!chatId) {
    // ...unchanged...
  }
  // ...unchanged...
}
```

This is required for **same-model** chat switches, where the model-load effect does not re-run and
therefore would not otherwise interrupt.

### 3. `features/chat/contexts/chat-context.tsx`

**a) Remove the two `status === 'generating'` bails.**

- Resume effect (~line 43-56): drop the `|| llamaService.getStatus().status === 'generating'`
  guard so the resumed chat's `modelId` is always applied.
- `selectModel` (~line 58-69): drop the early `if (... === 'generating') return;` so taps always
  take effect.

**b) Interrupt before every context swap.** Import the helper and call it before
`llamaService.load` / `llamaService.release` in the model-load effect (~line 73-97):

```ts
import { interruptGeneration } from '@/features/chat/hooks/use-chat-session';
```

```ts
useEffect(() => {
  let cancelled = false;

  if (!selectedModelId) {
    void interruptGeneration().then(() => llamaService.release());
    return;
  }

  void (async () => {
    const model = MODEL_CATALOG.find((item) => item.id === selectedModelId);
    const path = await getReadyModelPath(selectedModelId);
    if (cancelled) return;

    if (!model || !path) {
      await interruptGeneration();
      await llamaService.release();
      return;
    }

    await interruptGeneration();
    await llamaService.load(model, path).catch(() => {});
  })();

  return () => {
    cancelled = true;
  };
}, [loadNonce, selectedModelId]);
```

For a pure model switch (via `selectModel`, no chat change) this effect owns the interrupt; for a
chat switch, `loadChatMessages` owns it. Calling `interruptGeneration()` twice is harmless
(idempotent).

### 4. `features/chat/components/chat-input.tsx`

No change. Blocked-while-loading state is already shown.

## Circular import note

This adds `chat-context.tsx` → imports `interruptGeneration` from `use-chat-session.ts`, while
`use-chat-session.ts` already imports `useChat` from `chat-context.tsx`. The cycle is safe: both
references are **function-scoped** (inside effects/callbacks), never used at module-eval time, so
Metro/ESM live bindings resolve it. If you'd prefer to avoid the cycle entirely, extract the
active-generation state + `interruptGeneration` into a small standalone module
(e.g. `features/chat/lib/active-generation.ts`) that both import — optional, larger refactor.

## Verification

- **Resume:** open an existing chat → model loads → send → response streams (no 100s stall).
- **Model switch mid-generation:** start a response, open the model picker, pick another model →
  current response stops and is saved as `interrupted` in the original chat → new model loads →
  next send works.
- **Chat switch mid-generation (same model):** start a response, navigate to another chat → partial
  saved as `interrupted` in the original chat → service is free → send in the new chat works.
- **Chat switch mid-generation (different model):** as above, plus the new chat's model loads.
- **No wedge:** repeat switches rapidly; sending never throws `"Generation already in progress"`.
- On app restart, orphaned `generating` messages are still marked `interrupted`
  (`markInterruptedOnStartup`, `app/_layout.tsx:39`) — unchanged.

## Files touched

- `features/inference/llama-service.ts`
- `features/chat/hooks/use-chat-session.ts`
- `features/chat/contexts/chat-context.tsx`
- (no change) `features/chat/components/chat-input.tsx`
