import { type AdblockApplied, type AdblockList, type AdblockOptions, type SiteShields } from '../blocker/types';
import type { Assets, Config, ConfigCodec } from '../config';
import { type HelperNames } from '../helperNames';
import { type HookErrorInfo, type InitHooks } from '../hooks';
import type { PasskeyManager, PasskeyRequest, PasskeysInit } from '../passkeys/types';
import type { NavigateInfo, RequestInfo, RequestRule } from '../transport/messages';
import type { CarrierInfo } from '../transport/wispWebTransport';
import { CookieJar } from './index';
import { StaleInfo, TransportDescriptor } from './messages';
import { type Shields } from './shields';
import type { SitePoolInit } from './sitePool';
export interface RemoteControllerInit {
    /** origin that serves dist/ and the proxied content, e.g. https://proxy.example.com */
    proxyOrigin: string;
    /** pathname of dist/ on that origin, default `/stomp/` */
    directory?: string;
    /**
     * the controller's id (see ControllerInit.id): minted here when omitted and
     * handed to the controller frame, so the host knows the address its frames
     * load from and can store it per tab
     */
    id?: string;
    /**
     * the transport, described: the controller frame instantiates it on the
     * proxy origin, in its transport worker unless `host: 'page'`
     */
    transport: TransportDescriptor;
    codec?: ConfigCodec;
    /**
     * sandbox flags for proxied frames. The default keeps scripts, forms,
     * popups, modals and downloads and deliberately omits top navigation so a
     * page can never navigate the host.
     */
    sandbox?: string;
    /** how often (ms) to refresh url/title of frames; 0 disables */
    pollInterval?: number;
    /**
     * Called when a proxied page wants a new tab (`window.open`, a link with
     * `target="_blank"` or a name, a modifier click). The page's `window.open`
     * then returns null, like a popup blocker. Without it, popups open
     * natively as bare proxied tabs.
     */
    onOpen?: (url: string, frame: RemoteFrame) => void;
    /**
     * Called whenever a proxied page reports where it is (load, pushState,
     * hashchange, title change); the same information arrives as a
     * `navigate` CustomEvent on the RemoteFrame (`event.detail`). The poll
     * (`pollInterval`) stays as a fallback and can be disabled with 0.
     */
    onNavigate?: (info: NavigateInfo, frame: RemoteFrame) => void;
    /** HTTP cache in the service worker, on by default; `false` turns it off (see StompController) */
    cache?: boolean;
    /** a script the rewriter cannot parse fails instead of running raw when `false` (see StompController) */
    allowInvalidJs?: boolean;
    /** the window membrane, on unless `false` (see StompController) */
    membrane?: boolean;
    /** emulated service workers, on unless `false` (see StompController) */
    serviceWorkers?: boolean;
    /** Workers that rewrite scripts for the service worker; `0` starts none (see StompController) */
    rewriteWorkers?: number;
    /** ms the service worker waits on a rewrite worker before rewriting itself (see StompController) */
    rewriteTimeout?: number;
    /** request rules run in the service worker (see StompController) */
    rules?: RequestRule[];
    /** per-site shields the controller starts with (see StompController.shields) */
    shields?: SiteShields[];
    /** called after `controller.shields.set(...)` to persist the change (see StompController) */
    onShieldsChange?: (host: string, state: SiteShields) => void;
    /** the served file names, when the host renamed them (see StompController) */
    assets?: Assets;
    /** the deployment's helper names (see StompController.names) */
    names?: Partial<HelperNames>;
    /** host code for every proxied realm (see StompController.hooks); a `{ url }` must be readable from the proxy origin, where the controller frame fetches it */
    hooks?: InitHooks;
    /** the built-in blocker (see StompController.adblock) */
    adblock?: boolean | AdblockOptions;
    /** filter lists to start the blocker with in place of the defaults (see StompController.adblockLists) */
    adblockLists?: (string | AdblockList)[];
    /** a host hook threw in a proxied realm, or a hook URL failed (see StompController) */
    onHookError?: (info: HookErrorInfo) => void;
    /**
     * The host's own page for a document the proxy failed to produce (see
     * StompController): a path on the proxy origin, where the worker runs,
     * so in this mode the page must be served from the proxy host.
     */
    errorPage?: string;
    /** one report per proxied request, with the RemoteFrame when known (see StompController.onRequest) */
    onRequest?: (info: RemoteRequestEvent) => void;
    /**
     * the transport's verbose log on this page's console (see
     * StompController.debugTransport); without it, this origin's
     * `localStorage['stomp:debug-transport'] = '1'` turns it on
     */
    debugTransport?: boolean;
    /**
     * a proxied site asks for a permission the proxy origin holds for another
     * site (see StompController.onPermissionRequest); the frames that should
     * reach the browser's own prompts need an `allow` attribute in this mode
     */
    onPermissionRequest?: (request: RemotePermissionRequest) => boolean | null | Promise<boolean | null>;
    /**
     * The site pool (see StompController's sitePool): origins that serve the
     * proxy as `proxyOrigin` does, other ports of its host, from which the
     * controller frame shows each site, so the browser gives a page and a
     * frame of another site in it a process each. Their documents are this
     * page's frames as the proxy origin's are; a slot that does not answer
     * leaves its sites on `proxyOrigin`.
     */
    sitePool?: SitePoolInit | false;
    /**
     * Passkeys for proxied sites (docs/passkeys.md), off unless given: STomp
     * is the passkey provider (see StompController's ControllerInit.passkeys).
     * The service worker holds the keys; `onRequest`, in this page, asks the
     * user about every passkey made and every sign-in.
     */
    passkeys?: RemotePasskeysInit;
}
/** a proxied site's passkey ceremony the host is asked about (RemoteControllerInit.passkeys) */
export interface RemotePasskeyRequest extends PasskeyRequest {
    /** the frame the request came from, when its page reported its client id */
    frame: RemoteFrame | null;
}
/** the passkeys option (see RemoteControllerInit.passkeys) */
export type RemotePasskeysInit = PasskeysInit<RemotePasskeyRequest>;
/** a site's permission request (see StompController's PermissionRequest) */
export interface RemotePermissionRequest {
    origin: string;
    permission: string;
    frame: RemoteFrame | null;
}
/** a RequestInfo with the frame it belongs to (see StompController's RequestEvent) */
export interface RemoteRequestEvent extends RequestInfo {
    frame: RemoteFrame | null;
}
export declare const DEFAULT_SANDBOX = "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-pointer-lock allow-presentation allow-orientation-lock allow-storage-access-by-user-activation";
/**
 * Events, as on StompController: `navigate`, `open`, `request` alongside the
 * callbacks; `carrier` (detail: CarrierInfo) as on StompController; `stale` (detail: StaleInfo) when the
 * controller frame's service worker is another build than its controller
 * and could not be replaced in time, `rebind` once the builds agree again.
 */
