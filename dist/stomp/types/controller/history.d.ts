export type Direction = 'back' | 'forward';
/** what a nested document of another origin than this realm reported of its entry */
export interface ReportedEntry {
    key: string;
    id: string;
    /** the document's address as the browser has it (a route of its slot) */
    url: string;
}
/**
 * What the controller can tell of a proxied document, from its client: its
 * real origin, whether the browser had already given it a user activation
 * when it started (one carried over from the document that navigated to it)
 * and whether it has one of its own
 */
export interface DocumentView {
    origin: string;
    activatedAtStart: boolean;
    activated: boolean;
    /** names the document in its activation report */
    token: string;
}
/**
 * One run of a frame's history as the site pool's hub composes it: the
 * states of the run (each step of the frame or a frame in it between them),
 * which of them Back and Forward pass over, where the frame is in it
 */
export interface RunState {
    index: number;
    skips: boolean[];
    /**
     * each step between two states is one of the joint session history and
     * the frame is on the native entry of its state: a traversal by a
     * number of steps (`traverseBy`) lands where the states say
     */
    exact: boolean;
    /** the run's clock of changes to the joint history (counts up) */
    touched: number;
    /** a document's activation is still awaited: ask again after ACTIVATION_GRACE */
    undecided: boolean;
}
/**
 * Record what the frame did since the last look (call it whenever the frame
 * or a frame in it reports; the other functions call it too). `run`, here
 * and below: the site pool's agent keeps a history for each run of the
 * frame on its origin (RunState); everything else has the one
 */
export declare function syncHistory(win: Window | null | undefined, run?: number): void;
/** whether the frame's history has an entry in `direction`; null when the browser cannot tell */
export declare function canTraverse(win: Window | null | undefined, direction: Direction): boolean | null;
/** the run of the frame's history, after a look (RunState); null when the browser cannot tell */
export declare function runState(win: Window, run: number): RunState | null;
/** the frame's document left the run for another origin's (FrameHistory.leave); whether the run has a state left */
export declare function leaveRun(win: Window, run: number, decide: boolean, replaced?: boolean): Promise<boolean>;
/**
 * A nested frame of another origin's document than this realm's reported
 * its entry (the site pool: a frame of the page shows another slot's), so
 * its steps are the frame's too
 */
export declare function noteEntry(win: Window, entry: ReportedEntry): void;
/**
 * Traverse the joint session history by `delta` steps from the frame's
 * document, the browser's own traversal across origins (the site pool: to
 * a run of another slot), with this realm's History method: the page's is
 * narrowed to its own origin's entries (src/inject/dom/modules/History.ts)
 */
export declare function traverseBy(win: Window, delta: number): boolean;
/**
 * Step the frame's history. Resolves false when there is nothing to go to,
 * true once the step has committed (so a second call computes its target
 * from the entry the first one reached). Without the Navigation API the step
 * is issued blind through history.back(), which the caller should only do
 * when it knows the frame has somewhere to go.
 */
export declare function traverse(win: Window, direction: Direction, run?: number): Promise<boolean>;
/**
 * Tell the frame's history how to read its documents' clients (their real
 * origin and user activation), for Chrome's history intervention
 */
export declare function bindHistory(win: Window | null | undefined, reader: (win: Window) => DocumentView | null, earlier?: (win: Window) => Window[], run?: number): void;
/**
 * The windows a nested frame of `top` showed before its page gave it fresh
 * browsing contexts (src/inject/dom/freshContext.ts), latest first, as the
 * page's client (the window's `name` global) keeps them
 */
export declare function earlierWindows(top: Window, name: string): (win: Window) => Window[];
/**
 * The frame's next document comes from the host, not the page (a typed URL,
 * Reload): it starts with no activation carried over, and the document it
 * replaces is not taken to have navigated by script
 */
export declare function noteBrowserNavigation(win: Window | null | undefined, run?: number): void;
/** what a document's client (the window's `name` global) says for its frame's history */
export declare function clientView(win: Window, name: string): DocumentView | null;
/**
 * The site pool: the frame's entries in other slots' stretches of its
 * history, which its document (of this realm's origin) counts in
 * `history.length` (the client's historyAcross)
 */
export declare function tellAcross(win: Window, name: string, across: number): void;
/**
 * A document of the frame reported its first user activation (its token);
 * `nested`: a document of a frame in its page, whose activation is the
 * page's too (an activation reaches every ancestor of its frame)
 */
export declare function noteActivation(win: Window | null | undefined, token: string, nested?: boolean, run?: number): void;
/**
 * What the site pool's hub asks of a run of a frame's history
 * (src/controller/sites.ts): take a report of the frame's document (`sync`),
 * of a frame in its page (`nested`, its path of indices from the frame and
 * the entry it reported) or of a user activation, note that the next
 * document comes from the host (`typed`), reload, step within the run, step
 * the joint history by `delta` (to another run), take the next document for
 * a state of the run (`arrive`: the hub sends the frame there in place of
 * another run's entry), or close the run for a document of another origin
 * (`leave`)
 */
export type SiteHistoryOp = {
    kind: 'sync';
    across?: number;
} | {
    kind: 'nested';
    path: number[];
    entry: ReportedEntry | null;
} | {
    kind: 'activated';
    token: string;
    nested: boolean;
} | {
    kind: 'typed';
} | {
    kind: 'reload';
} | {
    kind: 'back';
} | {
    kind: 'forward';
} | {
    kind: 'go';
    delta: number;
} | {
    kind: 'arrive';
    state: number;
} | {
    kind: 'leave';
    decide: boolean;
    replaced?: boolean;
} | RunsExpectation;
/**
 * What the hub last knew of a frame's runs (`expect`, told to every agent):
 * the origin of the run the frame is in, its entries in the runs before and
 * after it (src/controller/index.ts entriesBeside) and where the frame is in
 * its own (HISTORY_RUN)
 */
export interface RunsExpectation {
    kind: 'expect';
    origin: string;
    before: number;
    index: number;
    count: number;
    after: number;
}
/** whether the op was done (a step there was to take), and the run's state after it */
export interface SiteHistoryAnswer {
    done: boolean;
    state: RunState | null;
    /** `arrive`: the address of the state's document as the browser had it */
    url?: string;
}
/**
 * Answer `op` for run `run` of the frame `win` (of this realm's origin, or
 * gone to another's for `leave`), its documents' clients under `name`
 */
export declare function answerRun(win: Window, run: number, op: SiteHistoryOp, name: string): Promise<SiteHistoryAnswer>;
/**
 * The indices from `top` down to `win`, a window in a frame of its page
 * (what `answerRun` takes for a nested report), or null when it is not one
 */
export declare function framePath(top: Window, win: Window): number[] | null;
