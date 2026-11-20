import type { ProxyTransport } from '@mercuryworkshop/proxy-transports';
import { type AdblockApplied, type AdblockList, type AdblockOptions, type SiteShields } from '../blocker/types';
import { Assets, Config, ConfigCodec } from '../config';
import { type HelperNames } from '../helperNames';
import { type HookErrorInfo, type InitHooks } from '../hooks';
import type { PasskeyManager, PasskeyRequest as PasskeyRequestBase, PasskeysInit as PasskeysInitOf } from '../passkeys/types';
import { urlLike } from '../StompURL';
import type { RequestRule } from '../transport/messages';
import { CookieCommand, CookieRecord, CookieResult, NavigateInfo, RequestInfo } from '../transport/messages';
import { type CarrierInfo } from '../transport/wispWebTransport';
import { type ReportedEntry, type RunsExpectation } from './history';
import type { StaleInfo, TransportDescriptor } from './messages';
import { type Shields } from './shields';
import { type SitePoolInit } from './sitePool';
export { default as SearchBuilder } from '../bootstrapper/SearchBuilder';
export type { ProxyTransport } from '@mercuryworkshop/proxy-transports';
export type { Config, ConfigCodec } from '../config';
export { RemoteController, RemoteFrame, DEFAULT_SANDBOX } from './remote';
export type { RemoteControllerInit, RemotePasskeyRequest, RemotePasskeysInit, } from './remote';
export type { PasskeyAnswer, PasskeyInfo, PasskeyManager, } from '../passkeys/types';
export type { TransportDescriptor, FrameInfo } from './messages';
export type { AdblockApplied, AdblockList, AdblockOptions, } from '../blocker/types';
export { default as Http3Transport } from '../transport/http3/Http3Transport';
export type { DatagramChannel, Http3Info, Http3Options, UdpOpener, } from '../transport/http3/Http3Transport';
export type { Http3DescriptorOptions } from '../transport/construct';
export type { CarrierInfo, WispWebTransportOptions, } from '../transport/wispWebTransport';
export type { NavigateInfo, CookieRecord, RequestInfo, } from '../transport/messages';
export interface ControllerInit {
    /**
     * The registered STomp service worker, or its registration (from
     * `StompController.register()` or `navigator.serviceWorker.register()`):
     * then the controller takes its worker and waits for it to activate.
     */
    serviceworker: ServiceWorker | ServiceWorkerRegistration;
    /**
     * The transport proxied traffic goes through. A TransportDescriptor
     * (`{ module, options }`) is imported and constructed in a dedicated
     * Worker the controller starts from `transportWorker.js` in `directory`
     * (`host: 'page'` keeps it in this page); off the host page's thread, a
     * proxied frame's synchronous XHR that needs the network completes
     * instead of deadlocking. A ProxyTransport instance (an EpoxyTransport
     * the host constructed) is served from this page, as before. See
     * `transportHost` and the `transporthost` event.
     */
    transport: ProxyTransport | TransportDescriptor;
    codec?: ConfigCodec;
    /**
     * URL of the directory `serviceworker` is scoped to and `dist/` is served
     * from. Defaults to the directory of the current script, or of the page
     * when loaded as a module.
     */
    directory?: urlLike;
    /**
     * This controller's id, 1 to 32 characters of `[A-Za-z0-9_-]` (a TypeError
     * otherwise); 8 random characters by default. It names the controller's
     * address under the directory (`/stomp/<id>/`, `config.directory`), so two
     * host tabs on one directory run two controllers side by side; the same id
     * passed again replaces the earlier controller. Without one the
     * controller keeps an id of its own from visit to visit, one for each
     * controller open at once (src/controller/id.ts): the tab's history
     * entries, reloads and copied links keep resolving, and the browser keeps
     * the compiled code of the scripts proxied pages load (it does so only
     * for the same URL, and every routed URL starts with the id). That id is
     * known once `wait()` resolves (`id` is empty until then), and is
     * forgotten with the cookies (`cookies.clear()` for every site).
     */
    id?: string;
    /** origins allowed to frame proxied documents (CSP frame-ancestors) */
    frameAncestors?: string[];
    /**
     * Called when a proxied page wants a new tab (`window.open`, a link with
     * `target="_blank"` or a name, a modifier click). The page's `window.open`
     * then returns null, like a popup blocker. Without it, popups open
     * natively as bare proxied tabs.
     */
    onOpen?: (url: string, frame: Frame) => void;
    /**
     * Called whenever a proxied page reports where it is (load, pushState,
     * hashchange, title change); the same information arrives as a
     * `navigate` CustomEvent on the Frame (`event.detail`).
     */
    onNavigate?: (info: NavigateInfo, frame: Frame) => void;
    /**
     * Called once per proxied request with what the service worker saw: real
     * URL, method, destination, status, time, whether the cache answered (or
     * had the origin confirm its entry), the size, an error, and the Frame it belongs to when known. Nothing is
     * built or sent when unset.
     */
    onRequest?: (info: RequestEvent) => void;
    /**
     * The transport's verbose log on the console (src/transport/transportLog.ts):
     * a `[net]` line for each connection the transport opens to a site, what
     * it rides there (HTTP/1.1, HTTP/2 over TLS over a Wisp TCP stream,
     * HTTP/3 over a Wisp UDP stream) and what that Wisp stream rides to the
     * relay (WebTransport's QUIC stream or datagrams, or the WebSocket), and
     * each HTTP/3 fallback with its reason. Off by default, when nothing is
     * built for it; `localStorage['stomp:debug-transport'] = '1'` on the
     * host's origin turns it on when this is not given. The `[wisp]` notes
     * (what the wisp connection rides) are on the console either way.
     */
    debugTransport?: boolean;
    /**
     * Whether a transport given a wisp URL rides the carrier host's wisp
     * connection (src/transport/carrierHost.ts): a SharedWorker of the
     * transport worker's script that keeps the origin's WebTransport session
     * (or WebSocket) to the relay up across reloads and tabs, so that a
     * reload and a second tab do not open one again. On by default; false
     * has each transport open its own, as every start did before.
     */
    carrierHost?: boolean;
    /**
     * Called when a proxied site asks for a permission (geolocation, camera,
     * microphone, notifications, ...) that the browser already gave the proxy
     * origin for another site: the browser will not ask the user again, so
     * the host does. Resolve true to grant it to this site, false to deny it,
     * null (or throw) when the user closed the prompt. Without it such a
     * request is dismissed; a site's own first request still gets the
     * browser's prompt. docs/permissions.md.
     */
    onPermissionRequest?: (request: PermissionRequest) => boolean | null | Promise<boolean | null>;
    /**
     * Passkeys for proxied sites (docs/passkeys.md), off unless given.
     * WebAuthn cannot work through a proxy (the browser checks and signs the
     * proxy's origin), so with this STomp is the passkey provider, as a
     * password manager is: the service worker keeps a key pair per passkey
     * (not extractable) in a store no proxied page reaches, bound to the
     * site's real relying party id, and `onRequest` asks the user about every
     * one made and every sign-in. Their safety is the inject's containment,
     * as that of every site's cookies and storage on the proxy origin is.
     * Without it a proxied page's WebAuthn requests end as they do in a
     * browser that holds no passkey for the site.
     */
    passkeys?: PasskeysInit;
    /**
     * HTTP cache in the service worker, on by default: GET/HEAD responses
     * with explicit freshness (max-age, Expires) are kept in a Cache API
     * store and revalidated when stale; `clearCache()` drops it. `false`
     * turns it off.
     */
    cache?: boolean;
    /**
     * A script the rewriter cannot parse runs as it was (default, like a
     * browser that does not know the syntax either). `false` makes it fail
     * with a SyntaxError naming the rewriter error instead, so a broken
     * rewrite is loud while developing.
     */
    allowInvalidJs?: boolean;
    /**
     * The window membrane, on by default. Every proxied site shares the
     * proxy's one real origin, so the browser never keeps one proxied site
     * from another's windows: the inject hands a page every window, and every
     * object of another window's realm, through a proxy that checks on each
     * use which site that window shows now, and behaves as the browser's
     * cross-origin window when it is another. `false` turns it off, for a
     * site it breaks: windows of another site are then restricted only where
     * the page reads them, and one held while it was of the page's own site
     * stays the window itself. (The setting reaches every document now; the
     * membrane it switches is being built, and until it lands both values
     * behave alike.)
     */
    membrane?: boolean;
    /**
     * Emulated service workers, on unless `false` (docs/service-workers.md).
     * A proxied page's `navigator.serviceWorker` works: its worker script
     * runs in a dedicated Worker this controller starts (never a real
     * registration on the proxy origin, which would serve every site), and
     * the STomp service worker hands it the requests of the pages it
     * controls, navigations included, so offline pages, caches and fetch
     * rewriting work. `false` leaves pages without `navigator.serviceWorker`,
     * which a page can read as a proxy tell.
     */
    serviceWorkers?: boolean;
    /**
     * Request rules, run in the service worker on the real URL: block, answer
     * with a status, redirect, or edit request and response headers; the
     * first matching rule wins. `setRules()` replaces them later.
     */
    rules?: RequestRule[];
    /**
     * Per-site shields the controller starts with (the demo's content-blocker
     * UI, docs/adblock.md): a host-keyed state the host persisted. They travel
     * to the service worker with the handshake, and `controller.shields` reads
     * and writes them later. Left out, no host has an entry and STomp behaves as
     * it would without shields (the blocker on, cookies and HTTPS untouched).
     */
    shields?: SiteShields[];
    /**
     * Called after `controller.shields.set(host, ...)` with the host and its new
     * state, for the host to persist the change (the demo writes localStorage).
     */
    onShieldsChange?: (host: string, state: SiteShields) => void;
    /**
     * The served file names, when the host renamed them (see Assets): the
     * inject bundles the worker names in its shell. A same-origin host
     * registers the worker itself, so `serviceWorker` only documents its choice.
     */
    assets?: Assets;
    /**
     * The global names the rewriter and the inject bundles use (see
     * HelperNames): a deployment's own, when the host set them. Each must be
     * an identifier no plain window has; the controller throws a TypeError
     * otherwise. Defaults: `$s$j`, `$s$L`, `$s$N`, and for `client` a name
     * the controller mints, which no page is told. A host that sets `client`
     * publishes it: any page that names the client reaches the real windows
     * it holds, so leave it unset.
     */
    names?: Partial<HelperNames>;
    /**
     * Host code run inside every proxied realm (documents, nested frames,
     * about:blank children, popups, srcdoc frames; workers with
     * `hooks.workers`): `hooks.init.pre` before the inject installs its hooks,
     * `hooks.init.post` after, before the page's first script. Scripts that
     * travel, not closures: `{ source }` is the text, `{ url }` is fetched
     * once at construction and its text travels (a redeploy of the file needs
     * a new controller). Trusted host code with the realm's real globals; see
     * src/hooks.ts. A bad shape is a TypeError; a URL that cannot be fetched
     * is a `hookerror` event (and an entry in `hookErrors`), and the
     * controller serves without that hook.
     */
    hooks?: InitHooks;
    /**
     * a host hook threw in a proxied realm (or a hook URL failed); also the
     * `hookerror` CustomEvent. `frame` is the one showing the page the realm
     * belongs to (the page's own document or one in a frame nested in it),
     * null for a hook URL
     */
    onHookError?: (info: HookErrorInfo, frame: Frame | null) => void;
    /**
     * The host's own page for a document the proxy failed to produce (the
     * transport could not reach the origin, the worker's timeout, a routing
     * error, a blocked rule): a URL on this origin, resolved against the
     * page. Served under the frame's routed
     * URL with the failure's status, never cached, with
     * `globalThis.stompError = { url, status, error, kind }` in its head;
     * `location.reload()` retries. Without it the built-in pages answer.
     */
    errorPage?: string;
    /**
     * The built-in blocker (docs/adblock.md), on by default: EasyList,
     * EasyPrivacy and uBlock Origin's lists are fetched through the transport
     * and what they name is blocked, hidden and neutralised, as a content
     * blocker in the user's browser would; an object names other lists, the
     * resources, a prebuilt engine or the refresh interval, and `false`
     * turns it off (nothing of it is fetched then). A blocked request is a
     * network error to the page, nothing more. Left out, the blocker is best
     * effort: a host that does not serve `blocker.wasm`, or lists that cannot
     * be fetched, leave it off with one line on the console, and no page
     * waits for the lists. `true` and an object are the host asking for it:
     * the first navigation then waits for the engine (five seconds at most).
     */
    adblock?: boolean | AdblockOptions;
    /**
     * The filter lists to start the blocker with in place of the defaults (the
     * demo seeds what its Filter Lists editor kept): the same lists
     * `setAdblockLists` would push, but carried by the first handshake so the
     * engine is built from them once, not rebuilt after a default build. Ignored
     * when `adblock` is `false`. `adblockDefaults()` still reports the untouched
     * default lists, for the editor to show.
     */
    adblockLists?: (string | AdblockList)[];
    /**
     * sandbox flags for proxied frames, default `DEFAULT_SANDBOX`. Same-origin
     * frames are not a security boundary, but without a sandbox the browser
     * lets `<a target="_top">`, `<form target="_parent">` and
     * `window.open(url, '_top')` navigate the host page. `null` disables it.
     */
    sandbox?: string | null;
    /**
     * How many Workers the controller starts to rewrite scripts for the
     * service worker, whose own thread would otherwise rewrite one script at
     * a time (from `rewriteWorker.js` in `directory`). A large webpack
     * bundle is shared out among them, a part to each. Default: half the
     * cores, one to four; `0` starts none. Whenever no worker answers (none
     * started, one failed to load or crashed, this page closed), the service
     * worker rewrites the script itself.
     */
    rewriteWorkers?: number;
    /**
     * Milliseconds the service worker waits for a rewrite worker's answer
     * before it rewrites the script itself and stops using that worker.
     * Default 10000.
     */
    rewriteTimeout?: number;
    /**
     * Show every proxied site (its registrable domain) from one of a few
     * origins, the pool's slots (`{ origins: [...] }`,
     * src/controller/sitePool.ts, docs/site-pool.md): other ports of this
     * page's host, say. The browser then gives each slot a process of its
     * own, so a page and a frame of another site in it are apart as
     * natively, and a window of a site in another slot is another origin to
     * the browser itself. A site keeps its slot; with more sites than slots,
     * some share one, as every site does without a pool. Every slot must
     * serve `directory` as this page's origin does, with
     * `Origin-Agent-Cluster: ?1` on everything it answers.
     *
     * Used wherever it can work: a page that is not a secure context (where
     * the browser ignores Origin-Agent-Cluster), and a slot that does not
     * answer or whose service worker does not start, show their sites from
     * this page's origin, as without a pool. `false` (or no origins) shows
     * every site from this page's origin.
     */
    sitePool?: SitePoolInit | false;
}
/**
 * a RequestInfo with the frame it belongs to: the one showing the page that
 * made the request, whatever in the page did (a document in a nested frame,
 * one on about:srcdoc or about:blank, a worker), once its document reported
 * its client id; null for a client no frame holds (a page's emulated
 * service worker)
 */
