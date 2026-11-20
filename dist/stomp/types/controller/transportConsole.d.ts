import type { TransportNote } from '../transport/transportLog';
/** the host origin's localStorage key that turns the verbose mode on ('1') */
export declare const DEBUG_TRANSPORT_KEY = "stomp:debug-transport";
/** whether the host origin's storage asks for the verbose mode */
export declare function debugTransportStored(): boolean;
/** a note on the console */
export declare function printNote(note: TransportNote): void;
