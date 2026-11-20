import type { NavigateInfo } from '../transport/messages';
import type { Direction, ReportedEntry, SiteHistoryAnswer, SiteHistoryOp } from './history';
/** what a frame's runs need of the frame that keeps them */
export interface SiteRunsHost {
    /** ask the agent of `origin` (the controller frame, for its own origin; every one, unanswered, for '*') about run `run` of the frame */
    ask(origin: string, run: number, op: SiteHistoryOp): Promise<SiteHistoryAnswer | null>;
    /** the origin of a site shown without the pool (a slot left out), the controller frame's */
    home: string;
    /** the other frames' runs, which share the joint session history */
    others(): SiteRuns[];
    /** the buttons may have changed with no report of the frame's */
    changed(): void;
    /** the frame's window, null once it is gone */
    window(): Window | null;
    /** the URL a run's last document is routed to again, on the slot that shows its site now */
    address(url: string, origin: string): Promise<string>;
    /** resolves on the frame's next report (or its timeout) */
    nextReport(): Promise<void>;
}
export declare class SiteRuns {
    #private;
    host: SiteRunsHost;
    constructor(host: SiteRunsHost);
    /** the origin the frame's document last reported from */
    get origin(): string | undefined;
    /**
     * A top document of the frame reported, from `origin`, navigated to as
     * `type` says (NAVIGATION_TYPE), where its slot's stretch of the history
     * has it (`entries`, HISTORY_RUN); `deliver` reports it once the agent of
     * that origin took it
     */
    report(origin: string, info: NavigateInfo, type: string | null, deliver: () => void, entries?: [number, number] | null): void;
    /** a document in a frame of the page (at `path` below the frame) reported that its history moved */
    nested(path: number[], entry: ReportedEntry | null): void;
    /** a document of the frame (or of a frame in its page, `nested`) reported its first user activation */
    activated(token: string, nested: boolean): void;
    /**
     * The host navigates the frame to a document of `origin`: the run that
     * shows it takes the next document for the host's, else the next run
     * starts with it
     */
    typed(origin: string): Promise<void>;
    /** the host reloads the frame: whether the agent of its run did (null: no agent answered) */
    reload(): Promise<boolean | null>;
    /** whether the frame's history has a state Back or Forward goes to */
    can(direction: Direction): boolean;
    /** step the frame's history, within its run through the agent of its slot, else to another run */
    step(direction: Direction): Promise<boolean>;
}