export declare class RemoteController extends EventTarget {
    #private;
    proxyOrigin: string;
    /** the scope on the proxy origin; the controller's address is `config.directory` */
    directory: string;
    /**
     * the controller's id (ControllerInit.id): the host's own at once, else
     * the one kept here, on the host's origin, which the controller frame is
     * given (empty until then, before `wait()` resolves)
     */
    id: string;
    /** the build this host-side bundle came from (see StompController.build); the controller frame's is `config.build` once it answered */
    readonly build: string;
    config?: Config;
    /** the inner controller's `stale` (see StompController); null while the builds agree */
    stale: StaleInfo | null;
    /** the inner controller's `carrier` (see StompController), with its `carrier` event */
    carrier: CarrierInfo | null;
    frames: RemoteFrame[];
    isReady: boolean;
    readonly element: HTMLIFrameElement;
    constructor(init: RemoteControllerInit);
    wait(): Promise<void>;
    route(url: string): Promise<string>;
    /** whether the controller frame shows the sites from a pool of origins (see StompController.siteMode) */
    get siteMode(): boolean;
    /** the real URL a routed one stands for, null for a non-route (see StompController.unroute) */
    unroute(url: string): Promise<string | null>;
    /** replace the request rules (see StompController.setRules) */
    setRules(rules: RequestRule[]): Promise<void>;
    /** per-site shields (see StompController.shields) */
    get shields(): Shields;
    /** the blocker's default filter lists (see StompController.adblockDefaults) */
    adblockDefaults(): AdblockList[];
    /** the filter lists the blocker is serving now (see StompController.getAdblockLists) */
    getAdblockLists(): AdblockList[];
    /** replace the blocker's filter lists at runtime (see StompController.setAdblockLists) */
    setAdblockLists(lists: (string | AdblockList)[]): Promise<AdblockApplied>;
    /** re-fetch and recompile the blocker's current lists (see StompController.refreshAdblockLists) */
    refreshAdblockLists(): Promise<AdblockApplied>;
    /** drop every entry of the service worker's HTTP cache */
    clearCache(): Promise<void>;
    /** the passkeys the service worker holds for proxied sites (see StompController.passkeys) */
    readonly passkeys: PasskeyManager;
    /** the cookie jar, for the host application only (see StompController.cookies) */
    readonly cookies: CookieJar;
    /** clear a site's virtualized storage (see StompController.forgetStorage) */
    forgetStorage(origin: string): Promise<void>;
    setTransport(transport: TransportDescriptor): Promise<void>;
    createFrame(element?: HTMLIFrameElement): RemoteFrame;
}
/**
 * A proxied frame on the proxy origin. Dispatches `navigate` (CustomEvent,
 * `detail` is a NavigateInfo) whenever the page reports a new URL, title or
 * history state; the fields below follow the reports and the poll.
 */
export declare class RemoteFrame extends EventTarget {
    #private;
    controller: RemoteController;
    element: HTMLIFrameElement;
    /** last known real URL of the page, from the page's reports and the poll */
    url: string | null;
    /** last known document title */
    title: string | null;
    /** last known: whether the frame's history (nested frames included) has an entry before/after the current one; null when unknown */
    canGoBack: boolean | null;
    canGoForward: boolean | null;
    constructor(controller: RemoteController, element: HTMLIFrameElement, sandbox: string);
    /** navigate the frame; resolves when the new document first reports (see Frame.go) */
    go(url: string): Promise<void>;
    /**
     * Step the frame's history as a tab's Back and Forward do (see
     * Frame.back), relayed through the controller frame. Resolves false when
     * there is no entry in that direction.
     */
    back(): Promise<boolean>;
    forward(): Promise<boolean>;
    /** reload the frame; resolves when the reloaded document first reports (false when there was nothing to reload) */
    reload(): Promise<boolean>;
    /** fetch the current url/title from the controller frame */
    refresh(): Promise<void>;
}
