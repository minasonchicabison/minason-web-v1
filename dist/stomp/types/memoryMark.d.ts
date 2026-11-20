/** what follows a route's kind when it carries the mark of its document's site */
export declare const CACHE_MARK = ";m=";
/**
 * The route kinds the mark goes on: what a renderer keeps in its memory
 * cache that the service worker hands out as the origin sent it (images,
 * fonts, text tracks, a video's poster), never a body it rewrites (scripts
 * and stylesheets stay no-cache: a rewrite is the worker's output)
 */
export declare const MARKED_KINDS: ReadonlySet<string>;
/**
 * The policy directives that judge the loads of MARKED_KINDS: a document
 * with a policy that governs one of them (directly or through default-src)
 * marks none of its routes, and the worker hands it no route's load with the
 * origin's caching headers. Natively the renderer judges every load by the
 * document's policy before its memory cache answers it; here the worker
 * judges a load by its real URL (the browser's copy of the policy cannot
 * name the hosts), and a load the renderer's memory cache answers never
 * reaches the worker.
 */
export declare const MARK_DIRECTIVES: string[];
/** a mark as the worker makes them (base64url, never a `/`, `;` or `#`) */
export declare const CACHE_MARK_SHAPE: RegExp;
/**
 * The mark of an opaque origin's document (a frame sandboxed without
 * allow-same-origin, a data: document), which no site's mark is (those are
 * longer): natively its renderer and its HTTP cache are its own, and its
 * loads share nothing with its site's documents. The worker cannot tell
 * such a document's image or font load from its site's otherwise (the load
 * carries no header of the inject's). A page that wrote it on a route of
 * its own would only lose the caches.
 */
export declare const OPAQUE_MARK = "o";
export declare function setCacheMarkSource(source: (() => string) | null): void;
/** the mark this realm's routes carry when their StompURL names none ('' for none) */
export declare function realmCacheMark(): string;
/** a route kind without its cache mark, and the mark ('' for none) */
export declare function splitCacheMark(kind: string): [string, string];
