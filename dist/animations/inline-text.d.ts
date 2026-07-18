import BaseAnimation from "animations/base-animation";
import Flakture from "components/flakture";
export declare class InlineText extends BaseAnimation {
    elapsedS: number;
    elem: SVGTextElement;
    fadeInS: number;
    fadeS: number;
    flakture: Flakture;
    maxOpacityS: number;
    constructor(flakture: Flakture, text: string, color: string, outlineColor: string, centerX: number, centerY: number, fadeInS: number, maxOpacityS: number, fadeS: number);
    addTime(dSeconds: number): void;
    totalTimeS(): number;
}
//# sourceMappingURL=inline-text.d.ts.map