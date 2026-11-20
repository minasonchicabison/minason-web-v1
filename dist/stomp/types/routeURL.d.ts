import GenericCodec from './Codecs';
import { type Assets, type Config } from './config';
import StompURL, { openFragment, sealedFragmentText } from './StompURL';
export { openFragment, sealedFragmentText };
export declare const ROUTE_PROTOCOLS: string[];
export declare function setBlobOrigins(page: string, proxy: string, key?: string): void;
/** what setBlobOrigins took, `[page, proxy]` and the key of a page of the proxy's origin, or null (the rewriter library is told them per call) */
export declare function blobOriginPair(): [string, string, string?] | null;
/** a page-origin blob: URL as the proxy's; anything else as it is */
export declare function proxyBlobURL(url: string): string;
/** a proxy-origin blob: URL as the page's; anything else as it is */
export declare function pageBlobURL(url: string): string;
/** the browser's UUID of a blob: URL a page of `origin` names by `uuid` (the service worker: BLOB_ROUTE) */
export declare function proxyBlobUUID(uuid: string, origin: string, proxy: string, key: string): string;
/**
 * The proxy's origins besides the realm's own that a config names: with the
 * site pool (docs/site-pool.md) a slot's hub, the hub's controller when that
 * is a frame of another origin (isolation mode: SitesConfig.home) and every
 * slot (Config.sites), or a hub's slots (Config.slotOrigins). A route on one
 * is a route, and a route to one is the proxy's own origin. Never a reason
 * to treat one as the document's origin: the slots are other origins to the
 * emulated same-origin policy.
 */
export declare function proxyOrigins(config: Pick<Config, 'sites' | 'slotOrigins'>): string[];
export declare function addRouteScope(origin: string, scope: string): void;
/** every route scope known here, as `<origin><scope>` (a rewrite worker is told the service worker's) */
export declare function routeScopeList(): string[];
/** take on route scopes as routeScopeList gave them */
export declare function addRouteScopes(scopes: string[]): void;
/** the route scopes as routeScopeList gave them, and no others (the rewriter library, for each caller) */
export declare function setRouteScopes(scopes: string[]): void;
/**
 * The real URL a route of a known scope stands for, through any depth (a
 * route of a route of a URL is that URL), with the outermost hash; null when
 * `url` is not a route. Any controller id and any kind of the scope; decoded
 * with `codec`, so a foreign controller's route with another codec stays as
 * it is. An inline document's address names a token, not a URL.
 *
 * A codec without a key (plain, base64) decodes every controller's routes
 * alike, a STomp's the page runs among them (proxy-ception,
 * docs/proxyception.md), whose routes are of the proxy's origin too: given
 * `own`, the caller's address (`/stomp/<id>/`, or with its origin), such a
 * codec takes only routes of that id for its own, and leaves another id's
 * (and a link's route, which names none) to the STomp that made them.
 */
export declare function unwrapRoute(url: URL, codec: GenericCodec, own?: string): URL | null;
/**
 * The real URL of a link route's part after `<scope>~/` (src/visited.ts,
 * which parses the context as well), with its fragment; null when it does
 * not decode to one
 */
export declare const linkRouteURL: (rest: string, codec: GenericCodec) => URL | null;
/**
 * In a page or a worker: the route of a blob: URL (the browser's form) a
 * load of `kind` takes when the page's bytes in it were never rewritten
 * (src/inject/modules/ObjectURL.ts), or null to load it as it is. `given`
 * is the URL as the page gave it.
 */
declare let blobRoute: ((kind: string, href: string, given: string) => string | null) | null;
/**
 * One per bundle: the realm that runs it sets it, another realm the bundle
 * hooks (a javascript: or about:blank frame of the page's) only when none
 * is set, as its client goes with its frame
 */
export declare function setBlobRoute(route: typeof blobRoute, own: boolean): void;
export declare function routeURL(resourceType: string, url: StompURL): string;
/**
 * The name of the one entry a GET form's submission carries through the
 * proxy (the inject's FormQuery module): its value is the form's query,
 * sealed, so the route reads `?=<sealed>`
 */
export declare const FORM_QUERY_NAME = "";
/**
 * The query a route's own query stands for (`?` and the text, as a URL's
 * `search`): a GET form's sealed query opened, anything else (a query the
 * browser wrote after the route as it was) as it is
 */
