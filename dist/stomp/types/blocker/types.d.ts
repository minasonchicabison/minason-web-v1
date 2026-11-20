/** one filter list to fetch */
export interface AdblockList {
    url: string;
    /**
     * the list may use the `trusted-*` scriptlets (uBlock Origin's own lists
     * are; a list anyone can edit must not be, since those scriptlets edit
     * the page's cookies, storage and responses)
     */
    trusted?: boolean;
    /** a hosts file (`0.0.0.0 host` lines) rather than filter syntax */
    format?: 'standard' | 'hosts';
    /**
     * the list's filter text itself, compiled in place of fetching `url`: the
     * demo's "custom filters" editor hands its uBlock-syntax rules this way
     * (docs/adblock.md "Custom filters"). `url` then only names the inline list
     * for the engine's cache key, and `trusted` must stay false (the user's own
     * rules do not get the `trusted-*` scriptlets). The blocker uses this string
     * directly and never fetches the list.
     */
    filters?: string;
    /**
     * a human-readable name for the host application's UI (the demo's Filter
     * Lists page). Never sent to the engine, never part of the cache key.
     */
    name?: string;
}
/**
 * what the controllers' `setAdblockLists`/`refreshAdblockLists` report:
 * `'live'` when the change was pushed to the running blocker (it rebuilds the
 * engine and swaps it in once compiled), `'off'` when the host turned the
 * blocker off and there was nothing to apply.
 */
export interface AdblockApplied {
    applied: 'live' | 'off';
}
export interface AdblockOptions {
    /**
     * the lists, fetched through the transport when the controller starts
     * (and again daily); default EasyList, EasyPrivacy and uBlock Origin's
     * own. A list that cannot be fetched is left out; with none fetched the
     * blocker stays off
     */
    lists?: (string | AdblockList)[];
    /**
     * the redirect resources and scriptlets, Brave's `resources.json`
     * format; default uBlock Origin's, built into `adblock-resources.json` in
     * the directory (scripts/adblock-resources.mjs)
     */
    resources?: string;
    /**
     * a serialized engine the host built (`Engine::serialize` of the same
     * crate version, docs/adblock.md), loaded instead of fetching and
     * compiling the lists; `resources` are still fetched
     */
    engine?: string;
    /** hours between refreshes of the lists; default 24 */
    refresh?: number;
}
/**
 * what the controller tells the service worker. The module is not here: it
 * travels with the other wasm modules, as `modules.blocker` of the
 * handshake (src/wasm/thread.ts)
 */
export interface AdblockInit {
    lists: AdblockList[];
    resources: string;
    engine?: string;
    refreshMs: number;
    /**
     * the host did not name the option, and the blocker is on because that
     * is the default: what it cannot have (its module, the lists) leaves it
     * off with one line on the console, and no navigation waits for the
     * lists to be fetched
     */
    byDefault?: true;
}
/**
 * what the service worker hands a document's inject, from the crate's
 * `url_cosmetic_resources`: the cosmetic side of the lists for that page
 */
export interface AdblockPage {
    /** selectors to hide (`display: none !important`) */
    hide: string[];
    /** procedural and action filters, the crate's JSON, applied in the page (src/inject/dom/modules/Adblock.ts) */
    procedural: string[];
    /** generic class and id selectors excepted for this page (`#@#`), for the worker's generic lookups */
    exceptions: string[];
    /** the scriptlets, one script, rewritten by the worker, run before any page script */
    script: string;
    /** `$generichide`: the page asks for no generic rules */
    generichide: boolean;
}
/** the crate's JSON for a procedural or action filter (filters/cosmetic.rs) */
export interface ProceduralFilter {
    selector: {
        type: string;
        arg: string;
    }[];
    action?: {
        type: string;
        arg?: string;
    };
}
/**
 * Per-site "shields" (the demo's content-blocker UI, after Brave Shields):
 * what the user turned on or off for one host. It governs STomp's privacy
 * layers for that host alone: the ad/tracker blocker, HTTPS upgrading, the
 * cookie policy, blocking the page's own scripts, STomp's fingerprint
 * emulation, and forgetting the site on close. STomp's core rewriting is never
 * touched. A host with no entry of its own is governed by the controller's
 * '*' default entry when it sends one (the demo's "goodies on by default"),
 * else it is neutral (the blocker as the controller configured it, no forced
 * upgrade, cookies as SameSite allows, fingerprint emulation on).
 */
