/**
 * The codec as a realm's instance answers it. Strings in and out, so one
 * realm's may answer for another's (a frame asks its top's); `build` says
 * which bundle made it.
 */
export interface CodecBackend {
    readonly build: string;
    /** `text` sealed under the key `a`, `b` */
    seal(text: string, a: number, b: number): string;
    /** the text the seal `text` holds, or null when it is no seal */
    open(text: string, a: number, b: number): string | null;
}
/**
 * Where a bundle built without the module's bytes takes them: the document
 * bundle's deferred part, where its realm holds the parts already
 * (src/inject/dom/document.ts); undefined for none
 */
export declare const codecParts: {
    bytes?: () => string | undefined;
};
/**
 * This realm compiles no module: a document whose own policy would refuse
 * it and report the attempt to the page (a list's `$csp=` rule, carried by
 * the worker: `Config.codecModule`). The JavaScript answers there.
 */
export declare function forbidCodecModule(): void;
/**
 * Where this bundle's codec asks before it compiles a module of its own:
 * `provider` answers another realm's backend, or null for none. Taken by
 * the bundle's first client (its realm's document); false when one was
 * taken already.
 */
export declare function shareCodec(provider: () => CodecBackend | null): boolean;
/** this realm's own instance, compiled the first time it is asked for; null when it has none */
export declare function ownCodec(): CodecBackend | null;
/** `text` sealed under the key `a`, `b`: in the module where this realm has one */
export declare function sealText(text: string, a: number, b: number): string;
/** the text the seal `text` holds under the key `a`, `b`, or null when it is no seal */
export declare function openText(text: string, a: number, b: number): string | null;
/** whether this realm's next seal runs in the module (tests, and the controller's `codecModule`) */
export declare function codecInModule(): boolean;
