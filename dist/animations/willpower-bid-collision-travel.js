import BaseAnimation from "animations/base-animation";
import { WILLPOWER_BID_MARGIN_MIN, WILLPOWER_BID_PADDING, WILLPOWER_BID_TRAVEL_PER_S } from "ctf-render-defines";
import { BothSides, Side } from "../common-types";
import { WillpowerDeduction } from "./willpower-deduction";
export class WillpowerBidCollisionTravel extends BaseAnimation {
    // ==========================================================================
    constructor(flakture, collisionPositions, winner, winningWillpowerBid) {
        super();
        this.flakture = flakture;
        const { ruleset } = flakture;
        this.positions = {
            left: { x: WILLPOWER_BID_PADDING, y: ruleset.BOARD_H - WILLPOWER_BID_PADDING },
            right: { x: ruleset.BOARD_W - WILLPOWER_BID_PADDING, y: ruleset.BOARD_H - WILLPOWER_BID_PADDING }
        };
        let minSide = Side.left, maxSide = Side.right;
        if (collisionPositions.left.x <= collisionPositions.right.x) {
            this.targets = {
                left: { x: collisionPositions.left.x - WILLPOWER_BID_PADDING, y: collisionPositions.left.y },
                right: { x: collisionPositions.right.x + WILLPOWER_BID_PADDING, y: collisionPositions.right.y }
            };
        }
        else {
            minSide = Side.right;
            maxSide = Side.left;
            this.targets = {
                left: { x: collisionPositions.left.x + WILLPOWER_BID_PADDING, y: collisionPositions.left.y },
                right: { x: collisionPositions.right.x - WILLPOWER_BID_PADDING, y: collisionPositions.right.y }
            };
        }
        if (this.targets[minSide].x < WILLPOWER_BID_MARGIN_MIN) {
            if (this.targets[minSide].y < WILLPOWER_BID_MARGIN_MIN) {
                this.targets[minSide].y += WILLPOWER_BID_PADDING;
                this.targets[minSide].x = collisionPositions[minSide].x;
            }
            else {
                this.targets[minSide].y -= WILLPOWER_BID_PADDING;
                this.targets[minSide].x = collisionPositions[minSide].x;
            }
        }
        if (this.targets[maxSide].x > ruleset.BOARD_W - WILLPOWER_BID_MARGIN_MIN) {
            if (this.targets[maxSide].y < WILLPOWER_BID_MARGIN_MIN) {
                this.targets[maxSide].y += WILLPOWER_BID_PADDING;
                this.targets[maxSide].x = collisionPositions[maxSide].x;
            }
            else {
                this.targets[maxSide].y -= WILLPOWER_BID_PADDING;
                this.targets[maxSide].x = collisionPositions[maxSide].x;
            }
        }
        this.travelUnits = { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };
        let travelTimeS = 0;
        BothSides.forEach(side => {
            const angle = Math.atan2(this.targets[side].y - this.positions[side].y, this.targets[side].x - this.positions[side].x);
            this.travelUnits[side].x = Math.cos(angle);
            this.travelUnits[side].y = Math.sin(angle);
            const dist = Math.sqrt(Math.pow(this.targets[side].y - this.positions[side].y, 2) +
                Math.pow(this.targets[side].x - this.positions[side].x, 2));
            const sideTravelTime = dist / WILLPOWER_BID_TRAVEL_PER_S;
            if (sideTravelTime > travelTimeS) {
                travelTimeS = sideTravelTime;
            }
        });
        this.travelTimeS = travelTimeS;
        this.afterComplete = () => {
            this.flakture.addAnimation(new WillpowerDeduction(this.flakture, winner, winningWillpowerBid));
            setTimeout(() => {
                const { renderRatio } = this.flakture;
                const leftElem = this.flakture.elem("willpower-bid-text-left");
                leftElem.setAttribute("x", (renderRatio * WILLPOWER_BID_PADDING).toString());
                leftElem.setAttribute("y", (renderRatio * (ruleset.BOARD_H - WILLPOWER_BID_PADDING)).toString());
                const rightElem = this.flakture.elem("willpower-bid-text-right");
                rightElem.setAttribute("x", (renderRatio * (ruleset.BOARD_W - WILLPOWER_BID_PADDING)).toString());
                rightElem.setAttribute("y", (renderRatio * (ruleset.BOARD_H - WILLPOWER_BID_PADDING)).toString());
            }, 1000);
        };
    }
    // ==========================================================================
    addTime(dSeconds) {
        let foundNotDone = false;
        const { renderRatio } = this.flakture;
        BothSides.forEach(side => {
            const distTravel = WILLPOWER_BID_TRAVEL_PER_S * dSeconds;
            if (this.positions[side].x !== this.targets[side].x || this.positions[side].y !== this.targets[side].y) {
                const distLeftoverSq = Math.pow(this.positions[side].y - this.targets[side].y, 2) + Math.pow(this.positions[side].x - this.targets[side].x, 2);
                if (distLeftoverSq <= distTravel * distTravel) {
                    this.positions[side] = { ...this.targets[side] };
                }
                else {
                    foundNotDone = true;
                    this.positions[side].x += this.travelUnits[side].x * distTravel;
                    this.positions[side].y += this.travelUnits[side].y * distTravel;
                }
                const elem = this.flakture.elem(`willpower-bid-text-${side}`);
                elem.setAttribute("x", (renderRatio * this.positions[side].x).toString());
                elem.setAttribute("y", (renderRatio * this.positions[side].y).toString());
            }
        });
        this.done = !foundNotDone;
    }
}
//# sourceMappingURL=willpower-bid-collision-travel.js.map