export type ShieldsMode = 'aggressive' | 'standard' | 'allow';
/**
 * The per-site anti-fingerprinting surfaces STomp can protect one at a time
 * (the Shields "Block fingerprinting" detail submenu), after Brave's model.
 *
 * `performanceMemory` is match-native: STomp synthesizes a plausible per-site
 * `performance.memory` so a frame does not read the same shared-process heap as
 * the page that embeds it (the Memory module; the one cross-site tell a shared
 * renderer leaks, and the signal Cloudflare Turnstile reads). It is ON by
 * default because a real-looking figure helps pass bot checks.
 *
 * The rest are Brave-style protections that make STomp *stop* matching native:
 * they farble (canvas, webgl, audio: deterministic per-site sub-perceptual
 * noise from a per-session seed and the document's eTLD+1, so a site is stable
 * within itself but cannot be correlated across sites) or limit/round (fonts,
 * screen, hardwareConcurrency, deviceMemory, mediaDevices, locale). A farbled
 * canvas or a capped core count is itself a signal that can FAIL a strict bot
 * check, the opposite of STomp's "look like real Chrome" baseline, so every one
 * of them is OFF by default (opt-in per site). See FP_DEFAULT_ON.
 *
 * The inject's FingerprintModule installs a surface's hook only when the
 * surface is active for the document (src/inject/dom/modules/Fingerprint.ts),
 * so a surface left at its default adds nothing to the frame's heap. The master
 * "Block fingerprinting" is the umbrella kill switch over the set (off: every
 * surface native); it does not force the opt-in surfaces on. New surfaces join
 * here as real hooks appear (src/server/shields.ts, docs/adblock.md).
 */
export type FpSurface = 'performanceMemory' | 'canvas' | 'webgl' | 'audio' | 'fonts' | 'screen' | 'hardwareConcurrency' | 'deviceMemory' | 'mediaDevices' | 'locale';
/** every fp surface, in submenu order; the master toggle is the kill switch over it */
export declare const FP_SURFACES: FpSurface[];
/**
 * Which surfaces STomp protects by default. Only `performanceMemory` is on:
 * it matches native and helps bot checks. Every farbling/limiting surface is
 * off (opt-in), because turning it on makes STomp diverge from a real Chrome
 * and can fail a strict bot check (docs/adblock.md "Anti-fingerprinting"). A
 * surface with no per-site flag takes this value.
 */
export declare const FP_DEFAULT_ON: Record<FpSurface, boolean>;
/** the surfaces active by default (performanceMemory alone), in FP_SURFACES order */
export declare const FP_DEFAULT_ON_SURFACES: FpSurface[];
/**
 * The surfaces whose protection needs the per-session farbling seed: canvas,
 * webgl and audio add deterministic per-site noise seeded from it. The
 * limiting/rounding surfaces are deterministic and need no seed, so the shell
 * carries the seed (Config.fingerprintSeed) only when one of these is active.
 */
export declare const FP_SEEDED_SURFACES: FpSurface[];
/**
 * Whether two surface sets are the same set (order-independent): the shell
 * omits `fingerprintOn` from a document's config when the active set is the
 * default, so a default page's config is unchanged.
 */
export declare function sameSurfaceSet(a: FpSurface[], b: FpSurface[]): boolean;
/**
 * One host's shields, as the demo stores them (host-keyed, in its own
 * localStorage) and plumbs to the service worker. `enabled` is the master
 * toggle; down (or mode 'allow') turns every layer below off for the host.
 */
