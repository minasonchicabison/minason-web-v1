import type { Held, PoolFields, PoolLine, SocketPass } from './socketPool';
import { type TransportNote } from './transportLog';
import type { Carrier, OpenCarrier, WispWebTransportOptions } from './wispWebTransport';
/** the SharedWorker's name: the transport worker's script runs the host under it */
export declare const CARRIER_HOST_NAME = "stomp-carrier";
export declare const CARRIER_HOST_RPC = "stomp-carrier-host";
/** how often a client says it is alive on its control port */
export declare const ALIVE_MS = 2000;
/** a client (or the host) not heard from for this long is gone, and so are its riders */
export declare const GONE_MS: number;
/**
 * the same for a transport in the page (`host: 'page'`), whose timers
 * Chrome runs once a minute in a tab hidden for five; a page that unloads
 * lets its riders go itself
 */
export declare const PAGE_GONE_MS: number;
/** how long a start waits for a host that has not answered yet */
export declare const READY_MS = 1500;
/** the message each side sends on the control port */
export declare const ALIVE = "alive";
/** a page's transport's `alive` (PAGE_GONE_MS) */
export declare const PAGE_ALIVE = "alive page";
/** the client's message on a rider's port: its epoxy let go */
export declare const END = "end";
/** what a host posts a rider that takes credit past what it said it took, at most (bytes) */
export declare const RIDER_WINDOW: number;
/** a page's message on the control port as it unloads: what it held of the host's pool goes */
export declare const LEFT = "left";
/** what a transport asks the host for: a relay's wisp connection */
export interface CarrierAsk {
    wisp: string;
    /** what of epoxy's options the carrier is opened with */
    first: {
        wisp_v2?: boolean;
        wisp_ws_protocols?: string[];
    };
    /** null: the WebSocket only (the descriptor has no `webTransport`) */
    webTransport: WispWebTransportOptions | null;
    /** the rider says what it took (`{ took }`), and the host sends no more than RIDER_WINDOW past it */
    credit?: boolean;
    /** the client takes and sends a task's packets in one message */
    batches?: boolean;
}
/** what the host gives: a rider, or why there is none */
export interface CarrierGiven {
    /** the rider's port; null when no carrier could be opened */
    port: MessagePort | null;
    carrier?: Carrier;
    url?: string;
    /** on the WebSocket: why not WebTransport */
    why: string;
    /** how long the host took to open the carrier, when it opened it for this ask */
    ms: number;
    /** how long the carrier had been up when it was given (0: opened for this ask) */
    upMs: number;
    /** the riders on it, this one included */
    riders: number;
    /** the host takes the rider's `{ took }` (CarrierAsk.credit) */
    credit?: boolean;
    /** a session's lanes, lane 0 counted (wispWebTransport.ts pipeOf) */
    lanes?: number;
    /** the relay opened the session's Wisp stream */
    serverStream?: boolean;
    /** the host's name for the relay, to ride it again (`ride`) */
    relay?: number;
    /** the host takes and sends a task's packets in one message, and gives more riders */
    batches?: boolean;
}
/** a request the host's pool gave a connection: its name, and whether it counts */
export interface PoolTicket {
    ticket: number;
    counted: boolean;
}
/** a response came over `version`: what the host's pool learns of it */
export interface PoolLearn {
    ticket: number;
    version?: string;
    /** the realm's verbose log is on: the host answers the connection's line, if any */
    line: boolean;
    /** the realm holds its connection until its body ends (else the host lets it go now) */
    holds: boolean;
}
export type HostBound = {
    open: [CarrierAsk, CarrierGiven];
    /** one more rider of the relay `relay` (its port null when it is gone) */
    ride: [{
        relay: number;
        batches: boolean;
        credit?: boolean;
    }, CarrierGiven];
    /** the host's pool (socketPool.ts SocketPool.hold) */
    hold: [PoolFields, PoolTicket];
    learn: [PoolLearn, PoolLine | null];
    release: [number];
    /** a cancel (urgency null) or a raise of the request the worker named `id` */
    requeue: [{
        id: string;
        urgency: number | null;
    }];
    /** the host's WebSocket gate: the pass's name, or null for one too many */
    admit: [string, number | null];
    connected: [number];
    closed: [number];
};
export type ClientBound = {
    note: [TransportNote];
    /** the request the worker named so has to wait for a connection */
    waiting: [string];
};
/**
 * The carrier host's socket pool and WebSocket gate, as a realm asks them
 * (socketPool.ts HostedPool): one per profile in Chrome, so one for every
 * realm of the origin here
 */
export interface PoolHost {
    /** a connection for the request `fields` names; it throws when the host cannot answer */
    hold(fields: PoolFields, waits?: (id: string) => void): Promise<Held>;
    requeue(id: string, urgency: number | null): void;
    /** a WebSocket's pass to the host and port `key`; undefined: the host cannot answer */
    admit(key: string): Promise<SocketPass | null | undefined>;
}
/**
 * Ask the carrier host on `port` (the host page's SharedWorker port) for
 * this realm's wisp connections from now on
 */
export declare function useCarrierHost(port: MessagePort): void;
/**
 * The carrier host's pool, while this realm has a host that answers
 * (socketPool.ts); null without one, where the realm's own pool is asked
 */
export declare function poolHost(): PoolHost | null;
/**
 * The host page's carrier host, started (a SharedWorker of `script`), and
 * its port; null where there is none (no SharedWorker, or one that cannot
 * start). The page hands the port to where its transport runs.
 */
export declare function startCarrierHost(script: URL): MessagePort | null;
/**
 * A rider from the carrier host and what the host told of it; null when
 * there is no host, or it did not answer within `ms` (the transport then
 * opens a carrier of its own)
 */
export declare function askCarrierHost(ask: CarrierAsk, ms: number): Promise<{
    given: CarrierGiven;
    open: OpenCarrier | null;
} | null>;
