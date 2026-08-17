// Latency/throughput folds live in contract/turn-metrics.ts (shared by the
// settled turn footer and StatsLine); this file re-exports them for chat-domain
// consumers.
export * from '../contract/turn-metrics.ts'
