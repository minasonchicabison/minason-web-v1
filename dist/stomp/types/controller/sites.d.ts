import type { HostGeometry, SitesConfig } from '../config';
import type { PasskeyAnswer, PasskeyPrompt, PasskeysConfig } from '../passkeys/types';
import type { IdentityChooserRequest, PermissionRequestInfo, RequestInfo, SiteArrival, TransportModule } from '../transport/messages';
import { RpcHelper } from '../transport/rpc';
import type { DecorateHandshake } from '../transport/serveTransport';
import type { AdmitSession } from '../transport/webTransportHost';
import type { SiteHistoryAnswer, SiteHistoryOp } from './history';
import type { ControllerInit } from './index';
/** rpc id between the hub and an agent (one port each) */
export declare const SITE_RPC = "stomp-site-agent";
/** agent -> hub, on its window: it is up and waits for its init */
export declare const SITE_HELLO = "$stomp$siteHello";
/** hub -> agent, on its window, with the agent's rpc port */
export declare const SITE_INIT = "$stomp$siteInit";
/** the rpc id a decorate port speaks (the transport worker's own) */
export declare const DECORATE_RPC = "stomp-transport-worker";
/** what the hub hands an agent to start its controller with */
export interface SiteAgentInit {
    /** the hub's worker's codec key, which every slot's worker takes */
    codecKey: string;
    /** how many rewrite workers the hub runs (ports are made per handshake) */
    pool: number;
    /**
     * the hub's page is cross-origin isolated: the slot's documents are
     * served to load there (Config.isolated), which the agent, a frame of
     * another origin with no isolation delegated to it, cannot read itself
     */
    isolated: boolean;
    /** the hub's message token (Config.sites) */
    token: string;
    /**
     * the origin of the page whose frames show the proxied sites (the real
     * top, which the slot's documents never show as a window of their
     * world): the hub's own, or the host's when the hub is a controller
     * frame (RemoteController)
     */
    top?: string;
    /**
     * how many windows up from the agent that page is: 1 when the hub is
     * that page (the agent is its frame), 2 when the hub is a controller
     * frame in it
     */
    framesUp?: number;
    /** the pool's slots' origins (Config.sites) */
    origins: string[];
    /** how many slots the pool has (ControllerInitMessage.slots) */
    slots: number;
    /** the controller's options, as the hub's own were given (no functions) */
    controller: Partial<ControllerInit>;
    /**
     * the hub's passkeys (Config.passkeys): the slot's worker is the
     * authenticator of the sites it shows, with the credentials in the hub
     * origin's store (src/server/jarDB.ts), and the hub's host asks the user
     * (HubBound.passkeyPrompt)
     */
    passkeys?: PasskeysConfig;
}
/** implemented by the hub, called by an agent */
export type HubBound = {
    /** serve the transport on `port`, asking `decorate` for WebSocket handshake headers */
    serve: [{
        port: MessagePort;
        decorate: MessagePort;
    }];
    /** hand each of the hub's rewrite workers one of these ports, in order */
    rewritePorts: [MessagePort[]];
    /** the slot `site` is shown from (its origin), given one now when it has none */
    siteSlot: [string, string | null];
    /** a navigation leaves for `site`: its slot's origin once that slot's agent is up (it was handed `arrival`), or null */
    crossSite: [{
        site: string;
        arrival: SiteArrival;
    }, string | null];
    /** answer the agent's worker's cookie jar requests on this port (src/transport/jarServer.ts) */
    jar: [MessagePort];
    /** answer the agent's worker's blocker questions on this port (src/server/remoteBlocker.ts) */
    blocker: [MessagePort];
    /** a proxied request completed (the host's request log) */
    request: [RequestInfo];
    /** a site asks for a permission (ControllerInit.onPermissionRequest) */
    permission: [PermissionRequestInfo, boolean | null];
    /** a site's passkey ceremony asks the user (ControllerInit.passkeys), with the port that says the page gave up */
    passkeyPrompt: [
        {
            request: PasskeyPrompt;
            port: MessagePort;
        },
        PasskeyAnswer | null
    ];
    /** whether the focus is in the page of the frame that shows the document `client` (a ceremony's focus check) */
    passkeyFocused: [string, boolean];
    /** a site's FedCM account chooser, which the host's page draws, with the port that closes when the document goes away */
    identityChooser: [
        {
            request: IdentityChooserRequest;
            port: MessagePort;
        },
        number
    ];
    /** replace the transport (the agent's setTransport) */
    setTransport: [TransportModule];
};
/** implemented by an agent, called by the hub */
export type AgentBound = {
    /** the controller is up (its first handshake was answered) */
    ready: [undefined, boolean];
    /** a navigation from another slot's worker is on its way to this origin */
    arrive: [SiteArrival];
    /** the hub's clock: keep the worker running */
    tick: [];
    /** the hub's host changed something every worker is told (FannedMethod) */
    apply: [{
        method: FannedMethod;
        args: unknown;
    }];
    /**
     * run `run` of the history of the frame at `index` of the hub's page,
     * a stretch of it shown from this origin (history.ts answerRun); null
     * when there is no such frame
     */
    /** a command of the isolated RemoteController for the frame at `index` (frame.ts frameCommand) */
    command: [{
        index: number;
        command: SiteHistoryCommand;
    }, boolean | null];
    /** what the frame at `index` shows, when it is a document of this origin (RemoteController's frameInfo) */
    frameInfo: [number, SiteFrameInfo | null];
    /** a document of the frame at `index` got a user activation (RemoteController's frameActivated) */
    activated: [{
        index: number;
        token: string;
        nested: boolean;
    }, boolean];
    /** the frame at `index` of the hub's page has focus there (-1: none does) */
    focus: [number];
    /** the host's browser window as its frames' documents see it (HOST_GEOMETRY, ./geometry.ts) */
    geometry: [HostGeometry];
    /** which of these service worker clients the slot's worker does not know (the hub's ClientFrames) */
    goneClients: [string[], string[]];
    history: [
        {
            index: number;
            run: number;
            op: SiteHistoryOp;
        },
        SiteHistoryAnswer | null
    ];
};
/** what an agent reads of a frame of this origin (messages.ts FrameInfo) */
export interface SiteFrameInfo {
    url: string | null;
    title: string | null;
    canGoBack: boolean | null;
    canGoForward: boolean | null;
}
/**
 * what the hub's host changed for its own worker and every slot's worker
 * must hear too (the rules, the shields, the blocker's lists, a cleared
 * cache, a site's storage to forget), by the worker's method
 */
