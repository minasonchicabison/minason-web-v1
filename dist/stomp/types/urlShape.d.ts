/** `url` without its fragment: an empty query is kept */
export declare function beforeFragment(url: URL | string): string;
/** the fragment as written: `#` alone for an empty one, '' for none */
export declare function fragmentOf(url: URL | string): string;
/** the query as written: `?` alone for an empty one, '' for none */
export declare function queryOf(url: URL | string): string;
/** what follows a `data:` URL's scheme, up to its fragment (a `?` in it is data too) */
export declare function dataBody(url: URL): string;
/**
 * `url` with its query replaced by `query` as written: `?` alone gives it an
 * empty one. Chrome's `search` setter makes `?` no query at all (measured,
 * 152 and 156; the spec, and node, keep an empty one), so the URL is parsed
 * again from its text instead.
 */
export declare function withQuery(url: URL, query: string): URL;
/**
 * Whether `value` is one URL no base resolves: no whitespace in it (a list
 * of URLs is not one), and the URL parser rejects it against `base` and
 * against a plain http and https base too (a bad host, `https://`, `//:0`).
 * Chrome loads nothing for it whatever the document's real base is; a
 * relative URL always resolves.
 */
export declare function unresolvable(value: string, base: string): boolean;
