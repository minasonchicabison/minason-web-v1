/** whether `text` has a character past ASCII */
export declare const pastASCII: (text: string) => boolean;
/**
 * A byte string read as UTF-8, or null when its bytes are not UTF-8. escape
 * writes each byte as %XX, which decodeURIComponent reads as UTF-8 and
 * refuses when it is not (and a character past U+00FF, no byte at all, as
 * %uXXXX).
 */
export declare function utf8Text(bytes: string): string | null;
/** `text` as its UTF-8 bytes, a character each (a lone surrogate as U+FFFD's) */
export declare function utf8Bytes(text: string): string;