export type FannedMethod = 'rules' | 'shields' | 'adblock' | 'clearCache' | 'forgetStorage' | 'forgetDeviceIds' | 'viewport';
/** what the isolated RemoteController asks an agent of a frame's history (frame.ts frameCommand) */
export type SiteHistoryCommand = 'back' | 'forward' | 'reload' | 'typed' | 'canBack' | 'canForward';
/** what a StompController running as an agent is told to do differently (ControllerInit.agent) */
export interface SiteAgentHooks {
    codecKey: string;
    /** how many slots the pool has (SiteAgentInit.slots) */
    slots: number;
    /** the hub's page is cross-origin isolated (SiteAgentInit.isolated) */
    isolated: boolean;
    /** the hub's origin and its message token (Config.sites) */
    sites: SitesConfig;
    /** serves the transport through the hub; `bind` gives it the controller's handshake headers */
    worker: BrokeredTransport;
    /** the hub's rewrite workers */
    pool: BrokeredPool | undefined;
    siteSlot(site: string): Promise<string | null>;
    crossSite(args: {
        site: string;
        arrival: SiteArrival;
    }): Promise<string | null>;
    /** a port that asks the hub's cookie jar, for a handshake */
    jar(): MessagePort;
    /** a port that asks the hub's worker's blocker, for a handshake (a slot's worker builds no engine) */
    blocker: () => MessagePort;
    request(info: RequestInfo): void;
    permission(info: PermissionRequestInfo): Promise<boolean | null>;
    /** HubBound.passkeyFocused */
    passkeyFocused(client: string): Promise<boolean>;
    /** the controller's keep-alive, for the hub's clock */
    keepAlive?: () => void;
    /** the slot's worker took the controller's handshake (its hello): it is STomp's */
    heard?: () => void;
}
/**
 * answer a transport worker's decorate requests on `port` with `decorate`,
 * and its WebTransport admissions with `admit` (the slot's controller asks
 * the blocker as the hub's does for its own pages)
 */
