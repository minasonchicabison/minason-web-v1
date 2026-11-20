import type { H3Module } from './Http3Transport';
/** the name the transport worker starts its HTTP/3 worker with */
export declare const H3_WORKER_NAME = "stomp-h3";
/**
 * How long after the last datagram heard one that goes out is taken for a
 * possible PING (stomp-h3's keep-alive goes 15 s after it) rather than the
 * ACK of what was heard (within max_ack_delay, 25 ms): only then is
 * stomp-h3's PING count read
 */
export declare const PING_GAP_MS = 1000;
/** In the HTTP/3 worker: serve stomp-h3 to the transport worker that started it */
export declare function serveH3(scope: DedicatedWorkerGlobalScope): void;
/**
 * stomp-h3 (at `moduleUrl`) loaded in an HTTP/3 worker started from
 * `workerUrl` (the transport worker's own script), as an H3Module whose
 * connections run there. Rejects when the worker cannot start or the module
 * cannot load in it.
 */
export declare function remoteH3Module(moduleUrl: string, workerUrl: string): Promise<H3Module>;
