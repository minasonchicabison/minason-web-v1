export declare function validCodecURI(uri: string): boolean;
export declare function encodeCodecURI(input: string): string;
export declare function decodeCodecURI(uri: string): string;
export default class GenericCodec {
    key: string;
    constructor(key: string);
    static generateKey(): string;
    encode(input: string): string;
    /**
     * `input` encoded to the same text every time: a link route's
     * (src/visited.ts), which the browser's history is asked for by its
     * exact URL. Every codec decodes it with `decode`.
     */
    encodeStable(input: string): string;
    decode(input: string): string;
}
/**
 * The xor codec (docs/codec.md, src/xorWire.ts): every byte of the URL
 * XORed with a stream drawn from the key, in the URL-safe base64 alphabet.
 * The key is 16 hex digits, the stream's two halves. Sealed and opened in
 * the codec module where the realm has one (src/wasm/codec.ts), in
 * JavaScript otherwise: the same text either way.
 */
export declare class XORCodec extends GenericCodec {
    #private;
    constructor(key: string);
    static generateKey(): string;
    /** whether `key` is one generateKey makes (a key of the codec before this one is not) */
    static validKey(key: unknown): key is string;
    encode(input: string): string;
    /** the text `input` seals; empty for what is no seal, so nothing reads a URL out of it */
    decode(input: string): string;
}
export declare class AESCodec extends GenericCodec {
    static generateKey(): string;
    encode(input: string): string;
    encodeStable(input: string): string;
    decode(input: string): string;
}
export declare class Base64Codec {
    key: string;
    constructor(key: string);
    static generateKey(): string;
    encode(input: string): string;
    encodeStable(input: string): string;
    decode(input: string): string;
}