export declare function answerDecorate(port: MessagePort, decorate: DecorateHandshake, admit: AdmitSession): void;
/** the handshake headers and admissions asked over `port` (answerDecorate's other end) */
export declare function decorateOver(port: MessagePort): {
    decorate: DecorateHandshake;
    admit: AdmitSession;
};
/**
 * An agent's transport: every port its controller would hand its transport
 * worker goes to the hub's, with a second port on which the agent answers
 * for the WebSocket handshake headers
 */
export declare class BrokeredTransport {
    #private;
    constructor(hub: RpcHelper<AgentBound, HubBound>);
    /** the controller's handshake headers hook */
    bind(decorate: DecorateHandshake, admit: AdmitSession): void;
    servePort(port: MessagePort): void;
    serve(): MessagePort;
    setTransport(descriptor: TransportModule): Promise<void>;
    terminate(): void;
}
/** an agent's rewrite workers: the hub's, a fresh port to each per handshake */
export declare class BrokeredPool {
    #private;
    constructor(hub: RpcHelper<AgentBound, HubBound>, size: number);
    ports(): MessagePort[];
    /** the hub's workers hold the hub's modules */
    adopt(): void;
    held(): string[][];
}
/** what the hub needs of the host's controller */
export interface HubHost {
    /** the host's options */
    init: ControllerInit;
    /** the page whose frames show the sites, and how far up from an agent it is (SiteAgentInit.top, framesUp) */
    top: string;
    framesUp: number;
    /** the scope's URL on the host's origin (the agents' directory has its path) */
    directory: URL;
    /** the controller frame's file and the agent script's, as the host serves them */
    frameFile: string;
    scriptFile: string;
    /** the host's codec key, once its worker answered */
    codecKey(): Promise<string>;
    /** the controller's options for an agent, once the host's controller is ready */
    agentOptions(): Promise<Partial<ControllerInit>>;
    /** how many rewrite workers the host runs */
    poolSize(): number;
    serve(port: MessagePort, decorate: MessagePort): void;
    /** answer a slot's worker's cookie jar requests on `port` */
    jar(port: MessagePort): void;
    /** answer a slot's worker's blocker questions on `port`, from the host's worker */
    blocker(port: MessagePort): void;
    rewritePorts(ports: MessagePort[]): void;
    /** a navigation from a slot's worker comes to the host's own worker (its slot is left out) */
    arrive(arrival: SiteArrival): Promise<void>;
    request(info: RequestInfo): void;
    permission(info: PermissionRequestInfo): Promise<boolean | null>;
    /** the host's passkeys, once its controller is ready (Config.passkeys) */
    passkeys(): PasskeysConfig | undefined;
    /** a slot's site's passkey ceremony: the host asks the user */
    passkeyPrompt(request: PasskeyPrompt, port: MessagePort): Promise<PasskeyAnswer | null>;
    /** HubBound.passkeyFocused */
    passkeyFocused(client: string): Promise<boolean>;
    /** HubBound.identityChooser */
    identityChooser(request: IdentityChooserRequest, port: MessagePort): Promise<number>;
    setTransport(descriptor: TransportModule): Promise<void>;
}
/**
 * The host's side of the site pool: which slot shows which site, and each
 * slot's agent, made the first time the slot shows a site and kept while the
 * host lives
 */
