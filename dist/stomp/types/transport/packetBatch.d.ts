/** what one message carries at most before it goes */
export declare const MESSAGE_MAX: number;
export interface BatchOptions {
    /**
     * Post once the thread has nothing else to run (a background task)
     * rather than at the next task: packets that each come in a task of
     * their own (a carrier's reads) gather while more keep coming, and one
     * that comes alone goes as soon as the thread is idle
     */
    idle?: boolean;
    /** the most bytes a message carries (MESSAGE_MAX) */
    max?: number;
}
/** packets gathered until the task ends (or MESSAGE_MAX), then posted as one array */
export declare class PacketBatch {
    #private;
    /** `post`: sends a batch, its buffers transferred */
    constructor(post: (batch: ArrayBuffer[]) => void, { idle, max }?: BatchOptions);
    /** a packet (its buffer given away) */
    push(packet: ArrayBuffer): void;
    /** what was gathered, posted now */
    flush(): void;
    /** what was gathered, dropped (the other end is gone) */
    clear(): void;
}
/** a packet in a buffer of its own: `packet` itself when it owns its buffer, or a copy (a view of wasm memory) */
export declare function ownBuffer(packet: Uint8Array): ArrayBuffer;
/**
 * Packets handed to an epoxy's Wisp reader, a stream's CLOSE never in the
 * task its DATA came in. Epoxy's multiplexor drops what a stream holds
 * unread once its CLOSE is in (wisp-mux's read ends at the close), so the
 * end of a response a server sent just before it closed, or a body hyper
 * had not asked for yet, was lost: a batch (a lane's message, a carrier
 * host's) handed a download's last DATA and its CLOSE over at once, and an
 * HTTP/1 response with `Connection: close` ended short (IncompleteBody).
 * Such a CLOSE, and whatever came after it, waits a task, as a packet of
 * its own message did; `flush` hands over what waits (the connection ends).
 */
export declare function wispFeed(enqueue: (packet: ArrayBuffer) => void): {
    push(packet: ArrayBuffer): void;
    flush(): void;
};
