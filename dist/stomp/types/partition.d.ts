import type GenericCodec from './Codecs';
/**
 * tldts getPublicSuffix with the private list (github.io counts): the public
 * suffix of a host, or null
 */
export type PublicSuffix = (host: string) => string | null;
/**
 * The registrable domain of `host` (the public suffix and one label more),
 * or the host itself for an IP, a public suffix or a name with none
 */
export declare function registrableDomain(host: string, publicSuffix: PublicSuffix): string;
/**
 * The site of `origin` as Chrome keys partitions by it: the scheme and the
 * registrable domain, without the port
 */
export declare function siteOf(origin: string | URL, publicSuffix: PublicSuffix): string;
/**
 * The partition of a context of `origin` whose top-level document is of
 * `topOrigin`: '' when the two are one site and no frame between them is of
 * another site (`crossAncestor`), else `^<top-level site>`. A site framed by
 * a frame of another site under its own top-level page (A in B in A) is
 * keyed apart from that page, as Chrome keys it (the ancestor chain bit of
 * its storage key): its key names its own site as the top-level one, which
 * no first-party key does.
 */
export declare function partitionOf(origin: string, topOrigin: string, publicSuffix: PublicSuffix, crossAncestor?: boolean): string;
/**
 * The partition of a credentialless frame's documents (`<iframe
 * credentialless>`, and every frame under one): Chrome keys their storage,
 * cookies and network state by a nonce of the top-level document, so the
 * credentialless frames under one top-level document share a partition no
 * other context has, gone with that document. Its site part is the top's
 * site, then `!` and the nonce, which no site has.
 */
export declare function credentiallessPartition(topOrigin: string, nonce: string, publicSuffix: PublicSuffix): string;
/** a cookie partition key (partitionSite) of a credentialless frame's partition */
export declare function ephemeralKey(key: string | undefined): boolean;
/** the top-level site a partition names, or null for a first-party one */
export declare function partitionSite(partition: string): string | null;
/** the route kind of a worker of `type` in `partition` (`unisolated`: its creator is not isolated natively) */
export declare function workerKind(type: string, partition: string, codec: GenericCodec, unisolated?: boolean): string;
/** whether a worker's route kind says its creator is not cross-origin isolated (workerKind) */
export declare function workerKindUnisolated(kind: string): boolean;
/** the partition a worker's route kind names, '' for none */
export declare function workerKindPartition(kind: string, codec: GenericCodec): string;
/**
 * What the document that embeds a frame says of itself in the frame's
 * route, when the host's page is cross-origin isolated (src/isolation.ts
 * Embedder): the service worker decides by it whether the frame's document
 * loads there and whether it is isolated
 */
export interface NestedEmbedder {
    /** the embedding document's origin, when it is not the top's */
    origin?: string;
    coep: boolean;
    group: boolean;
    delegates: 'self' | 'any' | 'none';
    origins?: string[];
    /** the frame is a credentialless one (`<iframe credentialless>`) */
    credentialless?: boolean;
    /** the navigation is not the frame's first (see `b` below) */
    later?: boolean;
}
/**
 * A nested document's route marker: the top origin, then a path of flags:
 * `x` when a frame between the document and the top is of another site than
 * the top (its partition then names the top's site whatever its own: see
 * partitionOf), and of the document that embeds it (`embedder`) `c` when it
 * has an embedder policy, `g` when its top-level document made a
 * cross-origin isolated group, `s` or `a` when its `cross-origin-isolated`
 * permission reaches a frame of its own origin, or of any, `l` when the
 * frame is a credentialless one, and `b` when the navigation is not the
 * frame's first: the service worker answers a first one that will not be
 * isolated in an isolated embedder with a document that comes back with
 * `b` (src/server/rewrites.ts). With the site pool, a second path segment
 * `~` and the sandbox tokens the frame has (without their `allow-`, joined
 * by `.`) when it is sandboxed: a frame of another slot than its parent
 * cannot read its frame element's sandbox (DocumentClient.sandboxFlags).
 * `o`, whatever the host's page, when the top-level document sent COOP
 * `same-origin`: a frame of another origin than it opens its popups
 * without an opener (dom/openerFacts.ts opensWithoutOpener), which the frame
 * cannot ask a top of another slot. A path segment `!` and a nonce when
 * the frame is credentialless, or a frame above it is: its partition is
 * that nonce's (credentiallessPartition). The query, when
 * there is one, is the embedder's origin (empty when it is the top's) and
 * the other origins the permission reaches. Read as an origin, the marker
 * is the top origin either way, and without an embedder it is what it was
 * before there were any.
 */
export declare function nestedMark(topOrigin: string, crossAncestor: boolean, embedder?: NestedEmbedder | null, sandbox?: Iterable<string> | null, topOpenerSameOrigin?: boolean, nonce?: string | null): string;
/** a nested route's marker as nestedMark made it, or null */
export declare function parseNestedMark(mark: string): {
    top: string;
    crossAncestor: boolean;
    embedder: Required<NestedEmbedder>;
    topOpenerSameOrigin: boolean;
    /** the frame's sandbox tokens, null for a frame without a sandbox or a mark without them */
    sandbox: string[] | null;
    /** the credentialless partition's nonce, null for a frame that is none */
    nonce: string | null;
} | null;
/**
 * The partition a route kind names for a context of `origin`: a nested
 * document's (its top origin is in the kind) or a partitioned worker's; ''
 * for any other (a top-level document, a first-party worker)
 */
export declare function kindPartition(kind: string, origin: string, publicSuffix: PublicSuffix, codec: GenericCodec): string;
