// The Agent-scope primitive now lives in contract/scope.ts (it is a
// cross-domain scope face consumed by the sessions domain and the render
// surface); re-exported here so existing consumers, index.ts, and the scope
// test keep their import site.
export * from '../contract/scope.ts'
