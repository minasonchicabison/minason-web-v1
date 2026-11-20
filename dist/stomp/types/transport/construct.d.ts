import type { ProxyTransport } from '@mercuryworkshop/proxy-transports';
import { type Http3Options } from './http3/Http3Transport';
import { type ShardsOption } from './ShardedTransport';
import { type WispWebTransportOptions } from './wispWebTransport';
/** `http3` in a descriptor: a function (`udp`) cannot be cloned into a worker */
export type Http3DescriptorOptions = Omit<Http3Options, 'udp'>;
export interface ConstructibleTransport {
    /** module URL, already resolved */
    module: string;
    options?: unknown[];
    http3?: boolean | Http3DescriptorOptions;
    webTransport?: boolean | WispWebTransportOptions;
    /** TransportDescriptor.shards */
    shards?: ShardsOption;
}
/** the descriptor with `http3.module` resolved against `base` too */
export declare function resolveHttp3<T extends ConstructibleTransport>(descriptor: T, base: string): T;
/**
 * A transport module as the host's console names it: its file, or for an
 * index its package's directory, without `-transport`
 * (`/epoxy/index.mjs` and `@mercuryworkshop/epoxy-transport/dist/index.mjs`
 * are `epoxy`)
 */
export declare function transportName(module: string): string;
/**
 * `h3Worker`: the transport worker's script, which stomp-h3 runs in a
 * worker of its own from (http3/h3Thread.ts); without it stomp-h3 runs in
 * this realm. The same script runs the transport's shards
 * (ShardedTransport.ts): without it the transport runs alone.
 */
export declare function constructTransport({ module, options, http3, webTransport, shards }: ConstructibleTransport, h3Worker?: string): Promise<ProxyTransport>;
