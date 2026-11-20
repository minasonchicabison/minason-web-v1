import { type HostGeometry } from '../config';
/** the geometry of `elements`, frames of this page (the real top) */
export declare function measureGeometry(elements: Iterable<HTMLIFrameElement>): HostGeometry;
/** keep `geometry` on `target` (HOST_GEOMETRY), frozen, for the documents of its origin */
export declare function shareGeometry(target: Window, geometry: HostGeometry): void;
/** what `target` holds (HOST_GEOMETRY), if anything */
export declare function sharedGeometry(target: Window): HostGeometry | undefined;
/**
 * Measures a controller's frames whenever the host's viewport or one of
 * them changes size (a resize, a fullscreen change, the host's layout) and
 * hands each new geometry to `deliver`
 */
export declare class GeometryWatch {
    #private;
    private elements;
    private deliver;
    constructor(elements: () => Iterable<HTMLIFrameElement>, deliver: (geometry: HostGeometry) => unknown);
    /** measure `element` too, from now on */
    observe(element: HTMLIFrameElement): void;
    /** measure now; settles once a changed geometry was delivered */
    update(): Promise<void>;
}
