import type { RawHeaders, TransferrableResponse, WebSocketDataType } from '@mercuryworkshop/proxy-transports';
import type { PortBody } from './bodyPort';
import type { TransportToHost } from './messages';
import type { Ride } from './riderPace';
/** the name a shard's worker is started with, then its number */
export declare const SHARD_WORKER_NAME = "stomp-shard";
export declare const SHARD_RPC = "$stomp$shard";
/** what a shard says of the transport it made */
export interface ShardFacts {
    /** the transport's fieldSupport (serveTransport's fitHeaders) */
    fieldSupport?: unknown;
    /** whether its client opens raw streams of each kind */
    raw: RawKind[];
}
export type RawKind = 'udp' | 'tcp' | 'tls';
/** implemented by a shard (shardWorker.ts), called by the transport worker */
export type ShardBound = {
    /**
     * import `module` and construct its transport with `options`, the first
     * given a `wisp` that asks for a lane (ShardToHost.lane), and init it
     */
    make: [{
        instance: number;
        module: string;
        options: unknown[];
    }, ShardFacts];
    /** the transport `instance` is let go */
    drop: [number];
    /** open its wisp connection now (epoxy's replace_stream_provider), unless it has one */
    warm: [number];
    /**
     * end the wisp connections of the transport `instance` here: its carrier
     * ended where the shard cannot hear it (the carrier host's realm went
     * away), or the shard closes, and a carrier host's rider is let go
     */
    cut: [number];
    request: [
        {
            instance: number;
            remote: string;
            method: string;
            body: unknown;
            headers: RawHeaders;
        },
        Omit<TransferrableResponse, 'body'> & {
            body: unknown;
        }
    ];
    connect: [
        {
            instance: number;
            url: string;
            protocols: string[];
            requestHeaders: RawHeaders;
            port: MessagePort;
        },
        TransportToHost['connect'][1]
    ];
    raw: [
        {
            instance: number;
            kind: RawKind;
            url: string;
            port: MessagePort;
        },
        {
            send: boolean;
            closeReason: boolean;
        }
    ];
};
/** implemented by the transport worker, called by a shard */
export type ShardToHost = {
    /** a port that is one more Wisp connection of the transport `instance` (wispSplit.ts lanePipe), paced when `credit` (riderPace.ts) */
    lane: [{
        instance: number;
        v2: boolean;
    }, Ride];
    /** whether the shard's thread is saturated now (Saturation) */
    load: [boolean];
};
/** a shard's WebSocket, on its port: what WebSocketMessage carries, and an error after it opened */
export type ShardSocketMessage = {
    type: 'data';
    data: WebSocketDataType;
} | {
    type: 'close';
    code: number;
    reason: string;
} | {
    type: 'error';
    error: string;
};
/** what epoxy's connect_* answer */
export interface RawStream {
    read: ReadableStream<Uint8Array>;
    write: WritableStream<Uint8Array>;
    send?: (datagram: Uint8Array) => Promise<void>;
    closeReason?: () => number | undefined;
}
/** a thread whose timers fire this late on average is saturated (ms) */
export declare const SATURATED_LAG_MS = 6;
/**
 * Whether this thread is saturated: while Wisp packets come to its epoxy,
 * a timer every PROBE_MS measures how late a task posted now runs. A
 * thread that keeps up runs it within a millisecond or two; one that does
 * not has packets queued ahead of it, and the lag is how long they wait.
 * `changed` hears each change; nothing is sampled while no packets come.
 */
export declare class Saturation {
    #private;
    constructor(changed: (saturated: boolean) => void);
    get saturated(): boolean;
    /** the average lag lately (ms) */
    get lag(): number;
    /** Wisp packets came (cheap: called for each batch) */
    busy(): void;
}
/** the text of an error as RevivingTransport and the hosts read it */
export declare const errorText: (error: unknown) => string;
/** a shard's raw stream, served on `port` until either side ends it */
export declare function serveRaw(port: MessagePort, raw: RawStream): void;
/** the transport worker's end of a shard's raw stream, as epoxy's own */
export declare function rawOverPort(port: MessagePort, facts: {
    send: boolean;
    closeReason: boolean;
}, 
/** runs once, when the stream has ended */
settled?: () => void): RawStream;
/** a request's response as it crosses (its body, a stream, on a port: bodyPort.ts) */
export type ShardResponse = Omit<TransferrableResponse, 'body'> & {
    body: PortBody | unknown;
};
