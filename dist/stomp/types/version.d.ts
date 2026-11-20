export declare const BUILD: string;
/**
 * The identity of the rewriter this build ships: a digest of the bytes that
 * decide what a rewrite produces (the wasm core, the codec module, and the
 * light rewriter library), baked in by esbuild's define (build.js) under a
 * production build. It changes when the rewriter changes and stays the same
 * across a deploy that only touched something else (the demo, the infra),
 * unlike BUILD, which changes with any of the bundles' inputs. The rewrite
 * cache is made and kept under it (src/server/rewriteCache.ts): a revisit
 * after a rewriter-unchanged deploy comes back warm, and output from a build
 * whose rewriter differs is never served. Empty under a dev build, which has
 * no generation baked in (its rewriter can change without the commit
 * changing): the cache then falls back to BUILD and is dropped on every
 * activation, as it was before.
 */
export declare const REWRITE_GENERATION: string;
/**
 * What the light rewriter library asset is asked for by, after a `?`: the
 * hash of the file this build made (build.js), so the URL of another build's
 * is another URL and a host may let browsers keep the file for good. A
 * synchronous request for it must not wait for a revalidation.
 */
export declare const LIBRARY: string;
/**
 * What the rewriter's wasm core module is asked for by, after a `?`: the
 * hash of the module this build ships (build.js), as the library is (LIBRARY).
 * A top whose first task rewrites before the controller's compiled module
 * arrives fetches it with a synchronous request (src/inject/rewriter.ts
 * provideModule), which must not wait for a revalidation either.
 */
export declare const CORE: string;
/**
 * Where the controller leaves the core module it compiled, on its own
 * window, for the proxied documents of its agent cluster to read
 * synchronously (src/controller/index.ts publishCore): under a name of the
 * client's, which no page is told, and of this build's module, so a
 * document of another build never takes it.
 */
export declare const coreModuleKey: (client: string) => string;
/**
 * What the document bundles are asked for by, after a `?`: the hash of each
 * file as built (build.js builds them first, then the bundles that name
 * them: the service worker's shells, the controller's warm fetch), so a
 * proxied document's shell names one file of one build and the service
 * worker keeps it (serviceWorker.ts documentBundle), with no revalidation
 * before the document's first script. Empty in the document bundles
 * themselves, which name the file they were loaded from (routeURL.ts
 * ownDocumentBundle), and in a dev build, whose files change under one
 * name.
 */
export declare const DOCUMENT: string;
/** as DOCUMENT, for injectDocumentFull (the aes and base64 codecs') */
export declare const DOCUMENT_FULL: string;
/**
 * The name the light rewriter library asset assigns its factory to (build.js
 * writes the file as
 * `__stompRewriterLight=function(__stompRealm,__stompLibApi){...};`).
 * Loaded by a top's shell it is a global for the moment between that script
 * and the inject bundle, which takes it and deletes the name
 * (src/inject/rewriter.ts); evaluated by a copy it is the parameter of the
 * function that evaluates the text (src/rewriterLight.ts).
 */
export declare const LIGHT_FACTORY = "__stompRewriterLight";
/**
 * The name the document bundle's deferred parts assign their function to
 * (src/inject/dom/deferredParts.ts): a statement of the light rewriter
 * library's file, `__stompDeferred=function(__stompShared,__stompPart){...};`,
 * which runs the group of parts that has the part named (build.js
 * partsStatement). Taken and deleted as LIGHT_FACTORY is
 * (src/inject/rewriter.ts).
 */
export declare const DEFERRED_FACTORY = "__stompDeferred";
/**
 * The name the WebAuthn client of STomp's passkey provider assigns its
 * function to (src/inject/dom/passkeysPart.ts): a statement of its own after
 * the deferred parts', `__stompPasskeys=function(__stompShared){...};`
 * (build.js), so a frame that evaluates the deferred parts compiles none of
 * it. Taken and deleted as LIGHT_FACTORY is (src/inject/rewriter.ts).
 */
export declare const PASSKEYS_FACTORY = "__stompPasskeys";
/**
 * The name the gates of a document's gesture-gated calls assign their
 * function to (src/inject/dom/activationPart.ts): a statement of its own
 * after the passkey provider's, `__stompActivation=function(__stompShared){...};`
 * (build.js), so a frame that gets an activation only through the proxy
 * compiles none of the deferred parts for it. Taken and deleted as
 * LIGHT_FACTORY is (src/inject/rewriter.ts).
 */
export declare const ACTIVATION_FACTORY = "__stompActivation";
/**
 * What the controller asks for the files it starts by, after a `?`: the
 * hash of each as built (build.js NAMED_WORKERS, and the blocker's module
 * as copied), so a host may let browsers keep them for good and a reload
 * of the host's page starts its transport worker, its rewrite workers and
 * the blocker without a revalidation of each (the transport worker's was
 * one round trip before the transport module's, itself one before its
 * wasm's). Empty in a dev build, whose files change under one name, and in
 * the bundles built before these files (the document bundles, the workers
 * themselves).
 */
export declare const TRANSPORT_WORKER: string;
/** as TRANSPORT_WORKER, for rewriteWorker.js */
export declare const REWRITE_WORKER: string;
/** as TRANSPORT_WORKER, for blocker.wasm */
export declare const BLOCKER: string;
/**
 * As TRANSPORT_WORKER, for isolation mode's frame and the site pool's
 * (controllerFrame.html as copied, and the scripts it loads, built after
 * the workers: build.js NAMED_FRAMES). Empty in the frame scripts
 * themselves.
 */
export declare const CONTROLLER_FRAME: string;
export declare const CONTROLLER_FRAME_SCRIPT: string;
export declare const SITE_FRAME_SCRIPT: string;