export interface SiteShields {
    /** the host the entry is keyed by (lower-cased) */
    host: string;
    /** shields up (true) or down (false); down turns every layer off for the host */
    enabled: boolean;
    /** the ad/tracker blocker: 'allow' is "allow all", the blocking layer off */
    mode: ShieldsMode;
    /** HTTPS upgrade for the host's requests: 'off' leaves http alone */
    httpsUpgrade?: 'strict' | 'upgrade' | 'off';
    /** block the page's own scripts (the inject enforces script-src 'none' against the page's code, src/csp.ts) */
    blockScripts?: boolean;
    /**
     * The master fingerprint toggle (on by default): the umbrella kill switch
     * over the per-surface set. Off, the site reads this browser's native values
     * for every surface (STomp protects none, src/server/shields.ts). On, each
     * surface takes its own `fingerprint` flag, or FP_DEFAULT_ON when it has
     * none. It does not force the opt-in surfaces on; it only turns everything
     * off when down.
     */
    blockFingerprinting?: boolean;
    /**
     * Per-surface fingerprint protection. An absent key takes the surface's
     * default (FP_DEFAULT_ON: `performanceMemory` on, every farbling/limiting
     * surface off). A key set true opts the surface in (STomp farbles or limits
     * it for the host); false opts it out. The master `blockFingerprinting` off,
     * or shields down, forces every surface off whatever these say. See
     * FpSurface.
     */
    fingerprint?: Partial<Record<FpSurface, boolean>>;
    /** the cookie policy for the host's requests */
    cookies?: 'all' | 'third-party' | 'allow';
    /** clear the host's cookies and virtualized storage when its last tab closes */
    forget?: boolean;
}
/**
 * Whether a host's shields turn every layer off: shields down, or the blocker
 * in "allow all" mode is still shields-up for the other layers, so this is
 * only the master switch. The per-layer getters on the server's store read it.
 */
export declare function shieldsDown(shields: SiteShields | undefined): boolean;
export declare const DEFAULT_LISTS: AdblockList[];
/**
 * the file of the directory that holds uBlock Origin's scriptlets and
 * redirect resources (assets/adblock-resources.json): the lists' `+js()` and
 * `$redirect` rules name them, and the lists are written for the uBO release
 * that shipped them, as the file is built from one
 */
export declare const DEFAULT_RESOURCES = "adblock-resources.json";
export declare const DEFAULT_REFRESH_HOURS = 24;
/**
 * the options as the host gave them, resolved: every list an object, every
 * default filled in. Only `false` is off: an option left out is the default
 * lists, as `true` is
 */
export declare function resolveAdblockOptions(given: boolean | AdblockOptions | null | undefined, 
/** where the default resources are served (the directory's copy) */
resources?: string): AdblockInit | null;
/**
 * The same blocker options with a different set of lists: the host application
 * changed them at runtime (the demo's Filter Lists editor, docs/adblock.md).
 * The resources and the refresh interval are kept; a prebuilt `engine` is
 * dropped, since the engine is the old lists compiled and cannot take new ones.
 * The lists are normalized as `resolveAdblockOptions` does, and `byDefault` is
 * cleared: a list the user chose, unlike one that is merely the default, is the
 * user's to hear of when it cannot be fetched.
 */
export declare function withAdblockLists(base: AdblockInit, lists: (string | AdblockList)[]): AdblockInit;
/**
 * the request type the lists know, from a fetch event's destination (the
 * browser's `RequestDestination`): what uBlock Origin's webRequest listener
 * would see for the same load. Anything else is `other`, which the crate
 * also gives an unknown name, so the mapping is spelled out here
 */
export declare function requestTypeOf(destination: string, navigation: boolean, topLevel: boolean): string;
