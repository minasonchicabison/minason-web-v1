/** a rider of the relay for another realm (a shard's worker), and whether the host takes its `{ took }` */
export interface Ride {
    port: MessagePort;
    credit: boolean;
}
export interface RiderPace {
    /** the host's packets: handed to epoxy as the readers take them */
    take(packets: ArrayBuffer[]): void;
    /** the rider ended; `hand`: what waits goes to epoxy first (the host's end comes after its packets) */
    end(hand: boolean): void;
    /** a packet epoxy sends on the rider: a UDP stream's CONNECT makes its datagrams go past what waits */
    sent(packet: Uint8Array): void;
}
/** the packets of the rider on `port`, handed on to `enqueue` at the readers' pace */
export declare function paceRider(port: MessagePort, enqueue: (packet: ArrayBuffer) => void): RiderPace;
