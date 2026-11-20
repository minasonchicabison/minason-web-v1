import type { ProxyTransport, RawHeaders, TransferrableResponse } from '@mercuryworkshop/proxy-transports';
/** what may wait for the reader before the transport lets the body go */
export declare const BUFFER_MAX: number;
/** what is left waiting when the rest is asked for (covers the request's round trip) */
export declare const RESUME_AT: number;
/** what must still be to come for a full queue to let the body go (less is simply received) */
export declare const RESUME_MIN: number;
/**
 * `response`'s body, read so that a reader that falls behind lets it go and
 * resumes it by range as it catches up (see above); the body as it is when
 * it cannot be resumed or is too short to matter
 */
export declare function resumableBody(transport: ProxyTransport, remote: URL, method: string, headers: RawHeaders, response: TransferrableResponse): ReadableStream<Uint8Array>;
