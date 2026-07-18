import BaseAnimation from "animations/base-animation";
export class TypeOut extends BaseAnimation {
    // ==========================================================================
    constructor(elem, value, secondsPerChar) {
        super();
        this.aggregateTimeS = 0;
        this.elem = elem;
        this.secondsPerChar = secondsPerChar;
        this.value = value;
    }
    // ==========================================================================
    addTime(dSeconds) {
        super.addTime(dSeconds);
        this.aggregateTimeS += dSeconds;
        const charactersTyped = Math.floor(this.aggregateTimeS / this.secondsPerChar);
        if (charactersTyped >= this.value.length) {
            this.elem.value = this.value;
            this.done = true;
        }
        else {
            this.elem.value = this.value.substring(0, charactersTyped);
        }
    }
}
//# sourceMappingURL=type-out.js.map