import BaseAnimation from "animations/base-animation";
import { FONTS, } from "ctf-render-defines";
export class Notification extends BaseAnimation {
    // ==========================================================================
    constructor(flakture, text, color, outlineColor, fadeInS, maxOpacityS, fadeOutS) {
        super();
        this.aggregateTime = 0;
        this.flakture = flakture;
        this.fadeInS = fadeInS;
        this.fadeOutS = fadeOutS;
        this.maxOpacityS = maxOpacityS;
        const { renderRatio, ruleset } = flakture;
        this.elem = flakture.createSvgElem("text", {
            appendTo: this.flakture.svg,
            attributes: {
                "class": "notification",
                fill: color,
                stroke: outlineColor,
                style: `font: ${FONTS.notification.size * renderRatio}px ${FONTS.notification.face}; font-weight: bold; pointer-events: none;`,
                "x": (renderRatio * (ruleset.BOARD_W / 2)).toString(),
                "y": (renderRatio * (ruleset.BOARD_H / 2)).toString(),
                "text-anchor": "middle"
            },
            children: [text]
        });
    }
    // ==========================================================================
    addTime(dSeconds) {
        super.addTime(dSeconds);
        this.aggregateTime += dSeconds;
        let opacity = 0;
        if (this.aggregateTime < this.fadeInS) {
            opacity = this.aggregateTime / this.fadeInS;
        }
        else if (this.aggregateTime < this.fadeInS + this.maxOpacityS) {
            opacity = 1;
        }
        else if (this.aggregateTime < this.fadeInS + this.maxOpacityS + this.fadeOutS) {
            opacity = 1 - (this.aggregateTime - this.fadeInS - this.maxOpacityS) / this.fadeOutS;
        }
        else {
            this.done = true;
        }
        this.elem.setAttribute("opacity", opacity.toString());
    }
    // ==========================================================================
    completelyDestroy() {
        super.completelyDestroy();
        this.elem.remove();
    }
}
//# sourceMappingURL=notification.js.map