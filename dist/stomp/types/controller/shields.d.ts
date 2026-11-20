import type { ShieldsMode, SiteShields } from '../blocker/types';
export type { ShieldsMode, SiteShields };
/**
 * A new host's shields: the "goodies on" defaults (shields up, the blocker on
 * in standard mode, HTTPS upgraded, fingerprinting protected, third-party
 * cookies blocked). The two destructive controls, blocking the page's own
 * scripts, and forgetting the site on close, default off, as Brave's do.
 */
export declare const DEFAULT_SHIELDS: Omit<SiteShields, 'host'>;
export interface Shields {
    /** the host's shields, the defaults when it has no stored entry */
    get(host: string): SiteShields;
    /** whether the host has a stored entry (the demo seeds one on first visit) */
    has(host: string): boolean;
    /** merge a patch into the host's shields, push to the worker, return the new state */
    set(host: string, patch: Partial<Omit<SiteShields, 'host'>>): SiteShields;
    /** every stored entry (for the host to persist) */
    all(): SiteShields[];
    /** replace the whole set (on startup, from what the host persisted) and push */
    replace(list: SiteShields[]): void;
}
/**
 * Make a shields manager. `push` sends the whole list wherever it needs to go
 * (the service worker, or the controller frame); `onChange`, when given, is
 * called after each `set` with the host and its new state (the demo persists
 * from it). Both run after the manager's own state is updated.
 */
export declare function createShields(push: (list: SiteShields[]) => void, onChange?: (host: string, state: SiteShields) => void): Shields;
