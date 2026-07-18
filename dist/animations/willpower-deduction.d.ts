import BaseAnimation from "animations/base-animation";
import Flakture from "components/flakture";
import { Side } from "common-types";
export declare class WillpowerDeduction extends BaseAnimation {
    currentValue: number;
    deductionCounterS: number;
    elem: Element;
    flakture: Flakture;
    targetValue: number;
    constructor(flakture: Flakture, side: Side, deduction: number);
    addTime(dSeconds: number): void;
}
//# sourceMappingURL=willpower-deduction.d.ts.map