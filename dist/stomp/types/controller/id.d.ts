import { type HelperNames } from '../helperNames';
/** what an id may look like: a path segment that needs no encoding */
export declare const ID_PATTERN: RegExp;
/** the id the host gave, checked */
export declare function controllerId(id: string): string;
/**
 * The per-session farbling seed the anti-fingerprint surfaces mix with each
 * document's eTLD+1 (src/inject/dom/modules/Fingerprint.ts). One random 32-bit
 * value for the host origin, kept in its localStorage so a site's canvas/audio/
 * webgl noise is stable across reloads, tabs and the service worker restarting
 * (which would otherwise re-roll it and change a site's readback under it).
 * The controller sends it to the worker with the shields. It is never shown to
 * a page, only its noise is, so it is no fingerprint of its own, and it is
 * forgotten with the site data (forgetControllerIds, on `cookies.clear()`), so
 * that is when it re-seeds. Where storage refuses, a fresh random one serves
 * this page alone (stable within the page, which is enough for one document).
 */
export declare function fingerprintSeed(): number;
type KeptNames = Pick<HelperNames, 'access' | 'globalProxy' | 'globalName'>;
/**
 * The access API's and the stand-in tags' names of a controller whose host
 * named none (helperNames.ts): the host origin's own, minted once and kept
 * in its localStorage, so they repeat from visit to visit as the id does
 * (a rewritten script spells the access name, and the rewrite cache and
 * the browser's code cache keep it by its routed URL). Not the defaults:
 * a STomp loaded through this one (proxy-ception, docs/proxyception.md)
 * is page code here and defines its own access API on Number.prototype,
 * where this one's already is for good. With the same name its rewritten
 * scripts called this one's API, and the inner proxy's hooks saw nothing.
 * The inner one keeps its names in its origin's emulated storage, so the
 * two mint theirs apart (one chance in 16.7 million to meet). None is a
 * global of this page (`taken`) or a default. Where storage refuses, fresh
 * ones serve this page alone, as an id does then; they go with the site
 * data (forgetControllerIds).
 */
export declare function keptHelperNames(taken?: Iterable<string>): KeptNames;
export declare function keptControllerId(): Promise<string>;
/**
 * Forget the host origin's kept ids: the next page gets a new one, and so
 * does every open tab when it reloads (a controller keeps the id it holds
 * until then). Under the claims' lock, so a claim in another tab that read
 * the list before does not write it back.
 */
export declare function forgetControllerIds(): Promise<void>;
export {};
