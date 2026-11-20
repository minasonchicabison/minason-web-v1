import type { ProxyTransport, RawHeaders, TransferrableResponse } from '@mercuryworkshop/proxy-transports';
/** whether `error` says the transport's wisp connection is gone */
export declare const wispGone: (error: unknown) => boolean;
export default class RevivingTransport implements ProxyTransport {
    #private;
    /** `make` builds the transport, and builds it again when its connection is lost */
    constructor(make: () => ProxyTransport);
    /** the wisp connection is gone (the page is back from the back/forward cache) */
    lost(): void;
    /** the transport in use */
    get base(): ProxyTransport;
    get ready(): boolean;
    set ready(value: boolean);
    /** the base transport's client: Http3Transport opens UDP streams on it */
    get client(): unknown;
    /** what the base sends of the request fields (serveTransport's fitHeaders) */
    get fieldSupport(): unknown;
    init(): Promise<void>;
    meta(): Promise<void>;
    connect(...args: Parameters<ProxyTransport['connect']>): ReturnType<ProxyTransport['connect']>;
    request(remote: URL, method: string, body: BodyInit | null, headers: RawHeaders, signal: AbortSignal | undefined): Promise<TransferrableResponse>;
    /**
     * Build a new transport, unless one was built since `generation` (the
     * transport a request failed on). Resolves false when the new one could
     * not start; the next failure tries again.
     */
    revive(generation: number): Promise<boolean>;
}
/** `transport` or the RevivingTransport it wraps (Http3Transport) lost its connection */
export declare function connectionLost(transport: ProxyTransport | undefined): void;
