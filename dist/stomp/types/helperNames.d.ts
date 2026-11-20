/**
 * The four global names the rewriter and the inject bundles rendezvous on:
 * the access API object every rewritten script calls (`$s$j.get(...)`), the
 * client on the window (`$P$s.apply()`), and the two marker keys on the
 * `location` and `eval` stand-ins, plus the global the worker writes into
 * the host's error page. A deployment can choose its own (see
 * ControllerInit.names); the rewriter reads them from the config every
 * request carries, and the inject bundle from the config the shell hands
 * `createClient`, so one document and its scripts always agree. The
 * bootstrap name `createClient` is not one of them: the bundle deletes it
 * before any page script runs.
 */
export interface HelperNames {
    /** the access API on every global (default `$s$j`) */
    access: string;
    /** the stand-in marker on `location` and `eval` (default `$s$L`) */
    globalProxy: string;
    /** the stand-in's name marker, and the key of a STomp message envelope (default `$s$N`) */
    globalName: string;
    /**
     * the client on the window and on workers: a controller mints its own
     * (mintClientName) unless the host names one; `$P$s` only where nothing did
     */
    client: string;
    /**
     * the global the worker writes into the host's error page (`errorPage`)
     * with the failure (`{ url, status, error, kind }`); default `stompError`.
     * A host whose build renames identifiers in its vendored pages sets it to
     * what its page reads
     */
    error: string;
}
export declare const DEFAULT_NAMES: Readonly<HelperNames>;
/**
 * The access API as a rewritten script reaches it: a property of a number
 * literal (`0..$s$j`), read off Number.prototype, where the inject defines
 * it for good (src/inject/modules/Access.ts). A global of that name is
 * whatever the page's scopes make of the name: a parameter, a `let`, a
 * `with` object or an eval'd `var` called `$s$j` was handed every value a
 * rewritten read meant to route, the real `top` among them. No binding
 * stands between a literal and its prototype. The rewriter writes the same
 * (rust/rwjs/src/config.rs `api`).
 */
export declare const accessExpression: (access: string) => string;
/**
 * The access API as a worklet module's rewrite reaches it: a call of the
 * module's own function of that name, which its lead declares
 * (src/workletLead.ts). A worklet scope holds no inject to hide a property
 * of Number.prototype from reflection; a module's binding is in no object a
 * page can list, a module has no `with` and no sloppy eval to stand in for
 * it, and a function declaration is there before the module runs (a module
 * of an import cycle can be called first).
 */
export declare const workletAccessExpression: (access: string) => string;
/**
 * The prefix of the marker attributes the inject keeps a page's own value
 * of a routed attribute in (`s_o:href` next to the routed `href`), made from
 * the access name, so two controllers with two access names (one proxied
 * through the other) keep their markers apart. An HTML attribute name is
 * lower case, so each character of the name is its code in two base-36
 * digits (every identifier character is past 35): no two names make one
 * prefix, and none is the start of another. The default name keeps the
 * prefix it always had.
 */
export declare function attributeMarker(access: string): string;
/** the names a config asks for, the defaults for the rest */
export declare function helperNames(config?: object | null): HelperNames;
/**
 * A fresh name for the client global, which a controller mints when its host
 * names none. The client holds the real windows the inject works with (its
 * `parent`, its `top`), and every proxied site shares the proxy's real
 * origin, so a page that can name it reaches the window of any other site
 * that frames it. No page is told this name: the shell and the worker
 * preambles carry it, and the client never shows among a window's keys
 * (Reflection). 16 characters of 63, about 95 bits.
 */
export declare function mintClientName(taken?: Iterable<string>): string;
/**
 * Throws a TypeError when a names option cannot be used: an unknown key, a
 * value that is not an identifier, a reserved or special word, two names
 * alike, or a name a plain window already has (`taken`: the host passes
 * `Object.getOwnPropertyNames(globalThis)`, so a proxied page cannot tell a
 * helper from a global it expects).
 */
export declare function validateNames(names: Partial<HelperNames> | undefined, taken?: Iterable<string>): void;
