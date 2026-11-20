import type { ProxyTransport, RawHeaders, TransferrableResponse } from '@mercuryworkshop/proxy-transports';
import type { Ride } from './riderPace';
/** TransportDescriptor.webTransport */
export interface WispWebTransportOptions {
    /**
     * the session's https: URL, its certificate checked as any site's (no
     * discovery document)
     */
    url?: string;
    /**
     * the relay's discovery document, resolved against the wisp URL (an
     * absolute one may name another host's); with neither this nor `url`, a
     * wss: wisp URL is dialed as https: and `/webtransport.json` on its
     * origin is asked only when that fails
     */
    discovery?: string;
    /**
     * how long the document, the session's handshake and its Wisp stream may
     * each take (ms); on a start that knows nothing of the relay, the session
     * may take half as long again in all before the WebSocket is ridden
     */
    timeoutMs?: number;
    /**
     * the most QUIC streams ("lanes", lane 0 counted) the session's Wisp
     * rides when the relay offers them: each has Chrome's 6 MiB window, and
     * a lost packet holds up only its own. The relay's number when unset;
     * 1 for one stream
     */
    lanes?: number;
}
export type Carrier = 'webtransport' | 'websocket';
/**
 * What a transport's wisp connection rides, as the controller and the host
 * page see it (StompController.carrier, its `carrier` event)
 */
export interface CarrierInfo {
    carrier: Carrier;
    /** the session's https: URL, or the WebSocket's wss: (ws:) one */
    url: string;
    /** from the transport's start to its wisp connection's first packet (ms) */
    ms: number;
    /** on the WebSocket: why not WebTransport (`off`: the descriptor has no `webTransport`) */
    why?: string;
    /** what the last transport to this relay in this realm rode, when it was the other carrier */
    previous?: Carrier;
    /** a transport to this relay rode the same carrier before in this realm: this one is a reconnect (a revival) */
    reconnected?: boolean;
    /** the transport module, as named by its URL (`epoxy`, `libcurl`) */
    transport?: string;
    /** whether the descriptor turned HTTP/3 on */
    http3?: boolean;
    /**
     * the carrier is the carrier host's, which this origin's transports
     * share (carrierHost.ts): how long it had been up when this transport
     * took it, in ms (0: it was opened for this one)
     */
    shared?: number;
    /** the session's lanes, lane 0 counted (1: one stream, as a relay without them) */
    lanes?: number;
    /** the relay opened the session's Wisp stream (in the flight of its answer) */
    serverStream?: boolean;
}
/** what CarrierTransport tells of the transport it carries, beside the carrier */
export interface CarrierLabel {
    transport: string;
    http3: boolean;
}
/** the text RevivingTransport takes for a wisp connection that is gone (its DEAD) */
export declare const CARRIER_LOST = "WebTransportCarrierLost";
/** how long a start that knows nothing of the relay waits for the session */
export declare const firstStartMs: (timeoutMs: number) => number;
/** where a relay's session is looked for, and what it is remembered by */
export interface RelayPlan {
    key: string;
    discovery?: string;
    direct?: string;
    /** `direct` first, the document only when it fails (no option named either) */
    derived?: boolean;
}
/** the plan for a wisp URL and its options */
export declare function relayPlan(wisp: string, options: WispWebTransportOptions): RelayPlan;
/** how a derived plan's session was had */
type Via = 'direct' | 'document';
/** what memory.get answers: `quiet` the WebSocket alone, `retry` a session beside it */
export type Known = 'worked' | 'quiet' | 'retry';
/** a discovery document as fetched (null: none at that URL), kept by URL */
interface KeptDocument {
    document: {
        url?: unknown;
        hashes?: unknown;
    } | null;
    until: number;
}
/**
 * What each relay's session did, by RelayPlan.key, and the discovery
 * documents fetched, by URL: in this realm, and in IndexedDB for the next
 * page or worker of this origin. Storage that cannot be had (a private
 * window's, a sandbox's) only loses the second.
 */
