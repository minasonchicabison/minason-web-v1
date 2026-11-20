/**
 * What the browser makes of cross-origin isolation where engines differ
 * (measured natively in Chrome 157, Firefox 157 and WebKitGTK 2.52):
 * - `credentialless`: COEP `credentialless` is an embedder policy (Chrome,
 *   Firefox). WebKit reads it as none: a page that sends it is not
 *   isolated, and a frame or worker that sends it does not load under one
 *   that is.
 * - `permission`: the `cross-origin-isolated` permission decides whether a
 *   frame of an isolated page is isolated (Chrome). Firefox and WebKit
 *   isolate every frame of an isolated page, whatever its `allow` and
 *   Permissions-Policy say and whatever its origin.
 * - `dip`: a Document-Isolation-Policy isolates the document that sends it
 *   (Chrome).
 * The service worker asks the controller's document, which asks the browser
 * (src/controller/isolationProbe.ts), only when the answer would change what
 * it decides (byEngine).
 */
export interface IsolationEngine {
    credentialless: boolean;
    permission: boolean;
    dip: boolean;
}
/** Chrome's rules, by which the service worker decides when the browser could not be asked */
export declare const CHROMIUM: IsolationEngine;
/**
 * What `decide` makes of a response by the rules of the browser this runs
 * in: by Chrome's when every engine would decide the same (the browser is
 * not asked), else by what `engine` says the browser is
 */
export declare function byEngine<T>(engine: () => Promise<IsolationEngine>, decide: (engine: IsolationEngine) => T): Promise<T>;
/**
 * The route the controller's probe loads (src/controller/isolationProbe.ts):
 * `<directory>coi~probe/<kind>`, answered by the service worker itself: `c`
 * a worker's script with COEP credentialless that posts its
 * `crossOriginIsolated`; `p` and `d` a document with require-corp (and for
 * `d` a Document-Isolation-Policy) whose title is this name and whose
 * script posts the name and its `crossOriginIsolated` to its parent
 * (`coi~probetrue`)
 */
export declare const ISOLATION_PROBE = "coi~probe";
/**
 * The embedder policy the host's page and every document and worker the
 * service worker serves to it are sent with. Each of them loads only what
 * is the proxy's own (the worker answers every request a proxied page
 * makes, of the proxy's origin), so it refuses nothing `credentialless`
 * would let in, and WebKit, which has no `credentialless`, isolates a page
 * under it and loads a frame that has it.
 */
export declare const SERVED_EMBEDDER_POLICY = "require-corp";
export type EmbedderPolicy = 'unsafe-none' | 'require-corp' | 'credentialless';
/** a response's Cross-Origin-Embedder-Policy (`header`: the header's value, or null) */
export declare function embedderPolicy(header: string | null, engine?: IsolationEngine): EmbedderPolicy;
/** whether a Cross-Origin-Opener-Policy is `same-origin`, the one value that isolates with an embedder policy */
export declare function openerSameOrigin(header: string | null): boolean;
/** whether a Document-Isolation-Policy isolates the document by itself */
export declare function documentIsolates(header: string | null, engine?: IsolationEngine): boolean;
/**
 * Whether a document's own Permissions-Policy (or the older Feature-Policy,
 * when there is no Permissions-Policy) lets the document itself, of
 * `origin`, be cross-origin isolated. Without either the default allowlist
 * (`self`) does.
 */
export declare function policyAllowsSelf(permissionsPolicy: string | null, featurePolicy: string | null, origin: string): boolean;
/** the response headers isolation is decided by */
export interface IsolationHeaders {
    coop: string | null;
    coep: string | null;
    dip: string | null;
    permissionsPolicy: string | null;
    featurePolicy: string | null;
}
export declare function isolationHeaders(headers: Headers): IsolationHeaders;
/**
 * What a nested document's route says of the document that embeds it
 * (src/partition.ts nestedMark)
 */
