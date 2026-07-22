import BaseAnimation from "./base-animation";
import { WILLPOWER_DEDUCTION_PER_S } from "../ctf-render-defines";
export class WillpowerDeduction extends BaseAnimation {
    currentValue;
    deductionCounterS;
    elem;
    flakture;
    targetValue;
    // ==========================================================================
    constructor(flakture, side, deduction) {
        super();
        this.elem = flakture.elem(`control-bar-willpower-number-${side}`);
        this.flakture = flakture;
        this.currentValue = parseInt(this.elem.innerHTML);
        this.targetValue = this.currentValue - deduction;
        this.deductionCounterS = 0;
    }
    // ==========================================================================
    addTime(dSeconds) {
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
//# sourceMappingURL=willpower-deduction.js.map