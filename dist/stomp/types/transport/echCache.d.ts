/** what epoxy-transport's EchCache keeps (its EchCacheEntry) */
export interface EchCacheEntry {
    key: string;
    ech: Uint8Array | null;
    until: number;
}
/** what epoxy-transport's `ech_cache` option takes */
export interface EchCache {
    load(): Promise<EchCacheEntry[]>;
    put(entry: EchCacheEntry): void;
}
/** the most kept, the ones that go stale soonest dropped past it (Chrome's host cache keeps 1000) */
export declare const ECH_KEPT = 1000;
/** this realm's store, for EpoxyTransport's `ech_cache` */
export declare function echCache(): EchCache;
/**
 * The descriptor's options with `ech_cache` added to the first, when it
 * asks for `ech_dns` and names no cache of its own (a descriptor crosses to
 * the transport worker as data, so the store is added where the transport
 * is made)
 */
export declare function withEchCache(options: unknown[]): unknown[];
