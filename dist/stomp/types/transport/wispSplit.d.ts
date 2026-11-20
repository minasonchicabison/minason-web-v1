import { type Ride } from './riderPace';
/** what epoxy's function transport gives back (EpoxyWispTransportResult) */
export interface WispPipe {
    read: ReadableStream<ArrayBuffer>;
    write: WritableStream<Uint8Array>;
    /** wispWebTransport.ts WispPipe.more */
    more?: () => Promise<Ride | null>;
}
/** what crosses a lane's port, each way (a rider's: a packet alone too, and the host's `{ end }`) */
export type LaneMessage = ArrayBuffer[] | ArrayBuffer | 'end' | {
    end: 'lost' | 'closed';
};
/**
 * The bytes the relay sent a shard's lanes lately: each counts in full when
 * it came and half as much every HALF_LIFE_MS after
 */
export declare class Meter {
    #private;
    add(bytes: number): void;
    get value(): number;
}
export declare class WispSplit {
    #private;
    constructor(pipe: WispPipe);
    /** whether the relay's connection has ended (a lane attached now ends at once) */
    get ended(): boolean;
    /** the lanes attached and not ended (for tests and the verbose log) */
    get lanes(): number;
    /** `port` is one more epoxy's connection; `meter` counts what the relay sends it */
    attach(port: MessagePort, meter?: Meter | null): void;
    /**
     * One more epoxy's connection, for an epoxy of this realm: its packets
     * are handed over as they come, each way
     */
    attachLocal(meter?: Meter | null, arrived?: () => void): WispPipe;
    /** the lane whose port is `port` is let go: its streams are closed */
    detach(port: MessagePort): void;
}
/**
 * The shard's end of a lane, as epoxy's function transport takes it: each
 * read one packet, each write one packet. The writes of one task go in one
 * message. `end` lets it go from this side.
 */
export declare function lanePipe(port: MessagePort, arrived?: () => void, credit?: boolean): WispPipe & {
    end(): void;
};
