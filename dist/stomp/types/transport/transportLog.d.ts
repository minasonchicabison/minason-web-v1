import type { ProxyTransport } from '@mercuryworkshop/proxy-transports';
/** the verbose mode: whether `[net]` lines are made in this realm (the controller turns it on) */
export declare const transportLog: {
    on: boolean;
};
/** a line for the host's console */
export interface TransportNote {
    level: 'info' | 'warn';
    text: string;
}
/** `listener` hears every note of this realm's transports; returns the unwatch */
export declare function watchTransportNotes(listener: (note: TransportNote) => void): () => undefined;
/** a `[wisp]` note: what the wisp connection rides */
export declare const wispNote: (level: TransportNote["level"], text: string) => void;
/** a note made in another realm (the carrier host's), told here as it was made */
export declare const relayNote: (note: TransportNote) => void;
/** a `[net]` line of the verbose mode (call it only when `transportLog.on`) */
export declare const logTransport: (text: string) => void;
/**
 * What a Wisp stream of `transport` rides to the relay: a TCP stream's
 * packets go on the session's one QUIC stream, a UDP stream's DATA as
 * datagrams when it fits (wispWebTransport.ts pipeOf)
 */
export declare function rideOf(transport: ProxyTransport, udp: boolean): string;
/**
 * The line of an HTTP connection to `origin`: its protocol, what its Wisp
 * stream rides, and the pool it is in (the network partition, and a
 * request without credentials, which Chrome keeps on connections of their
 * own)
 */
export declare function connectionLine(transport: ProxyTransport, version: string | undefined, origin: string, partition: string, credentials: string, nth?: number): string;
