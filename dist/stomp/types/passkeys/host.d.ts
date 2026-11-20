import { type PasskeyAnswer, type PasskeyPrompt, type PasskeyRequest, type PasskeysInit } from './types';
/**
 * Ask the host about one ceremony. `port` hears PASSKEY_CANCEL (or closes)
 * when the page gives up, which aborts the request's signal. Resolves the
 * host's answer, or null when it declined, threw or the page gave up.
 */
export declare function askHost<Request extends PasskeyRequest>(init: PasskeysInit<Request>, prompt: PasskeyPrompt, port: MessagePort, extra: Omit<Request, keyof PasskeyRequest>): Promise<PasskeyAnswer | null>;
