/** what an HTTPS record says about HTTP/3 for the name */
export interface HttpsRecord {
    h3: boolean;
    /** the record's `port`, when it names one */
    port?: number;
    /** seconds the answer may be kept */
    ttl: number;
}
/** the wire-format query for `name` IN HTTPS, id 0 as RFC 8484 asks */
export declare function httpsQuery(name: string): Uint8Array;
export declare function base64url(bytes: Uint8Array): string;
/**
 * The first ServiceMode HTTPS record in a DoH answer, or `null` when there
 * is none (an AliasMode record, or no record at all, names nothing here).
 * A record for the CNAME target the resolver followed counts as the name's.
 */
export declare function parseHttpsAnswer(message: ArrayBuffer): HttpsRecord | null;
