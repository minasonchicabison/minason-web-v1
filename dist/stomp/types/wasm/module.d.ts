/** where a module comes from, as a host may give it */
export type ModuleSource = WebAssembly.Module | BufferSource | Response | URL | string | Promise<WebAssembly.Module | BufferSource | Response>;
/**
 * Compile `bytes` synchronously, with the native WebAssembly captured at
 * load (never the page-wrapped one, src/inject/dom/modules/WebAssemblyPolicy.ts).
 * Chrome's synchronous-compile limit on a window's main thread is 8 MB, which
 * the stomp artifacts are far below (core.wasm is ~570 KB, ~1.5 ms to compile),
 * so a thread that holds the bytes but not yet the compiled module can still
 * answer a rewrite at once (src/wasm/thread.ts): the asynchronous compile of
 * the same bytes replaces it when it settles. A worker (the service worker,
 * the rewrite workers) has no such limit at all.
 */
export declare function compileModuleSync(bytes: BufferSource): WebAssembly.Module;
/**
 * The compiled module for `source`: as given when it is one, compiled from
 * bytes or a Response, fetched (and compiled while it streams) from a URL
 * resolved against `base` when it is a string. This compiles asynchronously
 * (off the main thread where it can), the warm path for every thread; a cold
 * rewrite that cannot wait compiles synchronously instead (compileModuleSync).
 */
export declare function compileModule(source: ModuleSource, base?: string): Promise<WebAssembly.Module>;
/** what a buffer module exports, or a member of the core under its view's names */
export interface MemberExports {
    memory: WebAssembly.Memory;
    /** `len` bytes to write into */
    a(len: number): number;
    /** the call; the module owns the bytes and keeps the output */
    r(ptr: number, len: number, flags: number): number;
    /** the output's pointer and length */
    p(): number;
    n(): number;
    /** the configuration, once per change; the module owns the bytes */
    c?(ptr: number, len: number): number;
    /** the scratch the host answers a routing call in */
    b?(): number;
    /**
     * A member that keeps its input buffer from call to call (the scanner):
     * the buffer, at least `len` bytes, what it held kept when it grows
     */
    i?(len: number): number;
    /** the call on the first `len` bytes of that buffer */
    x?(len: number, flags: number): number;
    /** the scratch, made at least `len` bytes */
    s?(len: number): number;
}
/** the exports of a buffer module of its own (rust/block/abi.json) */
export interface BufferExports extends MemberExports {
    /** bytes given back unused */
    f(ptr: number, len: number): void;
    c(ptr: number, len: number): number;
    b(): number;
}
/**
 * The core module's members, and the export each role of a view is read
 * from (rust/core-module/src/lib.rs, abi.json): `route` is the import that
 * routes for the member, when it routes anything
 */
export declare const MEMBERS: {
    readonly rewriter: {
        readonly a: "a";
        readonly c: "jc";
        readonly r: "jr";
        readonly p: "jp";
        readonly n: "jn";
        readonly b: "jb";
        readonly route: "j";
    };
    readonly scanner: {
        readonly a: "a";
        readonly r: "sr";
        readonly p: "sp";
        readonly n: "sn";
        readonly i: "si";
        readonly x: "sx";
        readonly s: "ss";
        readonly route: "s";
    };
    readonly suffix: {
        readonly a: "da";
        readonly r: "dr";
        readonly p: "dp";
        readonly n: "dn";
    };
};
export type MemberName = keyof typeof MEMBERS;
/** a member's routing import (`e.j`, `e.s`): the host's routing of the text it asks about, or null when it does not route */
export type RouteImport = (kind: number, text: string) => string | null;
/**
 * One instance of the core module, and its members' views of it. The
 * members share the memory and nothing else: one can be called from inside
 * another's routing call. A trap in any of them (a Rust panic, `panic =
 * "abort"`) is thrown through as a RuntimeError, after which the whole
 * instance is dead: the caller drops it and makes another from the same
 * compiled module, whose members start over.
 */
export declare class CoreInstance {
    #private;
    readonly members: {
        readonly [name in MemberName]: BufferInstance;
    };
    /** `route` answers every member's routing import, by member */
    constructor(module: WebAssembly.Module, route?: (member: MemberName, kind: number, text: string) => string | null);
    /** how much linear memory the instance holds now */
    get memoryBytes(): number;
}
/**
 * The member `name` of a new core instance, `route` answering its routing
 * import: for a caller that keeps an instance of its own (a test, a tool
 * of rust/host) rather than the thread's (src/wasm/thread.ts)
 */
export declare function memberInstance(module: WebAssembly.Module, name: MemberName, route?: RouteImport): BufferInstance;
/**
 * A member of the core module as its callers see it: strings in, strings
 * out, every call synchronous. A call that traps throws (CoreInstance).
 */
export declare class BufferInstance {
    #private;
    constructor(exports: MemberExports, route: RouteImport);
    /** the member's routing import: the host's routing of `len` bytes at `ptr`, written to its scratch */
    answerRoute(kind: number, ptr: number, len: number): number;
    /** the configuration (JSON or any text), handed over when it changed */
    configure(config: string): void;
    /** the module's answer for `input`, or null with the status when it declined */
    call(input: string, flags?: number): {
        output: string;
    } | {
        status: number;
    };
    /**
     * `call` for a text that is UTF-8 bytes already (a script as the network
     * sent it): copied in as they are, and the answer's bytes given where
     * they stand in the module's memory, neither decoded nor encoded. The
     * view holds until the instance is called again or grows: the caller
     * copies them out (into a Blob, say) before that. The module answers
     * status 3 for bytes that are no UTF-8.
     */
    callBytes(input: Uint8Array, flags: number): {
        bytes: Uint8Array<ArrayBuffer>;
    } | {
        status: number;
    };
    /**
     * `call` for a module with a kept input buffer (`i`, `x`): the text is
     * encoded where the module reads it (no array and no allocation per
     * call), and it comes back unit for unit: a byte order mark that leads
     * the answer or the text of a routing call is kept, and a surrogate
     * with no other half crosses as the three bytes of its code point, both
     * ways. Status -1 when the module has no such buffer.
     */
    exchange(input: string, flags: number): {
        output: string;
    } | {
        status: number;
    };
    /** how much linear memory the instance holds now (the core's, which its members share) */
    get memoryBytes(): number;
}
