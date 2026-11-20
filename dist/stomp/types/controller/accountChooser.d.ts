import { type IdentityChooserRequest } from '../transport/messages';
/**
 * A proxied page's FedCM account chooser, drawn in the host's page over
 * the frame that shows the page (src/inject/dom/credentialFlows.ts asks
 * for it through the service worker). Natively the chooser is the
 * browser's own UI, outside the page: a page cannot see it being shown,
 * and so cannot learn that the user has accounts at the provider. Drawn in
 * the page itself it could, whatever hid its contents (a MutationObserver
 * sees the node added, elementFromPoint and layout see the box). Here the
 * page's document is never touched: the chooser sits in a closed shadow
 * root of the host's document, where the frame's hit testing, layout and
 * focus are not, and like Chrome's bubble it takes no focus when it shows.
 * What the page can still tell is what it can tell of Chrome's: its
 * request waits, and a press in the chooser takes the focus out of it.
 *
 * Resolves with the index of the account picked, IDENTITY_CLOSED when the
 * user closed it (Chrome's close button, which starts the site's cooldown)
 * or IDENTITY_GONE when `port` closed first (the document went away) or
 * said the request ended (an abort of its signal).
 */
export declare function drawAccountChooser(frame: HTMLIFrameElement | null, request: IdentityChooserRequest, port: MessagePort): Promise<number>;
