import { type IsolationEngine } from '../isolation';
/**
 * What this browser makes of cross-origin isolation, by frames of this
 * document under `directory` (the controller's address); null when it could
 * not tell. In a document that is not isolated only the
 * Document-Isolation-Policy is asked about (the rest is Chrome's, and moot
 * there).
 */
export declare function probeIsolation(directory: string): Promise<IsolationEngine | null>;