export interface Embedder {
    /** the embedding document's origin */
    origin: string;
    /** it has an embedder policy: a frame's document without one does not load */
    coep: boolean;
    /** its top-level document sent COOP same-origin and an embedder policy */
    group: boolean;
    /**
     * whom the embedder's `cross-origin-isolated` permission reaches, by its
     * own state and the frame's `allow`: a document of its own origin
     * (`self`, the default allowlist), of any origin (`any`), or none; the
     * origins the attribute names besides are in `origins`
     */
    delegates: 'self' | 'any' | 'none';
    origins: string[];
    /**
     * the frame is a credentialless one: its document loads without a policy
     * of its own, and is isolated when the permission reaches it (measured)
     */
    credentialless: boolean;
}
/**
 * What a document is by its own headers and its embedder, natively: whether
 * its top-level document made an isolated group, its own embedder policy,
 * whether the `cross-origin-isolated` permission reaches it
 * (`document.featurePolicy` says so, isolated or not), and whether it is
 * cross-origin isolated
 */
export interface DocumentIsolation {
    group: boolean;
    coep: EmbedderPolicy;
    policy: boolean;
    isolated: boolean;
}
/** a top-level document's: COOP `same-origin` with an embedder policy makes the group */
export declare function topLevelIsolation(headers: IsolationHeaders, origin: string, engine?: IsolationEngine): DocumentIsolation;
/**
 * A frame's document of `origin`: the group is its top's, the permission
 * reaches it when its embedder's reaches its origin and its own policy does
 * not give it up, and it is isolated when both hold (it loaded there, so it
 * sent an embedder policy), or by a Document-Isolation-Policy of its own
 */
export declare function nestedIsolation(headers: IsolationHeaders, origin: string, embedder: Embedder, engine?: IsolationEngine): DocumentIsolation;
/**
 * What the shell tells a document's client of it (src/rewriteHTML.ts): `g`
 * the group, `c` an embedder policy, `p` the permission, `n` it is not
 * cross-origin isolated natively. The client says it on in the routes of the
 * frames the document makes.
 */
export declare function isolationFacts(isolation: DocumentIsolation): string;
/**
 * Whom an iframe's `allow` attribute lets have the `cross-origin-isolated`
 * permission, of a document that has it: `self` without a directive (the
 * default allowlist), else what the directive lists: `*`, 'self', 'src' (the
 * origin of `src`, which a directive without a value means too), 'none',
 * origins
 */
export declare function allowDelegates(allow: string | null, src: string | null): Pick<Embedder, 'delegates' | 'origins'>;
/** whether the embedder's permission reaches a frame's document of `origin` */
export declare function delegatedTo(embedder: Embedder, origin: string): boolean;
/**
 * Whether Chrome refuses to load a frame's document under an embedder with
 * an embedder policy: the document sent none, or it is of another origin
 * and its Cross-Origin-Resource-Policy does not let the embedder have it
 * (measured: `cross-origin`, or `same-site` for a same-site embedder; a
 * `credentialless` embedder asks the same of a frame). A redirect on the
 * way (`redirect`) needs no embedder policy, only that resource policy.
 */
export declare function embedderRefuses(headers: Headers, origin: string, embedder: Embedder, sameSite: boolean, redirect?: boolean, engine?: IsolationEngine): boolean;
/**
 * What the service worker adds to a document it serves to a host whose page
 * is cross-origin isolated. `severed`: a top-level document (a popup) that
 * natively leaves its opener's browsing context group (src/coop.ts
 * switchesGroup): it is served without the COOP that keeps it in the
 * host's group, and with a Document-Isolation-Policy when it is isolated
 * natively (Chrome 137 and later honour it), since it is then out of the
 * group that isolated it.
 */
export declare function isolationResponseHeaders(headers: Headers, { isolated, topLevel, severed, }: {
    isolated: boolean;
    topLevel: boolean;
    severed?: boolean;
}): void;
/**
 * Whether a document's or worker's embedder policy refuses it a no-cors
 * response of another origin: under `require-corp` one without a
 * Cross-Origin-Resource-Policy that lets it be had (`cross-origin`, or
 * `same-site` from its own site). Under `credentialless` the request went
 * without credentials instead and the response passes.
 */
export declare function embedderPolicyBlocks(policy: EmbedderPolicy, headers: Headers, sameSite: boolean): boolean;
