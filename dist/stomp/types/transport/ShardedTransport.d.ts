import type { ProxyTransport } from '@mercuryworkshop/proxy-transports';
/** TransportDescriptor.shards: the most shards, or that and how many run from the start */
export type ShardsOption = number | {
    max?: number;
    start?: number;
};
/** how many shards a descriptor's `shards` allows at most (1: the transport runs alone), and starts with */
export declare function shardCount(asked: unknown): {
    max: number;
    start: number;
};
export interface ShardPlan {
    /** the transport module, resolved */
    module: string;
    /** the most shards */
    count: number;
    /** how many run from the start (1: shard 0 alone) */
    start: number;
    /** the transport worker's script, which a shard's worker runs */
    script: string;
}
type TransportClass = new (...args: unknown[]) => ProxyTransport;
/**
 * The transport class `Transport` as CarrierTransport constructs it (its
 * options' `wisp` the carrier's function transport, or a wisp URL), run in
 * up to `plan.count` shards
 */
export declare function shardedTransport(Transport: TransportClass, plan: ShardPlan): TransportClass;
export {};
