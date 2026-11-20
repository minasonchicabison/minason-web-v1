import type { ProxyTransport } from '@mercuryworkshop/proxy-transports';
export declare function serveShard(scope: DedicatedWorkerGlobalScope): void;
/**
 * The shard's connection to epoxy's DNS-over-HTTPS server for ECH configs,
 * opened with its wisp connection, as serveTransport's warmResolver opens
 * the one of a transport that runs alone: each shard asks it of its own
 * client
 */
export declare function warmResolver(transport: ProxyTransport, resolver: string): Promise<void>;