export interface RequestEvent extends RequestInfo {
    frame: Frame | null;
}
/** a proxied site's permission request the host is asked about (onPermissionRequest) */
export interface PermissionRequest {
    /** the site: the real origin of the proxied page at the top of the frame */
    origin: string;
    /** the permission, as permissions.query names it (`geolocation`, `camera`, ...) */
    permission: string;
    /** the frame the request came from, when its page reported its client id */
    frame: Frame | null;
    /** the requesting document's service worker client id */
    client?: string;
}
/** a proxied site's passkey ceremony the host is asked about (ControllerInit.passkeys) */
export interface PasskeyRequest extends PasskeyRequestBase {
    /** the frame the request came from, when its page reported its client id */
    frame: Frame | null;
}
/** the passkeys option (see ControllerInit.passkeys) */
export type PasskeysInit = PasskeysInitOf<PasskeyRequest>;
/** the host's view of the cookie jar (see StompController.cookies) */
export interface CookieJar {
    /** the Cookie header value the proxy would send to `url` */
    get(url: string): Promise<string>;
    /** apply Set-Cookie header values as if `url` had sent them */
    set(url: string, setCookie: string | string[]): Promise<void>;
    /** every stored cookie, or those a page of `origin` could receive */
    list(origin?: string): Promise<CookieRecord[]>;
    /** forget every cookie, or those of `origin` */
    clear(origin?: string): Promise<void>;
}
export declare function cookieJar(run: (command: CookieCommand) => Promise<CookieResult>): CookieJar;
/** a navigate report posted by a proxied page, else null */
export declare function navigateReport(data: unknown): NavigateInfo | null;
/** the service worker client id a document in a frame of a proxied page posted, else null */
/** how the browser navigated to the document a navigate report is of (NAVIGATION_TYPE), else null */
export declare function navigationTypeReport(data: unknown): string | null;
/** where the document a navigate report is of is in its slot's stretch of the frame's history (HISTORY_RUN), else null */
export declare function historyRunReport(data: unknown): [number, number] | null;
/** a FRAME_MOVED report of a document in a frame of a proxied page (with its client id, when it has one), else null */
export declare function frameMovedReport(data: unknown): {
    client: string | null;
    entry: ReportedEntry | null;
} | null;
export declare function clientReport(data: unknown): string | null;
/** the token of a proxied document that reported its first user activation, else null */
export declare function activatedReport(data: unknown): string | null;
/** a hook error report posted by a proxied page, else null */
export declare function hookErrorReport(data: unknown): HookErrorInfo | null;
/** the URL of an open request posted by a proxied page, else null */
export declare function openRequest(data: unknown): string | null;
/** how long go() and reload() wait for the new document's first report before resolving anyway */
export declare const NAVIGATION_WAIT_MS = 30000;
/** how long after the frame's load event they wait for a report that may never come (a document nothing injected) */
export declare const REPORT_GRACE_MS = 1000;
/** how long register() and the constructor wait for a worker to activate before going on with what there is */
export declare const REGISTER_WAIT_MS = 30000;
/** resolves once the worker is activated; rejects when it becomes redundant */
export declare function activated(worker: ServiceWorker): Promise<ServiceWorker>;
export type { StaleInfo };
/** the build this controller bundle came from (version plus commit, or the package version); `controller.build` carries it too */
export { BUILD } from '../version';
export type { Assets } from '../config';
export { DEFAULT_ASSETS } from '../config';
export type { HelperNames } from '../helperNames';
export type { HookContext, HookErrorInfo, HookScript, InitHooks, } from '../hooks';
export { DEFAULT_NAMES } from '../helperNames';
export type { RequestRule, RequestRuleAction, RequestRuleMatch, } from '../transport/messages';
/**
 * Owns the transport and registers itself with the service worker.
 * Proxied content lives in frames created by `createFrame()`.
 */
