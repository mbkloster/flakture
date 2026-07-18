import { Side } from "common-types";
import Flakture from "components/flakture";
type DistanceBarProps = Record<Side, {
    currentFill: number;
    fillAfterDistance: number;
    fillAfterDistanceAndRefresh: number;
}>;
export declare const sideConfirmedIcon: (flakture: Flakture, side: Side) => HTMLElement | SVGElement;
export declare const sideSubmitButton: (flakture: Flakture, side: Side) => HTMLElement | SVGElement;
export declare const sideThinkingButton: () => string;
export declare const clearDestinationsAndHideControls: (flakture: Flakture) => void;
export declare const deriveDistanceFillProps: (flakture: Flakture) => DistanceBarProps;
export declare const clearRenderedDestinations: (flakture: Flakture) => void;
export declare const renderControlBar: (flakture: Flakture) => void;
export declare const renderDistanceFill: (flakture: Flakture, distFillProps: DistanceBarProps, side: Side) => void;
export declare const renderDistanceLine: (flakture: Flakture, distFillProps: DistanceBarProps, side: Side) => void;
export declare const renderInitialControlBar: (flakture: Flakture) => void;
export {};
//# sourceMappingURL=control-bar.d.ts.map