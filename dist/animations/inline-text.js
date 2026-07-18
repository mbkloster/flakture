import BaseAnimation from "animations/base-animation";
import { FONTS } from "ctf-render-defines";
export class InlineText extends BaseAnimation {
    // ==========================================================================
    constructor(flakture, text, color, outlineColor, centerX, centerY, fadeInS, maxOpacityS, fadeS) {
        super();
        this.elapsedS = 0;
        this.flakture = flakture;
        this.fadeInS = fadeInS;
        this.fadeS = fadeS;
        this.maxOpacityS = maxOpacityS;
        const { renderRatio } = flakture;
        this.elem = flakture.createElem("text", {
            appendTo: flakture.svg,
            attributes: {
                opacity: "0",
                style: `font: ${FONTS.inlineText.size * renderRatio}px ${FONTS.inlineText.face}; font-weight: bold; pointer-events: none;`,
                x: (centerX * renderRatio).toString(),
                y: (centerY * renderRatio).toString(),
                stroke: outlineColor,
                fill: color,
                "text-anchor": "middle",
            }, children: [text], isSvg: true
        });
        this.afterComplete = () => {
            this.elem.remove();
        };
    }
    // ==========================================================================
    addTime(dSeconds) {
        this.elapsedS += dSeconds;
        if (this.elapsedS <= this.fadeInS) {
            this.elem.setAttribute("opacity", (this.elapsedS / this.fadeInS).toString());
        }
        else if (this.elapsedS <= this.fadeInS + this.maxOpacityS) {
            this.elem.setAttribute("opacity", "1");
        }
        else if (this.elapsedS <= this.fadeInS + this.maxOpacityS + this.fadeS) {
            this.elem.setAttribute("opacity", (1 - (this.elapsedS - this.fadeInS - this.maxOpacityS) / this.fadeS).toString());
        }
        else {
            this.done = true;
        }
    }
    // ==========================================================================
    totalTimeS() {
        return this.fadeInS + this.maxOpacityS + this.fadeS;
    }
}
//# sourceMappingURL=inline-text.js.map