/**
 * Events: `stale` (detail: StaleInfo) when the handshake met a service worker
 * of another build that could not be replaced in time, `rebind` (detail:
 * `{ build }`) when a later handshake agrees again, `transporthost`
 * (detail: `{ host: 'page', error }`) when the transport worker could not
 * host a descriptor and the page took over, and `carrier` (detail:
 * CarrierInfo, also `carrier`) each time a descriptor's transport given a
 * wisp URL is up on what its wisp connection rides.
 */
export declare class StompController extends EventTarget {
    #private;
    config: Config;
    /**
     * set while the service worker serving this controller is another build
     * than the controller (a deploy the browser has not finished installing);
     * null once the builds agree
     */
    stale: StaleInfo | null;
    /** the directory the host gave: the service worker's scope and the asset base (`config.scope`) */
    directory: URL;
    /**
     * this controller's id; its address is `config.directory` (`directory` +
     * id + `/`). Empty, as the address is, until the controller that was
     * given none has the one it keeps (before `wait()` resolves)
     */
    id: string;
    /** the build this controller bundle came from (STOMP_BUILD: version plus commit, or the package version); the worker's build is `config.build`, and `stale` says when the two differ */
    readonly build: string;
    serviceworker: ServiceWorker;
    /**
     * The transport the proxy uses. With a worker-hosted descriptor this is a
     * RemoteTransport over a port the worker serves (so a host can still probe
     * `controller.transport.request()` from its console); otherwise the
     * instance the host gave or the page imported.
     */
    transport: ProxyTransport;
    /**
     * Where the transport runs: `worker` for a descriptor hosted in the
     * transport worker, `page` for an instance, a descriptor with
     * `host: 'page'`, or a descriptor the worker could not host (then a
     * `transporthost` event said so). `setTransport()` takes a descriptor for
     * the one and an instance for the other.
     */
    transportHost: 'worker' | 'page';
    /**
     * What the transport's wisp connection rides, WebTransport or its
     * WebSocket, once a descriptor's transport given a wisp URL chose (with
     * `webTransport`) or opened its WebSocket (without: `why` is `off`); a
     * `carrier` event each time, a revived transport too. Null before, and
     * for an instance or a transport given no wisp URL. The host's alone: no
     * proxied page is told.
     */
    carrier: CarrierInfo | null;
    frames: Frame[];
    isReady: boolean;
    /** every hook error so far (a hook that threw, a hook URL that failed), newest last; also `hookerror` events */
    readonly hookErrors: HookErrorInfo[];
    private lastHandshake;
    /**
     * Register the STomp service worker served from `directory` (the
     * constructor's default when omitted: the directory of the current script)
     * and resolve once it is activated. The registration goes straight into
     * `serviceworker` of the constructor.
     */
    static register(directory?: urlLike, options?: {
        /** the served file names, when the host renamed them */
        assets?: Assets;
        /** passed to `navigator.serviceWorker.register`; `none` by default */
        updateViaCache?: ServiceWorkerUpdateViaCache;
    }): Promise<ServiceWorkerRegistration>;
    constructor(init: ControllerInit);
    /**
     * Talk to another service worker from now on (default: the registration's
     * active worker) and shake hands again; the next ready answer settles
     * `wait()` as usual. Hosts that update the worker themselves call this
     * instead of reaching into the controller.
     */
    rebind(worker?: ServiceWorker): Promise<void>;
    /** resolves once the service worker has created a server for this controller */
    wait(): Promise<void>;
    /**
     * Hot-swap the transport; in-flight requests finish on the old one. The
     * argument matches `transportHost`: a TransportDescriptor for a
     * worker-hosted transport (the worker imports and constructs it), a
     * ProxyTransport instance for a page-hosted one; the other kind is a
     * TypeError.
     */
    setTransport(transport: ProxyTransport | TransportDescriptor): Promise<void>;
    /** replace the request rules the service worker applies (see ControllerInit.rules) */
    setRules(rules: RequestRule[]): Promise<void>;
    /**
     * Per-site shields (the demo's content-blocker UI, docs/adblock.md):
     * `get(host)` reads a host's state (the defaults when it has none),
     * `set(host, patch)` changes it and pushes the whole set to the worker,
     * `all()` is every entry (to persist), `replace(list)` sets them all.
     */
    get shields(): Shields;
    /**
     * The blocker's default filter lists (docs/adblock.md), for a host UI to
     * show as toggle rows (the demo's Filter Lists editor): the list objects
     * with their `name`, `url`, `trusted` and `format`, untouched by
     * `setAdblockLists`. Empty when the host turned the blocker off.
     */
    adblockDefaults(): AdblockList[];
    /**
     * The filter lists the blocker is serving now: the defaults, or what
     * `setAdblockLists` last set (an inline list among them is the custom-filters
     * editor's text). Empty when the blocker is off.
     */
    getAdblockLists(): AdblockList[];
    /**
     * Replace the built-in blocker's filter lists at runtime (docs/adblock.md
     * "Changing the lists"): the service worker rebuilds the engine and swaps it
     * in once compiled, keeping the old lists serving in between, so the change
     * is live. An inline list (`{ filters, ... }`) compiles the custom-filters
     * editor's own rules. The lists travel with every later handshake too, so a
     * worker that restarts rebuilds from them. Returns `'live'` when the blocker
     * is on to apply them, `'off'` when the host turned it off.
     */
    setAdblockLists(lists: (string | AdblockList)[]): Promise<AdblockApplied>;
    /**
     * Re-fetch and recompile the blocker's current lists (the demo's "Update
     * lists" button): the engine is rebuilt even when the stored one for these
     * exact lists is still fresh. `'off'` when the blocker is off.
     */
    refreshAdblockLists(): Promise<AdblockApplied>;
    /** drop every entry of the service worker's HTTP cache */
    clearCache(): Promise<void>;
    /**
     * The cookie jar, for the host application only (pages never reach this
     * port): read what the proxy would send, import Set-Cookie headers,
     * export records, or wipe an origin.
     */
    readonly cookies: CookieJar;
    /**
     * The passkeys the service worker holds for proxied sites
     * (docs/passkeys.md), for the host application only: list them, forget
     * one, or forget every one (of a relying party). `forgetStorage(origin)`
     * forgets a site's too; `cookies.clear()` leaves them.
     */
    readonly passkeys: PasskeyManager;
    /**
     * Clear a site's virtualized storage (localStorage, sessionStorage,
     * IndexedDB, Cache Storage) on the proxy origin, and the passkeys its host
     * could have made (docs/passkeys.md): the "Forget me when I close this
     * site" shield, called by the host once the site's last tab closes. The
     * cookie jar is wiped through `cookies.clear(origin)`.
     */
    forgetStorage(origin: string): Promise<void>;
    /** the proxied URL a frame should navigate to in order to load `url` */
    route(url: string): Promise<string>;
    /**
     * The real URL a routed one stands for (the inverse of `route()`, with
     * this controller's codec), or null for anything that is not a route: a
     * host reading a routed URL off a frame or a report never has to parse
     * one itself.
     */
    unroute(url: string): Promise<string | null>;
    /** whether this controller shows the sites from a pool of origins (ControllerInit.sitePool) */
    get siteMode(): boolean;
    createFrame(element?: HTMLIFrameElement): Frame;
}
/**
 * The site pool: how many of the frame's entries are in other runs than
 * the one at `at` (the documents' `historyAcross`). The browser lists a
 * document the entries of its own origin around it, so a run of the same
 * origin with nothing but emptied runs between (a replace) is in that list
 * already
 */