export declare class SiteHub {
    #private;
    constructor(host: HubHost, origins: string[]);
    /** whether `origin` is one of the pool's slots */
    has(origin: string): boolean;
    /** the pool's slots */
    get origins(): string[];
    /**
     * The slot `site` is shown from (its origin), once that slot's agent's
     * worker is up, or null when it is shown from this page's origin: its
     * slot does not answer from here (every slot, for a site without one).
     * `from` is the slot of the document a navigation comes from (a site
     * without a slot yet gets another one than that). A site keeps its slot
     * when it is shown from this page's origin: the slot may answer in the
     * next page, and its data is there.
     */
    originOf(site: string, from?: string): Promise<string | null>;
    /**
     * Once the page is idle, start the agents of the slots a site is likely
     * to be shown from next, the spares, so its first document does not wait
     * for its slot's agent and worker to start: the slot the next new site
     * would get (SiteSlots.next), and before this page showed any site, the
     * slot that showed one last (SiteSlots.last: the site a visit often
     * goes back to). Once it showed one, a new spare is started only when
     * no agent is idle (none of this page's documents was shown from its
     * slot). Not every slot: an agent is a renderer process and a worker
     * kept running, which a page that shows one site never uses, so a page
     * keeps one spare (two before its first site). A spare is never closed:
     * the hub's frames are counted by index in the page's `frames`, the
     * agents' too.
     */
    warm(): void;
    /**
     * A navigation from a document this page's origin shows (its worker's)
     * leaves for `site`: the origin it goes to once that origin's worker was
     * handed `arrival`, this page's own when the site's slot is left out
     */
    cross(site: string, arrival: SiteArrival): Promise<string>;
    /** the slot of `site` sent a navigation back here (its agent is gone): it is left out */
    homed(site: string): Promise<boolean>;
    /** no site is shown from the slot `origin` from now on (its worker said its agent is gone) */
    leaveOut(origin: string): void;
    /** a command of the isolated RemoteController for the frame at `index` of the host's page, to the agent of `origin` (AgentBound.command) */
    command(origin: string, index: number, command: SiteHistoryCommand): Promise<boolean | null>;
    /** ask the agent of `origin` about run `run` of the frame at `index` of this page (AgentBound.history) */
    history(origin: string, index: number, run: number, op: SiteHistoryOp): Promise<SiteHistoryAnswer | null>;
    /** tell every agent `op` of the frame at `index` of this page, unanswered (AgentBound.history) */
    tell(index: number, op: SiteHistoryOp): void;
    /** ask the agent of `origin` what the frame at `index` of the page shows (AgentBound.frameInfo) */
    frameInfo(origin: string, index: number): Promise<SiteFrameInfo | null>;
    /** tell the agent of `origin` of a user activation in the frame at `index` (AgentBound.activated) */
    activated(origin: string, index: number, token: string, nested: boolean): Promise<boolean>;
    /**
     * tell every agent the host's geometry this window keeps (HOST_GEOMETRY);
     * settles once each running agent heard. One still starting has it on its
     * port before any document of its slot loads (the hub's first call is its
     * `ready`), and one that never starts (a dead slot) holds nothing up.
     */
    geometry(): Promise<void>;
    /** tell every slot's worker what the hub's own was told (FannedMethod); settles once each heard */
    apply(method: FannedMethod, args: unknown): Promise<void>;
    /** tell the worker of one slot what the hub's own was told (FannedMethod), once it heard */
    applyTo(origin: string, method: FannedMethod, args: unknown): Promise<void>;
    /**
     * which of `clients` no slot's worker knows either: a document shown
     * from a slot is a client of that slot's worker, which the hub's own
     * worker never knows of. An agent that cannot answer keeps its clients
     * (they are asked again later; ClientFrames bounds what it keeps)
     */
    goneClients(clients: string[]): Promise<string[]>;
    /** the hub's clock: every agent keeps its worker running */
    tick(): void;
}
