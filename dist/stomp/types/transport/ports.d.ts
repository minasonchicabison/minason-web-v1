/** `replay` is STomp's own dispatch of `original` again */
export declare function replayOf(original: Event, replay: Event): void;
/** a new channel's two ends: [the end kept, the end handed over] */
export declare function privateChannel(): [MessagePort, MessagePort];
/**
 * A trusted message event's data and ports, read with the browser's own
 * getters; null for an event the browser did not deliver (a page's own
 * `dispatchEvent`; checksTrust).
 */
export declare function messageOf(event: Event): {
    data: unknown;
    ports: readonly MessagePort[];
} | null;
/** `addEventListener` as the browser made it */
export declare function listenOn(target: EventTarget, type: string, listener: (event: Event) => void): void;
/**
 * Listen on `port` for `type` and start it: `listener` is given each
 * trusted event's data and ports (none for `close`)
 */
export declare function onPort(port: MessagePort, type: 'message' | 'messageerror' | 'close', listener: (data: unknown, ports: readonly MessagePort[]) => void): void;
export declare function startPort(port: MessagePort): void;
export declare function closePort(port: MessagePort): void;