export declare function entriesAcross(runs: readonly {
    origin: string;
    count: number;
}[], at: number): number;
/**
 * What every agent is told of a frame's runs, for the next document of the
 * frame (history.ts RunsExpectation), null while it has none
 */
export declare function runsExpectation(runs: readonly {
    origin: string;
    count: number;
    index: number;
}[], at: number): RunsExpectation | null;
/** a run's entries after the frame left it for a new one at `index` (a replace took that entry with it) */
export declare function prunedRun(run: {
    count: number;
    index: number;
}, replaced: boolean): void;
/**
 * A proxied frame. Dispatches `navigate` (CustomEvent, `detail` is a
 * NavigateInfo) whenever the page reports a new URL, title or history state.
 */
export declare class Frame extends EventTarget {
    #private;
    controller: StompController;
    element: HTMLIFrameElement;
    /** the last report from the page, if any */
    lastNavigate: NavigateInfo | null;
    constructor(controller: StompController, element: HTMLIFrameElement, sandbox?: string | null);
    /** the last title the page reported, else the document's */
    get title(): string | null;
    /**
     * Navigate the frame. Resolves when the new document first reports (url,
     * title, history state), REPORT_GRACE_MS after the frame's load event when
     * the document is one that never reports, NAVIGATION_WAIT_MS at the most.
     * Listen for the frame's `load` before calling when you need that event.
     */
    go(url: string): Promise<void>;
    /**
     * Step the frame's history as a tab's Back and Forward do: its own
     * entries and those of the frames in it, never the page that embeds the
     * frame or another frame of that page (src/controller/history.ts).
     * Resolves false when there is no entry in that direction, so a host can
     * show its own "nothing to go back to" state.
     */
    back(): Promise<boolean>;
    forward(): Promise<boolean>;
    /** whether the frame's history (nested frames included) has an entry before/after the current one; null when the browser cannot tell */
    get canGoBack(): boolean | null;
    get canGoForward(): boolean | null;
    /** reload the frame; resolves when the reloaded document first reports (false when there was no document to reload) */
    reload(): Promise<boolean>;
    /** the URL the frame is currently showing, if it is a proxied page */
    get url(): string | null;
}
export default StompController;
