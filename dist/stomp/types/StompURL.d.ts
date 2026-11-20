import GenericCodec from './Codecs';
export declare type urlLike = URL | string;
export declare function isUrlLike(object: unknown): object is urlLike;
/**
 * A document's fragment as its route holds it: `~` and the seal, or nothing
 * for an empty one. The mark tells it from a fragment the browser commits
 * as written for a moment (the inject's Fragment module), which a short one
 * could otherwise be read as a seal.
 */
export declare function sealFragmentText(codec: GenericCodec, fragment: string, stable?: boolean): string;
/**
 * A document route's fragment as the page wrote it: the text the seal
 * holds, or the fragment itself when it holds none (a route from before
 * fragments were sealed, the browser's own fragment navigation)
 */
export declare function openFragment(codec: GenericCodec, fragment: string): string;
/** the text a sealed fragment (without its `#`) holds, or null for one that is not sealed (StompURL's sealFragmentText) */
export declare function sealedFragmentText(codec: GenericCodec, fragment: string): string | null;
export default class StompURL {
    codec: GenericCodec;
    directory: string;
    url: URL;
    /**
     * The cache mark of the document whose routes these are (src/memoryMark.ts),
     * when the caller names it ('' for none): the service worker's, set per
     * request, and the rewriter library's, per call. Taken on from a
     * reference; unset, a route takes its realm's.
     */
    mark?: string;
    constructor(url: urlLike, reference: StompURL);
    constructor(url: urlLike, codec: GenericCodec, directory: string);
    /**
     * A StompURL of `url` itself, not of a copy: for a URL just parsed that
     * nothing else holds (the hooks route every link a page writes, and the
     * copy was one more parse of each)
     */
    static of(url: URL, codec: GenericCodec, directory: string): StompURL;
    /**
     * The route's last segment: the URL without its fragment, sealed, and
     * the fragment after it, an empty query or fragment kept
     * (src/urlShape.ts). A document's fragment is sealed too
     * (`sealFragment`, docs/codec.md); a subresource's stays as written,
     * since the browser reads it there (an SVG sprite's `#icon`, a filter's
     * `url(#blur)`), and it is never sent.
     */
    encode(sealFragment?: boolean): string;
    toString(): string;
}
