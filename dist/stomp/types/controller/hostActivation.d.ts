/**
 * The host page's own input (its address bar, its buttons, its keys). In
 * same-origin mode every proxied document is of the host's origin, so
 * Chrome's activation reaches all of them, where natively none has it (the
 * host is the browser's own window): each proxied document in the host's
 * frames is told it has one only through the proxy
 * (src/inject/dom/activation.ts). A frame of another origin (isolation
 * mode) is never reached, by Chrome or here.
 */
export declare function watchHostInput(name: string): void;
