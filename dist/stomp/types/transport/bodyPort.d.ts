/** bytes sent that the receiving reader has not taken yet, at most */
export declare const BODY_WINDOW: number;
/**
 * What the readers of the bodies this realm sent took, and when they last
 * took any (their credit): a carrier host's rider hands epoxy the wire's
 * packets at their pace (carrierClient.ts), and `waiters` hear each take
 */
export declare const bodiesTaken: {
    bytes: number;
    at: number;
    waiters: Set<() => void>;
};
/** a body on its way: the receiving end's port */
export interface PortBody {
    $stompBodyPort: MessagePort;
}
export declare function isPortBody(value: unknown): value is PortBody;
/**
 * the sending end: reads `body` and pushes it to the port it returns.
 * `owned`: no one else holds the stream's chunks (the transport's, a
 * response the proxy fetched), so their buffers are transferred; a page's
 * own stream (a response its service worker made, or one it may have
 * cloned, whose twin shares the chunks) is copied, as the browser copies
 * what it reads from it, so the page's buffers are never detached
 */
export declare function sendBody(body: ReadableStream<Uint8Array>, owned: boolean): PortBody;
/**
 * the receiving end: the body as a stream. `settled` runs once, when the
 * body ended, failed or was cancelled.
 */
export declare function receiveBody({ $stompBodyPort: port }: PortBody, settled?: () => void): ReadableStream<Uint8Array>;
