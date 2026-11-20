/** what follows a route's kind when the load carries integrity metadata */
export declare const INTEGRITY_MARK = ";sri=";
/**
 * The mark's items for metadata that names nothing valid (`integrity=""`):
 * nothing is checked, and an import map's integrity does not apply either
 * (the element's own attribute stands, as natively)
 */
export declare const NO_INTEGRITY = "none";
/**
 * The fragment of a refused stylesheet's route asked for again with the
 * page's metadata on the element: the worker answers a stylesheet request
 * that carries integrity with bytes that match none of it (./sriDigest.ts refusalBytes),
 * and the browser refuses them itself (no sheet, Chrome's own message;
 * DOMAttributes). Nothing of the origin's response is in them, so a page
 * that asks for such a URL itself learns nothing.
 */
export declare const REFUSED_FRAGMENT = "#stomp-sri-refused";
/** the route (under the directory) the inject gives a document's import map integrity on: [[module URL, metadata], ...] (server/integrityLoads.ts) */
export declare const IMPORT_MAP_ROUTE = "sri/importmap";
export type Algorithm = 'sha256' | 'sha384' | 'sha512';
interface IntegrityItem {
    algorithm: Algorithm;
    /** base64, padded */
    digest: string;
}
/** a base64 or base64url value as base64, padded */
export declare function base64Standard(value: string): string;
/**
 * The mark a route carries for `metadata` (a kind then this, before the
 * route's `/`): '' when there is nothing to check. The same metadata always
 * makes the same mark, so a preload and the load that uses it share a URL.
 */
export declare function integrityMark(metadata: string | null | undefined): string;
/**
 * `routed` with the mark of `metadata` after its kind (`directory` is the
 * route's path prefix, ending in `/`); as it is when there is nothing to
 * check or it is no route (a data: URL)
 */
export declare function markIntegrity(routed: string, metadata: string | null | undefined, directory: string): string;
/** `routed` with `mark` (an integrityMark, or '' for none) after its kind */
export declare function withIntegrityMark(routed: string, mark: string, directory: string): string;
/** a route kind without its integrity mark, and the mark's items ('' for none) */
export declare function splitIntegrityMark(kind: string): [string, string];
/** the items of the strongest algorithm the metadata names (the only ones the SRI spec checks) */
export declare function strongestItems(metadata: string): IntegrityItem[];
/**
 * The bytes of a data: URL, as the fetch spec's data: URL processor makes
 * them: the body percent-decoded, and base64-decoded where the type says
 * `;base64`; null for one the browser would not load
 */
export declare function dataURLBytes(url: string): Uint8Array | null;
export {};
