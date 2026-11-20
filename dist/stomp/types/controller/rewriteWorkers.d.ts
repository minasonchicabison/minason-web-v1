/** rewrite workers when the host does not say: half the cores, one to four */
export declare function defaultRewriteWorkers(): number;
/** how long the service worker waits for a rewrite worker's answer before rewriting itself, when the host does not say */
export declare const DEFAULT_REWRITE_TIMEOUT_MS = 10000;
/**
 * The controller's rewrite workers (dist/rewriteWorker.js,
 * src/rewriteWorker.ts): dedicated Workers that rewrite scripts for the
 * service worker, which cannot start a Worker itself. Each handshake hands
 * the service worker a fresh port to every one still running (a port
 * travels once; a restarted service worker shakes hands again). A worker
 * that fails to start or errors is let go; the service worker rewrites in
 * its own thread whenever no worker answers.
 */
export default class RewriteWorkers {
    #private;
    constructor(url: URL, size: number);
    /**
     * The compiled wasm modules, to every worker now (`rewriter: 'wasm'`). A
     * dedicated worker shares this page's agent cluster, so the compiled
     * module itself crosses and no worker compiles anything.
     */
    adopt(modules: Record<string, WebAssembly.Module>): void;
    /** the modules each running worker holds, as it last said */
    held(): string[][];
    /** how many workers are running */
    get size(): number;
    /**
     * Hand each running worker one of `ports`, in order (the site pool: a
     * slot's agent made the channels, its worker holds the other ends)
     */
    servePorts(ports: MessagePort[]): void;
    /** a port to each running worker, for the service worker's end of a handshake */
    ports(): MessagePort[];
}
