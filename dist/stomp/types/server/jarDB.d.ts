/** what the jar asks of its database; idb's IDBPDatabase answers the same */
export interface JarDB {
    getAllFromIndex(store: string, index: string, key: string): Promise<unknown[]>;
    getAll(store: string): Promise<unknown[]>;
    getAllKeys(store: string): Promise<unknown[]>;
    get(store: string, key: string): Promise<unknown>;
    put(store: string, value: unknown, key?: string): Promise<unknown>;
    delete(store: string, key: string): Promise<void>;
    clear(store: string): Promise<void>;
}
/** the jar's database and its one object store, in the host's origin */
export declare const JAR_DATABASE = "stompCookies";
export declare const JAR_STORE = "cookies";
/**
 * The sites' permission states (src/server/permissions.ts), asked the same
 * way: a frame's permission is its top's, and the frame may be shown from
 * another slot than its top, so every slot's worker keeps them in the host
 * origin's one database too (keyed out of line: `put` takes the key)
 */
export declare const PERMISSIONS_DATABASE = "stompPermissions";
export declare const PERMISSIONS_STORE = "states";
/**
 * The devices each site chose (src/server/permissions.ts deviceGrants),
 * asked the same way: the browser keeps a device grant per top-level
 * origin, which is the host's for every slot, so one slot's forget() is
 * every slot's, and only the one store knows whether another site still
 * holds the device (keyed out of line too)
 */
export declare const DEVICE_GRANTS_DATABASE = "stompDeviceGrants";
export declare const DEVICE_GRANTS_STORE = "grants";
/**
 * The passkeys STomp holds for proxied sites (src/passkeys/authenticator.ts),
 * asked the same way: a credential is the user's, not the slot's, and
 * natively outlives anything short of the user deleting it, so every slot's
 * worker keeps them in the host origin's one database, where the host's
 * worker and its `passkeys` API find every one (keyed in line by `id`, with
 * an index on `rpId`)
 */
export declare const PASSKEYS_DATABASE = "stompPasskeys";
export declare const PASSKEYS_STORE = "credentials";
export type JarOp = keyof JarDB;
/** slot worker -> host: one request of the jar */
export interface JarCall {
    jar: number;
    op: JarOp;
    args: unknown[];
}
/** host -> slot worker: its answer */
export interface JarReply {
    jar: number;
    result?: unknown;
    error?: string;
}
/**
 * either way: the jar changed for `domain` ('' for every host). A slot's
 * worker says so after its own write; the host tells every other slot's
 * worker, whose documents drop what they kept of document.cookie.
 */
export interface JarChanged {
    jarChanged: string;
}
/** a handshake's port to the host's jar, and whether the page that gave it is still open */
export interface JarPort {
    port: MessagePort;
    /**
     * whether the document that shook hands is still open (a slot's agent,
     * in its host's tab): Chrome tells a port nothing when that tab closes
     */
    alive(): Promise<boolean>;
}
/** how long a request of the jar may go unanswered before the pages behind the ports are looked at */
export declare const JAR_CHECK_MS = 500;
/**
 * The host's jar as a slot's worker asks it. A slot's worker serves every
 * page of the host open at once (two tabs of the demo: each has its own
 * agent in the slot, each agent shook hands with its own port), and any
 * one of them reaches the one database. The newest handshake's port is
 * asked: the host's page may reload while this worker lives on, and the
 * port it gave before is then dead with whatever was asked on it, so every
 * request without an answer is asked again on a new port (each is safe to
 * repeat: a read, or a write of a whole record). A newer page may also
 * close before an older one (the second tab of the host, closed): a
 * request that goes unanswered JAR_CHECK_MS is asked again on the newest
 * port whose page is still open, as no new handshake will come.
 */
export declare class RemoteJar implements JarDB {
    #private;
    /** the jar changed in another slot's worker */
    onChanged?: (domain: string) => void;
    bind(given: JarPort): void;
    /** tell the other slots' workers the jar changed for `domain` */
    changed(domain: string): void;
    getAllFromIndex(store: string, index: string, key: string): Promise<unknown[]>;
    getAll(store: string): Promise<unknown[]>;
    getAllKeys(store: string): Promise<unknown[]>;
    get(store: string, key: string): Promise<unknown>;
    put(store: string, value: unknown, key?: string): Promise<unknown>;
    delete(store: string, key: string): Promise<void>;
    clear(store: string): Promise<void>;
}
