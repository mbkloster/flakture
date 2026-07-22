import BaseAnimation from "./base-animation";
import Flakture from "../components/flakture";
import { Coord, Side } from "../common-types";
export declare class WillpowerBidCollisionTravel extends BaseAnimation {
    flakture: Flakture;
    positions: Record<Side, Coord>;
    targets: Record<Side, Coord>;
    travelTimeS: number;
    travelUnits: Record<Side, Coord>;
    constructor(flakture: Flakture, collisionPositions: Record<Side, Coord>, winner: Side, winningWillpowerBid: number);
    addTime(dSeconds: number): void;
}
//# sourceMappingURL=willpower-bid-collision-travel.d.ts.map