// ==========================================================================
export const renderWillpowerBidPopup = (flakture) => {
    const maxBid = flakture.gameState.willpower[flakture.selectedSide] - Object.keys(flakture.currentTurn().moves[flakture.selectedSide].redeployments).length;
    const popupElem = flakture.createElem("div", {
        appendTo: flakture.containingElem,
        attributes: { "class": "willpower-bid-popup" }
    });
    const contentElem = flakture.createElem("div", {
        appendTo: popupElem,
        attributes: { "class": "willpower-bid-popup-content" }
    });
    flakture.createElem("h3", {
        appendTo: contentElem,
        attributes: { "class": "willpower-bid-popup-header" },
        children: ["Willpower bid"]
    });
    const formElem = flakture.createElem("form", {
        appendTo: contentElem,
        attributes: { "class": "willpower-bid-popup-form" },
        eventHandlers: {
            submit: event => {
                event.preventDefault();
                const inputElem = flakture.elem("willpower-bid-popup-form-input");
                const willpowerBid = parseInt(inputElem.value) || 0;
                flakture.confirmMove(willpowerBid);
                flakture.ensureElemRemoved("willpower-bid-popup"); // Bye bye
                // So that stale input elem doesn't persist:
                flakture.ensureElemRemoved("willpower-bid-popup-form-input");
            }
        }
    });
    const numbersElem = flakture.createElem("form", {
        appendTo: formElem,
        attributes: { "class": "willpower-bid-popup-numbers" },
    });
    flakture.createElem("button", {
        appendTo: numbersElem,
        attributes: {
            "class": "willpower-bid-popup-form-adjust is-plus",
            "type": "button"
        },
        children: ["+"],
        eventHandlers: {
            click: (_event) => {
                const input = htmlInput;
                let value = parseInt(input.value) || 0;
                if (value < maxBid) {
                    value++;
                }
                input.value = value.toString();
            }
        }
    });
    const htmlInput = flakture.createElem("input", {
        appendTo: numbersElem,
        attributes: {
            "class": "willpower-bid-popup-form-input",
            "type": "number",
            "value": "0"
        }
    });
    flakture.createElem("button", {
        appendTo: numbersElem,
        attributes: {
            "class": "willpower-bid-popup-form-adjust is-minus",
            "type": "button"
        },
        children: ["-"],
        eventHandlers: {
            click: (_event) => {
                const input = htmlInput;
                let value = parseInt(input.value) || 0;
                if (value > 0) {
                    value--;
                }
                input.value = value.toString();
            }
        }
    });
    const controlsElem = flakture.createElem("div", {
        appendTo: formElem,
    });
    flakture.createElem("button", {
        appendTo: controlsElem,
        attributes: { "class": "willpower-bid-popup-form-submit", "type": "submit" },
        children: ["Submit move"]
    });
    flakture.createElem("button", {
        appendTo: controlsElem,
        attributes: { "class": "willpower-bid-popup-form-cancel", "type": "button" },
        children: ["Cancel"],
        eventHandlers: {
            click: event => {
                flakture.ensureElemRemoved("willpower-bid-popup"); // Bye bye
                // So that stale input elem doesn't persist:
                flakture.ensureElemRemoved("willpower-bid-popup-form-input");
            }
        }
    });
};
//# sourceMappingURL=willpower-bid-popup.js.map