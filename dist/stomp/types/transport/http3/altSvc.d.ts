/** one advertised HTTP/3 endpoint for an origin */
export interface AltService {
    /** the host QUIC connects to; always the origin's own (see parseAltSvc) */
    host: string;
    port: number;
    /** ms since the epoch after which the entry is stale */
    expires: number;
    /** where it was learned */
    source: 'alt-svc' | 'dns' | 'force';
}
/** `clear`, or the h3 alternatives of one Alt-Svc field value */
export type AltSvcValue = 'clear' | {
    port: number;
    maxAge: number;
}[];
/**
 * The HTTP/3 alternatives an Alt-Svc field value names for `originHost`.
 * Only `h3` counts (Chrome dropped the drafts, `h3-29` and the like), and
 * only an alternative on the origin's own host: an alt-authority naming
 * another host would send the origin's requests to a server the page never
 * named, so it is ignored, as is anything malformed. `null` when the value
 * names nothing usable.
 */
export declare function parseAltSvc(value: string, originHost: string): AltSvcValue | null;
/** per-origin alternative services and the broken ones, keyed by `URL.origin` */
export declare class AltSvcCache {
    #private;
    constructor(now?: () => number);
    /** the usable HTTP/3 alternative for `origin`, if any */
    lookup(origin: string): AltService | null;
    /** whether `origin` has an entry at all (fresh or broken), so DNS is not asked again */
    known(origin: string): boolean;
    /**
     * A response's Alt-Svc for `origin` replaces what the origin advertised
     * before; `clear` forgets it. A response without the field changes
     * nothing.
     */
    learn(origin: string, hostname: string, values: string[]): void;
    /** an entry from somewhere other than Alt-Svc (an HTTPS record, `force`); never replaces one the server sent */
    add(origin: string, entry: AltService): void;
    /**
     * QUIC to `origin` failed: leave it alone for a while, longer each time.
     * `refused` when the wisp relay closed the UDP stream before anything
     * came back on it, which says what that relay does, not what the origin
     * does (forgetRefused).
     */
    markBroken(origin: string, refused?: boolean): number;
    /** a new wisp connection may reach another relay: what the old one refused is tried again */
    forgetRefused(): void;
    /** QUIC to `origin` worked: the backoff starts over */
    confirm(origin: string): void;
    /** a snapshot for `Http3Transport.info()` */
    entries(): {
        origin: string;
        entry: AltService;
        brokenUntil: number | null;
        refused: boolean;
    }[];
}
