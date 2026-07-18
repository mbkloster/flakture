import BaseAnimation from "animations/base-animation";
import {
    FONTS,
    WILLPOWER_BID_MARGIN_MIN,
    WILLPOWER_BID_PADDING, WILLPOWER_BID_TRAVEL_PER_S
} from "ctf-render-defines";
import Flakture from "components/flakture";
import {BothSides, Coord, Side} from "common-types";
import {WillpowerDeduction} from "./willpower-deduction";

export class TypeOut extends BaseAnimation {
    aggregateTimeS: number
    elem: HTMLInputElement
    secondsPerChar: number
    value: string

    // ==========================================================================
    constructor(elem: HTMLInputElement, value: string, secondsPerChar: number) {
        super();
        this.aggregateTimeS = 0;
        this.elem = elem;
        this.secondsPerChar = secondsPerChar;
        this.value = value;
    }

    // ==========================================================================
    addTime(dSeconds: number) {
        super.addTime(dSeconds);
        this.aggregateTimeS += dSeconds;

        const charactersTyped = Math.floor(this.aggregateTimeS / this.secondsPerChar);
        if (charactersTyped >= this.value.length) {
            this.elem.value = this.value;
            this.done = true;
        } else {
            this.elem.value = this.value.substring(0, charactersTyped);
        }
    }
}