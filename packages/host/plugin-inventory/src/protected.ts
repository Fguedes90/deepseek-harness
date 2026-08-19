/**
 * The modules a trusted client may never disable through this seam.
 * @module @deepseek-ai/dsh-host-plugin-inventory/protected
 */

/**
 * Module specifiers whose entries refuse a disable request.
 *
 * Membership criterion, and the only one: the browser needs the module to
 * reach this Remote and re-enable what it just disabled. That covers the
 * command channel from the browser to the Host — the web server, the RPC
 * gateway and its Typert registry, the forwarded-event assembly, the browser
 * transport and client runtime — plus the Settings surface the request is
 * issued from, plus this projection itself. The surface includes what it is
 * built out of: the shell renders nothing without the `theme` service it
 * injects, the tab registers nothing without the `locale` service it injects
 * or the `settings.plugins.tab` slot it registers into. Disabling one of
 * those would remove the affordance that undoes the change, so the request is
 * refused before the Loader sees it.
 *
 * Everything else stays disableable, including modules the product needs to
 * work at all: a user who turns off the agent still has a Settings tab that
 * turns it back on. Recovery from any state remains possible by editing the
 * profile's `cordis.patch.yml` directly; this set exists so the graphical
 * surface cannot destroy its own undo path.
 *
 * A security invariant, not a tunable: it is a fixed constant rather than a
 * `Config` field, because a deployment that could widen or empty it could also
 * hand a browser the ability to sever its own control channel.
 */
export const PROTECTED_MODULES: ReadonlySet<string> = new Set([
  '@deepseek-ai/dsh-api-gateway',
  '@deepseek-ai/dsh-api-remotes',
  '@deepseek-ai/dsh-client-connection',
  '@deepseek-ai/dsh-client-locale',
  '@deepseek-ai/dsh-client-modules',
  '@deepseek-ai/dsh-client-runtime',
  '@deepseek-ai/dsh-client-ui-layout',
  '@deepseek-ai/dsh-client-ui-settings',
  '@deepseek-ai/dsh-client-ui-settings-plugin-inventory',
  '@deepseek-ai/dsh-client-ui-settings-plugins',
  '@deepseek-ai/dsh-client-ui-sidebar',
  '@deepseek-ai/dsh-client-ui-theme',
  '@deepseek-ai/dsh-cordis-client-runner',
  '@deepseek-ai/dsh-host-apiproxy',
  '@deepseek-ai/dsh-host-plugin-inventory',
  '@deepseek-ai/dsh-host-webserver',
  '@deepseek-ai/dsh-typert-loader',
  '@deepseek-ai/dsh-typert-registry',
  '@deepseek-ai/dsh-web-app',
  '@deepseek-ai/dsh-web-app/startup',
])
