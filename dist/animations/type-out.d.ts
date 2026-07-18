import BaseAnimation from "animations/base-animation";
export declare class TypeOut extends BaseAnimation {
    aggregateTimeS: number;
    elem: HTMLInputElement;
    secondsPerChar: number;
    value: string;
    constructor(elem: HTMLInputElement, value: string, secondsPerChar: number);
    addTime(dSeconds: number): void;
}
//# sourceMappingURL=type-out.d.ts.map