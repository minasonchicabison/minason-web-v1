import { type IDBPDatabase } from 'idb';
/** what a host gives for the site pool */
export interface SitePoolInit {
    /**
     * The slots: origins that serve `directory` as the host page's origin
     * does, none of them the host page's own, all of its site (another port
     * of its host: nothing is partitioned between them and the cookies the
     * server sees are shared). A site keeps the slot it was given while
     * that origin is in the list, in any order and whatever else the list
     * gains or loses; a site whose slot is taken out is given another, and
     * what it stored stays in the one taken out.
     */
    origins: string[];
}
/** the pool's origins, checked: http(s) origins, each once, none the page's own */
export declare function poolOrigins(init: SitePoolInit, own: string): string[];
/**
 * Which slot shows which site. An assignment is kept for good, in the host
 * origin's IndexedDB, so every tab of the host agrees and a later visit
 * finds the site's data where it left it: by slot origin, never dropped,
 * so a changed list keeps every site whose slot it still has, and a site
 * is one record, read by its key, however many there are. A site seen
 * for the first time gets a slot no site has yet; when there is none, the
 * slot that was used longest ago in this page, never the one the
 * navigation comes from when there is another: a frame of another site is
 * then in another process than the document that embeds it, and with more
 * sites than slots the ones that share a process are the ones farthest
 * apart in time. What this page read or gave stays its answer while it
 * lives (an assignment moves only when a list has lost its slot).
 */
export declare class SiteSlots {
    #private;
    readonly origins: string[];
    constructor(origins: string[], storage?: Storage | null, db?: Promise<IDBPDatabase | null>);
    /** the slot of `site` when it has one */
    known(site: string): Promise<string | null>;
    /**
     * The slot `site` is shown from, given one now when it has none. `from`
     * is the slot of the document the navigation comes from, when it comes
     * from one; a slot in `dead` (one that did not answer from this network)
     * is given to no new site. Rejects when every slot is dead.
     */
    originOf(site: string, from?: string, dead?: Set<string>): Promise<string>;
    /**
     * The slot that took a navigation last, in any tab of the host and any
     * visit, when it is one of this pool's and not dead: the slot of the
     * site a page is likely to show again
     */
    last(dead?: Set<string>): string | null;
    /** whether a navigation of this page was shown from `origin` */
    usedHere(origin: string): boolean;
    /**
     * The slot the next site seen for the first time would get, assigning
     * nothing: from the slot used last in this page (a frame or a link of
     * the page shown last), or from none before any was used. Null when
     * every slot is dead.
     */
    next(dead?: Set<string>): Promise<string | null>;
}
/**
 * The host origin's kept assignments, with what an earlier build kept in
 * its localStorage read in; null where the page has no IndexedDB (every
 * assignment is then this page's own)
 */
export declare function keptDatabase(storage: Storage | null): Promise<IDBPDatabase | null>;
/**
 * A host frame's `allow` for a frame that shows the slots' documents: as
 * the host wrote it (`given`), with every slot added where the host let a
 * frame of its own origin have the feature (`'src'`, the default, `'self'`
 * or the host's origin), and each feature the host page itself has that
 * the attribute does not name delegated to the slots. Without a pool the
 * proxied top is of the host page's origin and has those by inheritance;
 * a slot is another origin to the browser, which gives it none of the
 * features whose default allowlist is `self` (the camera, geolocation,
 * WebAuthn's create and get, speaker selection) unless the frame's
 * container policy names it.
 */
export declare function slotAllow(given: string | null, slots: string[], own: string, features: string[]): string;
