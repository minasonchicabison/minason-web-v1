import type { ProxyTransport, RawHeaders, TransferrableResponse } from '@mercuryworkshop/proxy-transports';
/** a datagram channel bound to one remote: one Uint8Array per datagram each way */
export interface DatagramChannel {
    read: ReadableStream<Uint8Array>;
    write: WritableStream<Uint8Array>;
    /**
     * The wisp close reason the stream ended with, once `read` has ended
     * (epoxy builds with deploy/epoxy's patch 0058; older ones have no such
     * method and the reason is not known)
     */
    closeReason?: () => number | undefined;
}
export type UdpOpener = (host: string, port: number) => Promise<DatagramChannel>;
/** `TransportDescriptor.http3`; everything optional */
export interface Http3Options {
    /** URL of stomp-h3's `stomp_h3.js` (default: `h3/stomp_h3.js` next to the transport module) */
    module?: string;
    /** origins (`https://host[:port]`, or `host:port`) to use h3 on without an Alt-Svc first, like Chrome's `--origin-to-force-quic-on` */
    force?: string[];
    /** a DNS-over-HTTPS endpoint (RFC 8484, e.g. `https://cloudflare-dns.com/dns-query`) asked for HTTPS records; off when unset */
    dns?: string;
    /** extra trusted root certificates (PEM) for QUIC; tests */
    pem?: string;
    /** ms a QUIC handshake may take before the origin is marked broken (10000) */
    timeout?: number;
    /** ms a request waits for a reconnect to an origin QUIC already worked for (300) */
    wait?: number;
    /** instance hosts only (a function cannot cross into a worker): how to open a UDP channel when the base transport has no `client.connect_udp` */
    udp?: UdpOpener;
}
export interface H3Response {
    status: number;
    headers: RawHeaders;
    body: ReadableStream<Uint8Array> | null;
}
export interface H3Connection {
    readonly alive: boolean;
    readonly handshake_ms: number;
    /** PING frames sent so far (stomp-h3 builds with the 15 s keep-alive; undefined before) */
    readonly pings?: number;
    stats(): Record<string, number>;
    close(): void;
    request(method: string, url: string, headers: RawHeaders, body: Uint8Array | ReadableStream<Uint8Array> | null): Promise<H3Response>;
}
export interface H3Module {
    default(): Promise<unknown>;
    connect(host: string, readable: ReadableStream<Uint8Array>, writable: WritableStream<Uint8Array>, options: {
        pem?: string;
        timeoutMs?: number;
    }): Promise<H3Connection>;
}
/** what `info()` reports */
export interface Http3Info {
    enabled: boolean;
    moduleError: string | null;
    /** HTTP/3 is off for every origin until then: the wisp relay is taken to have no UDP */
    udpBlockedUntil: number | null;
    /** a datagram came back over this wisp connection, so its relay has UDP */
    udpCarried: boolean;
    /** hosts the relay refused a UDP stream to while nothing had been carried */
    udpRefused: string[];
    altSvc: {
        origin: string;
        port: number;
        expires: number;
        source: string;
        brokenUntil: number | null;
        /** broken because the wisp relay refused the UDP stream */
        refused: boolean;
    }[];
    connections: {
        origin: string;
        alive: boolean;
        stats: Record<string, number>;
    }[];
    /** how each of the last requests went: `h3`, `base`, or `base-after-h3` (an h3 failure retried) */
    recent: {
        url: string;
        via: 'h3' | 'base' | 'base-after-h3';
    }[];
}
/**
 * How long Chrome lets a QUIC connection go without hearing from its peer
 * while it has packets out before it closes it as a blackhole
 * (QUIC_TOO_MANY_RTOS, "Network blackhole detected"): quiche's
 * GetNetworkBlackholeDelay for its default of two tail loss probes and
 * five retransmission timeouts, each twice the last. Measured in headless
 * Chrome 157 against test/wtserver.mjs with every datagram dropped after
 * the first request: the second request's connection was closed so 6.4 s
 * after it went out (an RTT of about 1 ms: 2 x 101.5 + 31 x 200 ms), and
 * Chrome sent the request again on a new connection. The mean deviation
 * quiche adds four times is taken as a quarter of the RTT (stomp-h3 reports
 * the smoothed RTT alone), which is what it settles near on a steady path;
 * under 200 ms of RTT the floor decides either way.
 */
export declare function blackholeDelay(rttMs: number): number;
/**
 * The request header list stomp-h3 sends: the caller's, lowercased, with the
 * base transport's Accept-Encoding left in its place (stomp-h3 writes the
 * codings it decodes into that field, so it goes out where Chrome sends it),
 * with User-Agent and (for a typed body) Content-Type added as epoxy adds them,
 * and Content-Length for a body whose length stomp-h3 has measured. Chrome
 * sends Content-Length over HTTP/3 for every body it has in hand; HTTP/1 and
 * HTTP/2 through hyper add it for a buffered body on their own, but stomp-h3
 * does not, so without this a server that needs a length refuses the request
 * (IIS answers 411 Length Required, as every Bing API POST did). A body of
 * unknown length (a page's own ReadableStream) goes out without one, as
 * natively, and a bodyless POST or PUT says zero, as Chrome's network stack
 * says it for those two methods only (a bodyless PATCH carries none).
 */
export declare function h3RequestHeaders(method: string, headers: RawHeaders, contentType: string | null, h3: Uint8Array | ReadableStream<Uint8Array> | null): RawHeaders;
export default class Http3Transport implements ProxyTransport {
    #private;
    readonly base: ProxyTransport;
    /**
     * `moduleUrl` is where stomp_h3.js lives (resolved by the host);
     * `options.module` wins when given. `workerUrl` is a script that serves
     * stomp-h3 when started as a worker named H3_WORKER_NAME (the transport
     * worker's): stomp-h3 then runs on that thread (h3Thread.ts), or in this
     * realm when that worker cannot start or load it.
     */
    constructor(base: ProxyTransport, options?: Http3Options, moduleUrl?: string, workerUrl?: string);
    /**
     * What the host may send (serveTransport's fitHeaders): Priority when the
     * base keeps it to HTTP/2, which stomp-h3 sends over HTTP/3 as Chrome
     * does (without this the field was dropped from every request of a host
     * that turned HTTP/3 on), and the base's Accept-Encoding, in the host's
     * place among the fields: the base put its own before Accept-Language,
     * which is not where Chrome sends it when the page set that field.
     * stomp-h3 keeps the field in that place and gives it the codings it
     * decodes (Chrome's gzip, deflate, br, zstd)
     */
    get fieldSupport(): {
        priority?: boolean;
        partition?: string;
        httpVersion?: boolean;
        acceptEncoding?: string;
    };
    get ready(): boolean;
    set ready(value: boolean);
    init(): Promise<void>;
    meta(): Promise<void>;
    connect(...args: Parameters<ProxyTransport['connect']>): [(data: import("@mercuryworkshop/proxy-transports").WebSocketDataType) => void, (code: number, reason: string) => void];
    /** what the wrapper knows: alt-svc entries, connections, the last requests */
    info(): Http3Info;
    /** close every QUIC connection (they also close themselves after 30 s idle) */
    closeAll(): void;
    request(remote: URL, method: string, body: BodyInit | null, headers: RawHeaders, signal: AbortSignal | undefined): Promise<TransferrableResponse>;
}
