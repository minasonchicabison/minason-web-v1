/** word `j` of the stream of the key `a`, `b` (an int32) */
export declare function streamWord(a: number, b: number, j: number): number;
/**
 * The bytes of `text` written to `bytes` from its start, when every
 * character is ASCII and they fit: how many, or -1
 */
export declare function asciiInto(text: string, bytes: Uint8Array): number;
/** the bytes of `text` (see the top of the file) */
export declare function bytesOf(text: string): Uint8Array;
/** ASCII bytes as a string */
export declare function asciiText(bytes: Uint8Array): string;
/**
 * The text `bytes` are the bytes of, or null when they are no text's: a
 * byte past ASCII without the lead, half a code unit, or the lead before
 * what is all ASCII (which is written without it: a text has one form)
 */
export declare function textOf(bytes: Uint8Array): string | null;
/** `bytes` in the URL-safe base64 alphabet, without padding */
export declare function base64(bytes: Uint8Array): string;
/**
 * The bytes `text` is the base64 of, or null when it is none as `base64`
 * writes it: a character outside the alphabet, a length it never has, bits
 * set after the last byte
 */
export declare function unbase64(text: string): Uint8Array | null;
/**
 * `bytes` sealed under the key `a`, `b`: the JavaScript side of the wire.
 * The bytes are the caller's to give up (they are XORed where they stand).
 */
export declare function seal(bytes: Uint8Array, a: number, b: number): string;
/**
 * The bytes the seal `text` holds under the key `a`, `b`, or null when it
 * is no seal (see `unbase64`)
 */
export declare function open(text: string, a: number, b: number): Uint8Array | null;
/** the key's two halves, `a` then `b`, of its 16 hex digits (0 for what is none) */
export declare function keyHalves(key: string): [number, number];
/** whether `key` is a key of this wire: 16 lower-case hex digits */
export declare function validKey(key: unknown): key is string;
/** a new key, from the platform's random source */
export declare function generateKey(): string;
