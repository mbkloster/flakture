import BaseAnimation from "./base-animation";
import { BothSides, Side } from "../common-types";
import { WILLPOWER_BID_PADDING, WILLPOWER_BID_TRAVEL_PER_S } from "../ctf-render-defines";
export class WillpowerBidPlacementTravel extends BaseAnimation {
    elapsed;
    elems;
    flakture;
    positions;
    durationS;
    travelPerS;
    // ==========================================================================
    constructor(flakture) {
        super();
        this.flakture = flakture;
        const { renderRatio } = flakture;
        this.elapsed = 0;
        this.elems = {
            [Side.left]: flakture.elem("willpower-bid-text-left"),
            [Side.right]: flakture.elem("willpower-bid-text-right"),
        };
        this.positions = {
            [Side.left]: {
                x: parseFloat(this.elems.left.getAttribute("x") || "0") / renderRatio,
                y: parseFloat(this.elems.left.getAttribute("y") || "0") / renderRatio,
            },
            [Side.right]: {
                x: parseFloat(this.elems.right.getAttribute("x") || "0") / renderRatio,
                y: parseFloat(this.elems.right.getAttribute("y") || "0") / renderRatio,
            },
        };
        console.log('animation positions', JSON.stringify(this.positions));
        const { ruleset } = flakture;
        const destinations = {
            [Side.left]: { x: WILLPOWER_BID_PADDING, y: ruleset.BOARD_H - WILLPOWER_BID_PADDING },
            [Side.right]: { x: ruleset.BOARD_W - WILLPOWER_BID_PADDING, y: ruleset.BOARD_H - WILLPOWER_BID_PADDING }
        };
        const angleLeft = Math.atan2(destinations[Side.left].y - this.positions[Side.left].y, destinations[Side.left].x - this.positions[Side.left].x);
        const angleRight = Math.atan2(destinations[Side.right].y - this.positions[Side.right].y, destinations[Side.right].x - this.positions[Side.right].x);
        const distanceLeft = Math.sqrt(Math.pow(destinations[Side.left].y - this.positions[Side.left].y, 2) + Math.pow(destinations[Side.left].x - this.positions[Side.left].x, 2));
        const distanceRight = Math.sqrt(Math.pow(destinations[Side.right].y - this.positions[Side.right].y, 2) + Math.pow(destinations[Side.right].x - this.positions[Side.right].x, 2));
        this.durationS = Math.max(distanceLeft, distanceRight) / WILLPOWER_BID_TRAVEL_PER_S;
        this.travelPerS = {
            [Side.left]: { x: Math.cos(angleLeft) * WILLPOWER_BID_TRAVEL_PER_S, y: Math.sin(angleLeft) * WILLPOWER_BID_TRAVEL_PER_S },
            [Side.right]: { x: Math.cos(angleRight) * WILLPOWER_BID_TRAVEL_PER_S, y: Math.sin(angleRight) * WILLPOWER_BID_TRAVEL_PER_S },
        };
    }
    // ==========================================================================
    addTime(dSeconds) {
        this.elapsed += dSeconds;
        BothSides.forEach(side => {
            const position = this.positions[side];
            position.x += this.travelPerS[side].x * dSeconds;
            position.y += this.travelPerS[side].y * dSeconds;
            const elem = this.flakture.elem(`willpower-bid-text-${side}`);
            elem.setAttribute("x", (position.x * this.flakture.renderRatio).toString());
            elem.setAttribute("y", (position.y * this.flakture.renderRatio).toString());
        });
        if (this.elapsed >= this.durationS) {
            this.done = true;
        }
    }
}
//# sourceMappingURL=willpower-bid-placement-travel.js.map