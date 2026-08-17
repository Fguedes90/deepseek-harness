// PendingWait / pending-interaction types now live in contract/pending.ts
// (the session snapshot contract references them); re-exported here so
// existing consumers keep their import site.
export * from '../contract/pending.ts'
