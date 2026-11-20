import { TransportModule } from './messages';
import type { DecorateHandshake } from './serveTransport';
import type { TransportNote } from './transportLog';
import type { AdmitSession } from './webTransportHost';
import type { CarrierInfo } from './wispWebTransport';
/**
 * The controller's handle on its transport worker (dist/transportWorker.js,
 * src/transport/worker.ts): a dedicated Worker that imports and constructs
 * the transport and serves it on every port handed over. `decorate` answers
 * the worker's handshake-header requests (the cookie jar stays with the
 * controller); `tick` is called every KEEPALIVE_MS, on the worker's clock,
 * whether or not the worker hosts a transport (a controller that hosts its
 * own starts one for the clock alone).
 */
export default class TransportWorker {
    #private;
    constructor(url: URL, decorate: DecorateHandshake, tick: () => void, admit?: AdmitSession, carrier?: (info: CarrierInfo) => void, note?: (note: TransportNote) => void);
    /** `failed()` once, when the worker script could not start */
    onFailure(failed: () => void): void;
    /** the verbose mode (transportLog.ts) on or off in the worker; before init() to have it from the start */
    debugTransport(on: boolean): void;
    /**
     * Import the module and construct the transport in the worker. Rejects
     * when the worker cannot start, the module cannot be imported there, the
     * constructor throws, or nothing answers within BOOT_TIMEOUT_MS.
     */
    init(descriptor: TransportModule): Promise<void>;
    /** replace the transport; in-flight requests finish on the old one */
    setTransport(descriptor: TransportModule): Promise<void>;
    /** hand the worker a port to serve the transport on (the other end holds a RemoteTransport) */
    servePort(port: MessagePort): void;
    /**
     * hand the worker a port to serve, whose WebSocket handshake headers are
     * asked over `decorate` instead (the site pool: a slot's controller
     * answers there)
     */
    serveDecorated(port: MessagePort, decorate: MessagePort): void;
    /** the site pool: hand the worker a slot's worker's cookie jar port (jarServer.ts) */
    serveJar(port: MessagePort): void;
    /** the site pool: the host changed the jar for `domain`; the slots' workers hear */
    jarChanged(domain: string): void;
    /** the page is back from the back/forward cache: the worker's wisp WebSocket is gone */
    connectionLost(): void;
    /** the carrier host's port (carrierClient.ts); before init() for the first transport to ride it */
    carrierHost(port: MessagePort): void;
    /** a new port the worker serves, for a RemoteTransport on this side */
    serve(): MessagePort;
    terminate(): void;
}
