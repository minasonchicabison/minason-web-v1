import type { ProxyTransport, RawHeaders, TransferrableResponse, WebSocketDataType } from '@mercuryworkshop/proxy-transports';
import { HostToTransport, TransportToHost } from './messages';
import { RpcHelper } from './rpc';
/**
 * A ProxyTransport whose implementation lives on the other end of a MessagePort.
 * The other end is served by `serveTransport()`.
 */
export default class RemoteTransport implements ProxyTransport {
    /**
     * hears the worker's name for an image's request that waits for a
     * connection (REQUEST_QUEUE): the service worker tells its document
     */
    static waiting: ((id: string) => void) | null;
    ready: boolean;
    private readyPromise;
    private readyResolve;
    protected rpc: RpcHelper<HostToTransport, TransportToHost>;
    private port;
    constructor(port: MessagePort | Promise<MessagePort>);
    /** fail every pending and later call with `reason` and close the port (the host side replaced it) */
    close(reason: string): void;
    init(): Promise<void>;
    /** have the transport served on `port` as well, as on this one (TransportToHost serve) */
    serve(port: MessagePort): void;
    /** cancel or raise the request named `id` while it waits for a connection (socketPool.ts) */
    requeue(id: string, op: 'cancel' | 'raise'): void;
    request(remote: URL, method: string, body: BodyInit | null, headers: RawHeaders, _signal: AbortSignal | undefined): Promise<TransferrableResponse>;
    connect(url: URL, protocols: string[], requestHeaders: RawHeaders, onopen: (protocol: string, extensions: string) => void, onmessage: (data: WebSocketDataType) => void, onclose: (code: number, reason: string) => void, onerror: (error: string) => void): [
        (data: WebSocketDataType) => void,
        (code: number, reason: string) => void
    ];
}
