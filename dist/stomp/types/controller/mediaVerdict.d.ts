import type { MediaVerdict } from '../transport/messages';
/**
 * What Chrome answers `getUserMedia(constraints)` before it looks at the
 * permissions policy or the permission (docs/permissions.md). Chrome
 * settles a request in that order: malformed constraints (TypeError), the
 * devices and the constraints against them (NotFoundError,
 * OverconstrainedError), the policy, the permission. A proxied page's
 * policy and permission are STomp's to answer, and its refusal must come
 * after the same checks, which only the browser can make; calling the
 * page's own `getUserMedia` to learn them could prompt the user or open the
 * device.
 *
 * So the request is made in a frame of this document (the proxy origin, as
 * the page is: device ids are an origin's) whose `allow` turns the camera
 * and the microphone off. Chrome gets as far as the policy there and no
 * further: NotAllowedError says everything before it passed, anything else
 * is the answer the page would get first. It cannot prompt, and no device
 * opens. Null: no verdict (no frame, no answer in time).
 *
 * One request at a time: the frame is in the host's document for as long
 * as Chrome takes (it never answers a frame that left its document), and a
 * page that asks a thousand times at once must not put a thousand there.
 */
export declare function mediaVerdict(constraints: unknown): Promise<MediaVerdict | null>;