export declare const memory: {
    get(key: string): Promise<Known | undefined>;
    /** a failure's quiet: when it failed and until when nothing is tried beside the WebSocket */
    quiet(key: string): {
        failed: number;
        until: number;
    } | undefined;
    /** why the relay's session failed last, when it did */
    reason(key: string): string | undefined;
    /** how the session that worked was had */
    via(key: string): Via | undefined;
    worked(key: string, via: Via): void;
    /** the session could not be had: the WebSocket alone for a while */
    failed(key: string, reason: string): void;
    /**
     * a session ended under its requests without a close (UDP lost
     * under it, a relay gone): the next start rides the WebSocket at once
     * and tries a session beside it, which tells the two apart
     */
    lost(key: string): void;
    /** the network changed: what failed on the old one is tried beside the WebSocket */
    forgetFailures(): void;
    /** the document kept for `url`: undefined when none is, null when it has none */
    document(url: string): Promise<KeptDocument["document"] | undefined>;
    keepDocument(url: string, document: KeptDocument["document"]): void;
};
/** `listener` hears every choice a transport of this realm makes; returns the unwatch */
export declare function watchCarrier(listener: (info: CarrierInfo) => void): () => undefined;
/** what epoxy's function transport gives back (EpoxyWispTransportResult) */
export interface WispPipe {
    read: ReadableStream<ArrayBuffer>;
    write: WritableStream<Uint8Array>;
    /**
     * one more wisp connection over the same carrier, as a port another
     * realm speaks Wisp on (wispSplit.ts lanePipe); null once the carrier is
     * gone. A carrier host's rider has it (carrierClient.ts `ride`), paced
     * when `credit` (riderPace.ts)
     */
    more?: () => Promise<Ride | null>;
}
/** a carrier that is open, its first Wisp packet read (buffered for epoxy) */
export interface OpenCarrier {
    carrier: Carrier;
    url: string;
    pipe: WispPipe;
    /** closes it, as the one not taken */
    close(): void;
    /** settles when it ends; rejects when it ended without a close of the relay's */
    ended: Promise<void>;
    /** the WebSocket's: settles with its close code once it closed */
    closed?: Promise<number>;
    /** the Wisp packets it carried each way, and of them as datagrams (the session's) */
    stats?: PipeStats;
    /** a wisp connection of the carrier host's (carrierHost.ts), which tells how the carrier ends */
    hosted?: boolean;
    /** WispPipe.more: more riders of the carrier host's relay */
    more?: () => Promise<Ride | null>;
}
/**
 * The notes of a carrier that ends, and a session lost without a close of
 * the relay's remembered as lost: the next start rides the WebSocket at
 * once and tries a session beside it, which tells the two apart
 */
export declare function watchEnd(open: OpenCarrier, key: string): void;
/** what a session carried, for the note when it ends */
interface PipeStats {
    sent: number;
    received: number;
    datagramsSent: number;
    datagramsReceived: number;
    /** the lanes, lane 0 counted */
    lanes: number;
    /** the relay opened lane 0 */
    server: boolean;
}
/** the discovery document's URL for a wisp URL (relayPlan's, when it has one) */
export declare function discoveryURL(wisp: string, options: WispWebTransportOptions): string | undefined;
/**
 * The packets of a wisp WebSocket to `url`, open once the relay spoke, as
 * epoxy would open its own (ShardedTransport, given a wisp URL)
 */
export declare function wispSocketPipe(url: string, protocols: string[]): Promise<WispPipe>;
type TransportClass = new (...args: unknown[]) => ProxyTransport;
/**
 * What chooses and opens a relay's carrier (see the top of the file): the
 * transport's own (CarrierTransport), or the carrier host's that every
 * transport of the origin shares (carrierHost.ts)
 */
export declare class Chooser {
    #private;
    /** the session tried beside the WebSocket, settled (for tests and the demo) */
    probed: Promise<boolean>;
    constructor(wisp: string, first: unknown, webTransport: WispWebTransportOptions | null);
    /** the WebSocket, opened as epoxy's own would be */
    socket(): Promise<OpenCarrier>;
    /**
     * The carrier to ride (null: neither could be opened, the transport as
     * given), and why it is not the session when it is not
     */
    choose(plan: RelayPlan): Promise<{
        open: OpenCarrier | null;
        why: string;
    }>;
}
/**
 * Epoxy over the relay's WebTransport session or its WebSocket, whichever
 * init() chose (see the top of the file). Until init() chose, and when
 * neither could be opened, `base` is the transport as given.
 */
export declare class CarrierTransport implements ProxyTransport {
    #private;
    /** which carrier the wisp connection rides: null before init() chose */
    carrier: Carrier | null;
    /** the choice, as the console and the host have it */
    info: CarrierInfo | null;
    /**
     * `Transport` may be the promise of the class (its module loading): the
     * carrier is then chosen at once, while the module loads, as nothing of
     * the choice needs the transport
     */
    constructor(Transport: TransportClass | Promise<TransportClass>, options: unknown[], webTransport: WispWebTransportOptions | null, label?: CarrierLabel | null);
    /** the session tried beside the WebSocket, settled (for tests and the demo) */
    get probed(): Promise<boolean>;
    /** settles once the transport's class is in (constructed with its promise) */
    get loaded(): Promise<void>;
    /**
     * whether init() opens the wisp connection itself (no `webTransport`):
     * warmTransport must not open another
     */
    get opensWisp(): boolean;
    /** the transport in use (serveTransport and webTransportHost look through it) */
    get base(): ProxyTransport;
    get ready(): boolean;
    set ready(value: boolean);
    get client(): unknown;
    get fieldSupport(): unknown;
    init(): Promise<void>;
    meta(): Promise<void>;
    request(remote: URL, method: string, body: BodyInit | null, headers: RawHeaders, signal: AbortSignal | undefined): Promise<TransferrableResponse>;
    connect(...args: Parameters<ProxyTransport['connect']>): [(data: import("@mercuryworkshop/proxy-transports").WebSocketDataType) => void, (code: number, reason: string) => void];
}
export {};
