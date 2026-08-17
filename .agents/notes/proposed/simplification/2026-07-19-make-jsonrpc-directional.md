# Agent Note: Make JSON-RPC completion and transport directional

Status: proposed

## Problem

The JSON-RPC bridge models both endpoints as symmetric peers although the shipped protocol is directional. The shared transport (now `dsh-sdk-protocol`, used by the server and by the TypeScript SDK client, which exercises the outbound-request/inbound-notification direction) still implements two halves no endpoint uses: server-originated requests and client-originated notifications.

`session/prompt` also reports one settled turn through two protocol shapes. The server emits `session.finished` and then returns the constant `{ accepted: true }`; the Python SDK discards that response and waits for the notification to recover the status. Because the response is written only after the handler returns, the notification necessarily precedes the constant response on the same stream.

The unused halves add pending-request maps, generated IDs, request queues, close-time rejection paths, response helpers, and a second completion waiter without serving a production caller.

## Proposal

Specialize each endpoint to its actual role. The server keeps inbound requests, outbound responses, and outbound notifications; the TypeScript client keeps outbound requests and inbound responses or notifications. Delete the direction no endpoint uses — server-originated requests and client-originated notifications.

Return the settled outcome directly from `session/prompt` as `{ status, reason }` after `agent.whenIdle()`. Delete `session.finished` and the constant acceptance response. `session.event` and subagent notifications still stream before the response, and durable session events remain the source for final-response reconstruction.

## Implementation plan

1. In `packages/sdk/server/src/server.ts`, replace `SessionPromptResult.accepted` with `status: 'ok' | 'error' | 'aborted'` and the captured `TurnEndReason`. `HarnessSdkJsonRpcServer.prompt()` will return `completed` as `ok`, `aborted` as `aborted`, and every other current or merge-extensible reason as `error`; reaching idle without a `turn/end` remains an invariant error. Remove only `session.finished`, leaving `session.event`, `subagent.started`, and `subagent.finished` unchanged.
2. In `packages/sdk/protocol/src/transport.ts`, narrow the shared class to the directions with consumers — inbound requests/outbound responses (the server) and outbound requests/inbound responses plus inbound notifications (the TypeScript SDK client) — removing only server-originated `request()` use and client-originated notification dispatch, or split the class into a server-side and client-side transport. Request result, method-not-found, and handler-error responses retain their current behavior and remain ordered after notifications emitted by the awaited handler.
3. Replace the symmetric transport-pair cases in `packages/sdk/protocol/tests/transport.spec.ts` with per-direction coverage, and update `server.spec.ts`, `plugin-apply.spec.ts`, and `built-scope-carrier.e2e.ts` for direct outcomes, ordering, overlap, shutdown, and the narrowed fake; update the TypeScript SDK client (`packages/sdk/client`) and its suites for response-based settlement.

## Alternatives considered

**Keep a generic symmetric JSON-RPC peer for future methods.** Server-initiated requests may eventually support interactive permissions, but no typed method or production consumer exists. The pre-release protocol can add the smallest required direction when that feature is designed instead of carrying an unexercised peer today.

**Keep `session.finished` for streaming clients.** Turn settlement is not incremental data: the request response already marks the same boundary and follows all earlier notifications on the ordered stream. A second terminal notification creates two representations that clients must reconcile.

## Acceptance criteria

- The TypeScript endpoint cannot originate requests or consume notifications.
- `session/prompt` returns the authoritative `ok`, `error`, or `aborted` outcome and reason after turn settlement.
- Session events and subagent lifecycle notifications emitted during the turn arrive before the response.
- Same-session overlap rejection, framing, multibyte input, handler errors, flush, shutdown ordering, and final-response reconstruction retain their behavior.
- TypeScript bridge tests, built JSON-RPC coverage, snapshots, and generated API documentation pass.

## Risks

This deliberately narrows the pre-release wire protocol. Raw clients listening only for `session.finished`, or embedders using the unused symmetric transport methods, must move to the prompt response. A future server-initiated request requires a new typed protocol addition rather than reusing generic dormant machinery.
