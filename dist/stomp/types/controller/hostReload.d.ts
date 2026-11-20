import type { HostReload } from '../transport/messages';
/**
 * `no-cache` when the host page was reloaded, `reload` when that was a hard
 * reload, undefined otherwise
 */
export declare function hostReload(): Promise<HostReload | undefined>;
