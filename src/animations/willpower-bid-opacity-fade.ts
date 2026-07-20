import BaseAnimation from "animations/base-animation";
import {WILLPOWER_BID_FADE_IN_S, WILLPOWER_BID_OPACITY_MAX} from "../ctf-render-defines";
import Flakture from "components/flakture";
import {renderWillpowerBidOpacities} from "render/flakture/board";

const OPACITY_FADE_RATE = WILLPOWER_BID_OPACITY_MAX / WILLPOWER_BID_FADE_IN_S;

export class WillpowerBidOpacityFade extends BaseAnimation {
    opacity: number
    flakture: Flakture
    targetOpacity: number

    // ==========================================================================
    constructor(flakture: Flakture, initialOpacity = 0, targetOpacity = WILLPOWER_BID_OPACITY_MAX) {
        super();
        this.flakture = flakture;
        this.opacity = initialOpacity;
        this.targetOpacity = targetOpacity;
    }

    // ==========================================================================
    addTime(dSeconds: number) {
        if (this.targetOpacity >= this.opacity) {
            this.opacity = Math.min(this.targetOpacity, this.opacity + dSeconds * OPACITY_FADE_RATE);
            if (this.opacity >= this.targetOpacity) {
                this.done = true;
            }
        } else {
            this.opacity = Math.max(this.targetOpacity, this.opacity - dSeconds * OPACITY_FADE_RATE);
            if (this.opacity <= this.targetOpacity) {
                this.done = true;
            }
        }
        renderWillpowerBidOpacities(this.flakture, this.opacity);
    }
}