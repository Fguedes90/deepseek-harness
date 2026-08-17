# Agent Note: Config-start-failed dispatch stays bespoke; simplification is not available

Status: proposed

## Problem

`packages/core/agent-loop/src/index.ts` declares the `agent-loop/config-start-failed` event in the `Events` interface (`index.ts:183`) and emits it from `reportConfiguredStartupFailure` (`index.ts:385-402`). The emit uses a bespoke dispatch: `this.ctx.events.dispatch('emit', args)` (`index.ts:394`) iterated with a per-callback `try/catch` that normalizes both a synchronous throw (`index.ts:401`) and an asynchronous rejection (`index.ts:396-399`), logging each. Its doc comment justifies the signal: "Consumers that buffer work for the configured identity use this transient signal to reject that work instead of waiting forever."

The only `ctx.on('agent-loop/config-start-failed', …)` registrations in the repository are in `packages/core/agent-loop/tests/config-session-id.spec.ts` (lines 165, 227-231, 265-269, 302, 473) and `packages/core/agent-loop/tests/resume.spec.ts` (lines 885, 918, 929). With no production subscriber, the bespoke loop looks like machinery for a signal nothing real consumes.

## Proposal

Keep the signal (it is a real failure fact, and the same failure is already logged by `this.ctx.logger.warn(...)` at `index.ts:391`). Do **not** drop the bespoke dispatch to a plain emit: the guarantee it provides is load-bearing for the tests, so the simplification is currently unavailable. Revisit only when a real production subscriber exists and its isolation semantics are specified.

### What the bespoke loop provides that a plain emit does not

Cordis's plain `ctx.emit` is `this.dispatch('emit', args).map(cb => cb(...args))` (`vendor/cordis/src/events.ts:194-196`). That implementation:

- **Stops at the first synchronous throw.** `Array.prototype.map` aborts when a callback throws, so a throwing listener prevents every subsequent listener from running.
- **Never catches asynchronous rejections.** Returned promises are not awaited or handled, so a rejecting listener becomes an unhandled rejection.

The bespoke loop instead (a) isolates each listener — a throwing or rejecting listener does not stop the others, (b) normalizes async rejections into logged warnings, and (c) emits specific per-listener warning strings: `config-start-failed listener threw: …` and `config-start-failed listener rejected: …`.

### Why the guarantee is load-bearing

`config-session-id.spec.ts:226-288` registers three listeners in order — one that throws synchronously (`throw listenerFailure`), one that rejects asynchronously (`Promise.reject(asyncListenerFailure)`), and one that pushes the failure — then asserts both that the specific warn strings were logged (`listener threw` / `listener rejected`) and that the third listener ran (`failures` received the entry). A plain emit would propagate the first listener's throw out of `.map`, so the third listener would never run (`failures` empty) and the two warn strings would not appear. The test would fail. The isolation and rejection-normalization guarantees are exactly what the test pins, so the proposal to drop the machinery to a plain emit is downgraded: it cannot proceed without discarding the isolation contract and rewriting the test.

## Alternatives considered

### Why not replace the loop with `ctx.parallel`?

`ctx.parallel` (`vendor/cordis/src/events.ts:183-191`) uses `Promise.allSettled` over `dispatch('emit', args).map(async cb => cb(...args))`, which does isolate both sync throws (wrapped into rejections) and async rejections. But it (a) awaits all listeners, changing the current fire-and-forget timing, (b) throws one `AggregateError` at the end instead of logging each listener failure, and (c) drops the exact per-listener warn strings the test asserts. Adopting it would rewrite `config-session-id.spec.ts` and discard the per-listener logging contract, so it is no cleaner than keeping the bespoke loop.

### Why not drop the signal entirely?

It is a real failure fact already logged; a future identity-bound consumer (the doc comment's buffering case) would need it, and the tests exercise it. Removing it saves no code (the failure path stays) and removes a documented extension point.

## Acceptance criteria

- The event declaration, the emit, and the bespoke per-listener dispatch remain unchanged.
- `config-session-id.spec.ts` and `resume.spec.ts` keep passing without modification.
- A follow-up note owns when the machinery can be reduced: the moment a real production subscriber specifies its isolation semantics, or a deliberate test change relaxes the load-bearing assertions.

## Risks

- Keeping the bespoke loop preserves a small amount of hand-rolled dispatch that a future maintainer may again propose simplifying; this note records why it is currently load-bearing so the simplification is not re-litigated without a plan for the tests.
- No risk from the current state itself: the loop is correct, logged, and tested.
