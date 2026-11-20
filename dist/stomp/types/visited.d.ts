import type GenericCodec from './Codecs';
import { type PublicSuffix } from './partition';
/** the segment under the scope that link routes live in: no controller id can be it */
export declare const LINK_SEGMENT = "~";
export interface VisitedContext {
    /** the origin of the document that holds the link, 'null' for an opaque one */
    frame: string;
    /** its top-level document's site (scheme and registrable domain); the whole context of an opaque document, as opaqueContext made it */
    top: string;
}
/**
 * The context of a document of an opaque origin (a sandboxed frame), as
 * the link route spells it: Chrome never shows such a document's link
 * visited and records nothing it visits, so each has a context of its own
 * (`nonce`: a few letters and digits), which no other document's link
 * names.
 */
export declare const opaqueContext: (nonce: string) => string;
/** a context as the link route spells it: the frame origin, then `^<site>` when the top-level site is not its own */
export declare function contextText(context: VisitedContext, publicSuffix: PublicSuffix): string;
/**
 * The link route of `url` for a link in a document of `context` (as
 * contextText spells it), under `scope` (a path, or an origin and a path)
 */
export declare function linkRoute(scope: string, codec: GenericCodec, context: string, url: URL): string;
/** whether `routed` (a path, or a whole URL) is a link route under `scope` */
export declare function isLinkRoute(routed: string, scope: string): boolean;
/**
 * The context text and real URL (with the route's fragment) of a link
 * route's part after `<scope>~/`; null when it does not decode with `codec`
 * to one. With linkRoute, the one place a link route meets the codec.
 */
export declare function decodeLinkRoute(rest: string, codec: GenericCodec): {
    context: string;
    url: URL;
} | null;
/**
 * What a link route under `scope` stands for: the context of the link and
 * the real URL, with the route's fragment. Null when `routed` is no link
 * route or does not decode with `codec` to one.
 */
export declare function parseLinkRoute(routed: string, codec: GenericCodec, scope: string, publicSuffix: PublicSuffix): {
    context: VisitedContext;
    url: URL;
} | null;
/** the context a document of `url` has at the top level of its own site */
export declare function selfContext(url: URL, publicSuffix: PublicSuffix): VisitedContext;
/**
 * Whether a visit from `context` also counts for the visited URL's own site
 * (Chrome's self-links, components/visitedlink/core/visited_link.cc): the
 * frame origin has to be the origin of the top-level site's own URL, which
 * is the scheme and the registrable domain on the default port. So a click
 * on https://example.com does, one on https://www.example.com or on a port
 * of its own does not (measured, Chrome 152 and 156).
 */
export declare function makesSelfLink(context: VisitedContext): boolean;
export declare const sameContext: (a: VisitedContext, b: VisitedContext) => boolean;
