/** tell every slot's worker but `except` that the jar changed for `domain` */
export declare function jarChanged(domain: string, except?: MessagePort): void;
/** answer a slot's worker on `port` */
export declare function serveJar(port: MessagePort): void;
