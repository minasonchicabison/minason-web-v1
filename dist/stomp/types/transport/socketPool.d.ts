import type { ProxyTransport, RawHeaders, TransferrableResponse } from '@mercuryworkshop/proxy-transports';
/** requests in flight to an HTTP/1 group */
export declare const PER_GROUP = 6;
/** HTTP/1 requests in flight to every group together */
export declare const TOTAL = 256;
/** WebSockets open or opening */
export declare const WEBSOCKETS = 255;
/** a request the page gave up on while it waited for a connection: it never goes out */
export declare class QueuedCancel extends Error {
    constructor();
}
/** what the pool takes of a request: its group and its place in line (REQUEST_QUEUE) */
export interface PoolFields {
    /** scheme, host and port */
    origin: string;
    partition: string;
    credentials: string;
    urgency: number;
    /** the worker's name for it, for a raise or a cancel ('' for none) */
    id: string;
    /** when the browser asked for it (ms since the epoch) */
    asked: number;
    image: boolean;
}
/** the verbose log's connection line, but for the transport it names */
export type PoolLine = [
    version: string | undefined,
    origin: string,
    partition: string,
    credentials: string,
    nth: number
];
/** what the pool gave a request, as the realm that asked holds it */
export interface Held {
    /** it counts against the limits (an HTTP/1 request, or one to a server not known yet) */
    counted: boolean;
    /**
     * The response came over `version`: the group learns whether it
     * multiplexes, and `line` hears the verbose log's line when there is
     * one to tell. True: it holds its connection until its body ends.
     */
    learn(version: string | undefined, line?: (line: PoolLine) => void): boolean;
    /** it lets its connection go (its body ended, or it failed) */
    release(): void;
}
/** the pool's fields of a request to `url` with `headers` (see SocketPool.take) */
export declare function fieldsOf(url: URL, headers: RawHeaders): PoolFields;
/** what a request holds while it is in flight */
export interface Ticket {
    /** the response came: learns the group's protocol, releases at the body's end */
    answered(response: TransferrableResponse): TransferrableResponse;
    /** the request failed */
    failed(): void;
}
/**
 * Whether `transport` says which HTTP version each response came over
 * (fieldSupport.httpVersion: our epoxy build). Only then are its requests
 * queued: a transport that does not would have every HTTP/2 server held to
 * six requests at a time.
 */
export declare const reportsVersion: (transport: ProxyTransport) => boolean;
/** `body`, calling `done` once when it ends, fails or is cancelled */
export declare function untilDone(body: ReadableStream<Uint8Array>, done: () => void): ReadableStream<Uint8Array>;
/** the HTTP connections of one transport, or of every realm the host serves, as Chrome's socket pool keeps them */
export declare class SocketPool {
    #private;
    constructor(transport?: ProxyTransport | null);
    /**
     * Wait for a connection for a request to `url` with `headers` (the
     * worker's REQUEST_QUEUE and NETWORK_PARTITION fields name its urgency,
     * credentials and partition; a request without them is a credentialed
     * one of urgency 1, a fetch's). `waits` hears the worker's name for an
     * image's request that has to wait.
     */
    take(url: URL, headers: RawHeaders, waits?: (id: string) => void): Promise<Ticket>;
    /** a Ticket of what `held` holds, for a response of this pool's transport */
    ticketOf(held: Held): Ticket;
    /**
     * Wait for a connection for the request `fields` names, of `realm` (the
     * host's name for the realm that asked; '' for this one): each realm's
     * groups learn for themselves whether they multiplex, and count against
     * the same limits
     */
    hold(fields: PoolFields, waits?: (id: string) => void, realm?: string): Promise<Held>;
    /**
     * The page gave the request `id` up (or its document went): if it still
     * waits, it leaves the line and never goes out, as Chrome drops a
     * cancelled request from its socket pool's queue. One that already went
     * lets its connection go to the next in line now, as Chrome closes the
     * socket of a request it cancels: a request whose server never answers
     * held one of its six until the server did. (The transport cannot stop
     * it; the worker drops its answer.)
     */
    cancel(id: string): void;
    /**
     * The page laid the image `id` out in its viewport: if it still waits, it
     * waits at `urgency` from now on (behind those already there), as Chrome
     * raises an image in the viewport to a fetch's urgency once laid out.
     */
    raise(id: string, urgency: number): void;
}
/** what a WebSocket holds from the gate */
export interface SocketPass {
    /** the handshake ended (open or failed): the next one to its host and port may start */
    connected(): void;
    /** the socket is gone */
    closed(): void;
}
/** the host and port of a WebSocket to `url`, whose handshakes go one at a time */
export declare const endpointOf: (url: URL) => string;
/** the WebSockets of one transport, or of every realm the host serves, as Chrome limits them */
export declare class WebSocketGate {
    #private;
    readonly limit: number;
    /** `limit`: the sockets open or opening at once, past which a new one fails */
    constructor(limit?: number);
    /** wait for a handshake to `url` to be allowed; null: too many sockets (it fails) */
    admit(url: URL): Promise<SocketPass | null>;
    /** wait for a handshake to the host and port `key` to be allowed; null: too many sockets */
    admitTo(key: string): Promise<SocketPass | null>;
}
/** the pool and gate a transport's requests and WebSockets ask */
export interface TransportPool {
    http: Pick<SocketPool, 'take' | 'cancel' | 'raise'>;
    ws: Pick<WebSocketGate, 'admit'>;
}
/**
 * The pool and WebSocket gate of `transport` (one each, whichever port
 * serves it): the carrier host's, every realm of the origin's, while this
 * realm has a host to ask
 */
export declare function poolOf(transport: ProxyTransport): TransportPool;
