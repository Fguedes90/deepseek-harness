// Notifier now lives in contract/notifier.ts (a cross-domain subscription
// primitive shared by the Session and Workspace object layers); re-exported
// here so existing consumers and the notifier test keep their import site.
export { Notifier } from '../contract/notifier.ts'