export declare function formQuery(codec: GenericCodec, search: string): string;
/** whether routes of `kind` are documents (src/rewriteHTML.ts routeHTML), whose fragment is sealed */
export declare function isDocumentKind(kind: string): boolean;
/**
 * Raw binary data
 */
export declare function routeBinary(resource: StompURL): string;
/**
 * A srcset or picture candidate: binary data too, under its own kind, since
 * Chrome blocks an insecure one where it upgrades an insecure `src`
 * (src/mixedContent.ts) and the worker sees the destination `image` for both
 */
export declare function routeImageSet(resource: StompURL): string;
/**
 * navigator.postBeacon request
 */
export declare function routeXHR(resource: StompURL): string;
/**
 * The route of a request a page's policy refused (src/server/rewrites.ts),
 * and of an EventSource's, which a network error would have reconnect
 */
export declare const REFUSED_ROUTE = "refused";
export declare const REFUSED_SOURCE_ROUTE = "refusedsource";
/**
 * Where a worker's request its policy refuses goes instead (a fetch, an
 * XMLHttpRequest, an EventSource, an import, a worker): the service worker
 * answers it with a network error, so the browser fails it as it fails a
 * refused one, with its own error, and an error that names the route
 * names `resource` (a local scheme's names no URL)
 */
export declare function routeRefused(resource: StompURL, eventSource?: boolean): string;
/**
 * Note the URL a document bundle was loaded from (src/inject/dom/entry.ts):
 * a shell this realm makes (a srcdoc frame's, a document it writes) names
 * the same file of the same build, as the service worker's shell named it,
 * whichever service worker is now in charge
 */
export declare function ownDocumentBundle(src: string): void;
/**
 * The document bundle's file for `config`, as a shell names it
 * (injectDocumentJS): its name and its hash (version.ts DOCUMENT), which a
 * host may let browsers keep for good and the service worker keeps
 * (serviceWorker.ts documentBundle), so no document waits for a
 * revalidation of it before its first script
 */
export declare function injectDocumentFile(config?: Config): string;
export declare function injectDocumentJS(url: StompURL, config?: Config): string;
export declare function injectWorkerJS(url: StompURL, config?: Config): string;
/**
 * The light rewriter library asset (a top's shell loads it,
 * src/rewriteHTML.ts; a worker or sandboxed frame fetches it,
 * src/inject/rewriter.ts), by the URL the controller fetched it with when it
 * started: the same cache entry
 */
export declare function rewriterLibJS(url: StompURL, config?: Config): string;
/**
 * The rewriter's wasm core module, by the URL the controller fetched it with
 * (src/controller/index.ts), so a page's synchronous fetch of it on a cold
 * rewrite (src/inject/rewriter.ts) is answered from the HTTP cache
 */
export declare function coreWasm(url: StompURL, config?: Config): string;
/**
 * The core module's file as it is asked for: its name and its hash
 * (version.ts CORE), so that a host may let browsers keep it for good and
 * a top's synchronous fetch of it is answered by the HTTP cache without a
 * revalidation round trip to the host
 */
export declare function coreFile(assets?: Assets): string;
/** the rewriter library's file as it is asked for: its name and its build's hash */
export declare function libraryFile(assets?: Assets): string;
/** the WebRTC worker's script, and the stack's wasm module it loads (docs/webrtc-over-wisp.md) */
export declare function rtcWorkerJS(url: StompURL, config?: Config): string;
export declare function rtcModule(url: StompURL, config?: Config): string;
/** the WebRTC stand-in library (src/inject/dom/rtcStack.ts), asked for by this build */
export declare function rtcStackJS(url: StompURL, config?: Config): string;
export declare function geckoXHR(url: StompURL): string;
export declare function queueXHR(url: StompURL): string;
export interface ParsedRoutedURL {
    /** the route's kind, without its integrity and cache marks */
    resource: string;
    url: StompURL;
    /** the integrity the load carries (src/sri.ts), '' for none */
    integrity: string;
    /** the cache mark of the document that routed it (src/memoryMark.ts), '' for none */
    cacheMark: string;
}
export declare function parseRoutedURL(routed: string, codec: GenericCodec, directory: string): ParsedRoutedURL;
export declare interface DataURI {
    attributes: string[];
    mime: string;
    data: string;
}
export declare function parseDataURI(pathname: string): DataURI;
export declare function createDataURI(data: DataURI): string;
