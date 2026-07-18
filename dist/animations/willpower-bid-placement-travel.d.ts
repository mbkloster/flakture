import BaseAnimation from "animations/base-animation";
import Flakture from "components/flakture";
import { Coord, Side } from "common-types";
export declare class WillpowerBidPlacementTravel extends BaseAnimation {
    elapsed: number;
    elems: Record<Side, SVGTextElement>;
    flakture: Flakture;
    positions: Record<Side, Coord>;
    durationS: number;
    travelPerS: Record<Side, Coord>;
    constructor(flakture: Flakture);
    addTime(dSeconds: number): void;
}
//# sourceMappingURL=willpower-bid-placement-travel.d.ts.map