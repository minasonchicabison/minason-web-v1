import type { ProxyTransport } from '@mercuryworkshop/proxy-transports';
import { TransportToHost } from './messages';
/**
 * Whether a page of `origin` may open a session to `url`: false refuses it
 * before anything is opened (the built-in blocker's lists, asked as for a
 * WebSocket's handshake)
 */
export type AdmitSession = (url: URL, origin: string) => Promise<boolean>;
/** construct.ts: `transport`'s sessions use stomp-h3 at `url` */
export declare function useWebTransportModule(transport: object, url: string, pem?: string): void;
/**
 * Open a session for the page and serve it on `port`; answers the rpc once
 * it is up or has failed.
 */
export declare function serveWebTransport(transport: ProxyTransport, { url, origin, protocols, headers, hashes, port, }: TransportToHost['webtransport'][0], admit?: AdmitSession): Promise<[TransportToHost['webtransport'][1], []]>;
