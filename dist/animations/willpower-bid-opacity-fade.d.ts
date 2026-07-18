import BaseAnimation from "animations/base-animation";
import Flakture from "components/flakture";
export declare class WillpowerBidOpacityFade extends BaseAnimation {
    opacity: number;
    flakture: Flakture;
    targetOpacity: number;
    constructor(flakture: Flakture, initialOpacity?: number, targetOpacity?: number);
    addTime(dSeconds: number): void;
}
//# sourceMappingURL=willpower-bid-opacity-fade.d.ts.map