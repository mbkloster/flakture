import BaseAnimation from "animations/base-animation";
import {WILLPOWER_DEDUCTION_PER_S} from "ctf-render-defines";
import Flakture from "components/flakture";
import {Side} from "common-types";

export class WillpowerDeduction extends BaseAnimation {
    currentValue: number
    deductionCounterS: number
    elem: Element
    flakture: Flakture
    targetValue: number

    // ==========================================================================
    constructor(flakture: Flakture, side: Side, deduction: number) {
        super();
        this.elem = flakture.elem(`control-bar-willpower-number-${side}`);
        this.flakture = flakture;
        this.currentValue = parseInt(this.elem.innerHTML);
        this.targetValue = this.currentValue - deduction;
        this.deductionCounterS = 0;
    }

    // ==========================================================================
    addTime(dSeconds: number) {
        this.deductionCounterS += dSeconds;
        while (this.deductionCounterS >= WILLPOWER_DEDUCTION_PER_S) {
            this.currentValue--;
            this.elem.innerHTML = this.currentValue.toString();
            this.deductionCounterS -= WILLPOWER_DEDUCTION_PER_S;
        }
        if (this.currentValue <= this.targetValue) {
            this.done = true;
        }
    }
}