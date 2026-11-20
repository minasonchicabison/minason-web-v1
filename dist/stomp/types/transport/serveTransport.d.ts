import type { ProxyTransport, RawHeaders } from '@mercuryworkshop/proxy-transports';
import { type AdmitSession } from './webTransportHost';
/**
 * The headers a WebSocket handshake goes out with, given the page's. A hook
 * that rejects with an Error whose message is HANDSHAKE_REFUSED refuses the
 * socket: it fails like a connection the browser itself would not make.
 */
export type DecorateHandshake = (url: URL, headers: RawHeaders) => Promise<RawHeaders>;
/**
 * A Cookie field as a transport takes it. The service worker writes the
 * jar's cookies as their bytes, a character each (Headers holds nothing
 * else: src/server/Cookies.ts header()), where every other field a page
 * sends is the text the browser handed the worker, which is the bytes read
 * as UTF-8; a transport sends a value's UTF-8 (epoxy, libcurl), so bytes
 * that are UTF-8 go as the text they spell, or a cookie a server set in
 * UTF-8 went back with every byte past 0x7F as two. Bytes that are not
 * UTF-8 stay as they are: a transport of text has no way to send them.
 */
export declare const cookieText: (value: string) => string;
/** `headers` as `transport` can send them */
export declare function fitHeaders(transport: ProxyTransport, headers: RawHeaders): RawHeaders;
/**
 * Load the transport and open its wisp connection now, before anything asks
 * for them. A transport did both on its first request: the first navigation
 * waited for epoxy's wasm module to load and compile and for the WebSocket
 * to the wisp server and its handshake (40 to 70 ms on loopback, round
 * trips more to a wisp server over the internet). A request that comes
 * meanwhile waits for it as it would for init(), so no request opens a
 * connection of its own beside it; a connection that cannot be opened now
 * is left to the first request, as before. A transport without epoxy's
 * client is only loaded.
 */
export declare function warmTransport(transport: ProxyTransport, 
/** epoxy's `ech_dns`, when it has one: its connection is opened too (warmResolver) */
resolver?: string): void;
/**
 * Serve a ProxyTransport to a `RemoteTransport` on the other end of `port`.
 * `getTransport` is a getter so the host can hot-swap transports. `decorate`
 * may add headers to a WebSocket handshake (the controller adds the cookie
 * jar's Cookie, HttpOnly included, which the page must never hold); a
 * Cookie the page sent itself is dropped first, and a hook that fails or
 * stalls leaves the handshake as it was. A hook that refuses the socket
 * (HANDSHAKE_REFUSED: the built-in blocker's lists block it) fails the
 * connection here, before the transport hears of it.
 * Returns a function that closes the port.
 */
export default function serveTransport(port: MessagePort, getTransport: () => ProxyTransport, decorate?: DecorateHandshake, 
/** asked before a page's WebTransport session opens (the built-in blocker) */
admit?: AdmitSession): () => void;
