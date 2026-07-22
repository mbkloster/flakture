import BaseAnimation from "./base-animation";
import Flakture from "../components/flakture";
export declare class Notification extends BaseAnimation {
    aggregateTime: number;
    elem: SVGElement;
    fadeInS: number;
    fadeOutS: number;
    flakture: Flakture;
    maxOpacityS: number;
    constructor(flakture: Flakture, text: string, color: string, outlineColor: string, fadeInS: number, maxOpacityS: number, fadeOutS: number);
    addTime(dSeconds: number): void;
    completelyDestroy(): void;
}
//# sourceMappingURL=notification.d.ts.map