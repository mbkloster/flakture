import {
    BothSides,
    Side
} from "../../common-types";
import {
    setupClickConfirm, setupClickRedeploy,
    setupClickSpeedChange, setupClickUndoRedeploy,
    setupSelectedSideClick, setupSpaceConfirm,
    setupUndo,
} from "../../event-handlers";
import {distanceCost} from "../../ctf-state-transition";
import Flakture from "../../components/flakture";
import {deriveDeadPieceCount, opponentSide} from "../../utilities";

type DistanceBarProps = Record<Side, {
    currentFill: number,
    fillAfterDistance: number,
    fillAfterDistanceAndRefresh: number
}>

// ==========================================================================
export const sideConfirmedIcon = (flakture: Flakture, side: Side) => {
    return flakture.createElem("i", { attributes: {"class": "fa fa-check control-bar-confirmer-confirmed"}});
}

// ==========================================================================
export const sideLostButton = () => {
    return "😭";
}

// ==========================================================================
export const sideSubmitButton = (flakture: Flakture, side: Side) => {
    const elem = flakture.createElem("button", {
        attributes: {"class": `control-bar-confirmer-confirm control-bar-confirmer-confirm-${side} is-${flakture.gameProperties.colors[side]}`, "data-side": side},
        children: [flakture.createElem("i", { attributes: {"class": "fa fa-code-commit"}})]
    });
    setupClickConfirm(flakture, elem);
    return elem;
}

// ==========================================================================
export const sideThinkingButton = () => {
    return "🤔";
}

// ==========================================================================
export const sideWonButton = () => {
    return "🏆";
}

// ==========================================================================
export const clearDestinationsAndHideControls = (flakture: Flakture) => {
    if (flakture.selectedPieceIndex !== null) {
        flakture.ensureElemRemoved(`dest-below-${flakture.selectedPieceIndex}`);
        flakture.ensureElemRemoved(`dest-above-${flakture.selectedPieceIndex}`);
        flakture.ensureElemRemoved("conflict-point");
    }
    flakture.elem("control-bar-speed").classList.add("is-hidden");
    flakture.elem("control-bar-adjust").classList.add("is-hidden");
}

// ==========================================================================
export const deriveDistanceFillProps = (flakture: Flakture): DistanceBarProps => {
    const { ruleset } = flakture;
    const result: DistanceBarProps = {
        left: {currentFill: 0, fillAfterDistance: 0, fillAfterDistanceAndRefresh: 0},
        right: {currentFill: 0, fillAfterDistance: 0, fillAfterDistanceAndRefresh: 0},
    };
    const distCost = distanceCost(ruleset, flakture.gameState,
            flakture.currentTurn().moves, flakture.pieceCodex);
    BothSides.forEach(side => {
        const sideCost = (flakture.selectedSide === side || flakture.sidesConfirmed().length >= 2) ? distCost[side] : 0;
        result[side].currentFill = 100 * flakture.gameState.distance[side] / ruleset.DISTANCE_MAX;
        let distBonus = 0;
        if (flakture.currentTurn().turnNumber === 1) {
            distBonus = sideCost * ruleset.DISTANCE_USED_RECOUP_SHARE_FIRST_TURN;
        }
        result[side].fillAfterDistance = 100 * (flakture.gameState.distance[side] - sideCost) / ruleset.DISTANCE_MAX;
        result[side].fillAfterDistanceAndRefresh = 100 * Math.min(1,
            (flakture.gameState.distance[side] - sideCost + ruleset.DISTANCE_PER_TURN + distBonus) / ruleset.DISTANCE_MAX
        );
    });
    return result;
}

// ==========================================================================
export const clearRenderedDestinations = (flakture: Flakture) => {
    flakture.ensureElemRemoved("dist-line");
}

// ==========================================================================
export const renderControlBar = (flakture: Flakture) => {
    const distFillProps = deriveDistanceFillProps(flakture);

    const turn = flakture.currentTurn();
    BothSides.forEach(side => {
        renderDistanceFill(flakture, distFillProps, side);
        renderDistanceLine(flakture, distFillProps, side);
        flakture.elem(`control-bar-willpower-number-${ side }`).innerHTML = flakture.gameState.willpower[side].toString();
        const submitContainer = flakture.elem(`control-bar-confirmer-${side}`);
        if (flakture.gameState.winner === side) {
            submitContainer.replaceChildren(sideWonButton());
        } else if (flakture.gameState.winner) {
            submitContainer.replaceChildren(sideLostButton());
        } else if (turn.moveSubmissionTimes[side]) {
            submitContainer.replaceChildren(sideConfirmedIcon(flakture, side));
        } else if (!flakture.controllingSides.includes(side)) {
            submitContainer.innerHTML = sideThinkingButton();
        } else {
            submitContainer.replaceChildren(sideSubmitButton(flakture, side));
        }
    });
    if (flakture.selectedSide) {
        flakture.elem(`control-bar-side-switch-${flakture.selectedSide}`).classList.add("is-selected");
        if (flakture.elemExists(`control-bar-side-switch-${opponentSide(flakture.selectedSide)}`)) {
            flakture.elem(`control-bar-side-switch-${opponentSide(flakture.selectedSide)}`).classList.remove("is-selected");
        }

        const deadCount = deriveDeadPieceCount(flakture.gameState.pieces, flakture.selectedSide);
        if (deadCount > 0) {
            const redeployableCount = flakture.netRedeployableCount();
            flakture.elem("control-bar-redeploy").classList.remove("is-hidden");
            flakture.elem("control-bar-redeploy").innerHTML = `Redeploy (${redeployableCount})`;
            if (redeployableCount > 0) {
                flakture.elem("control-bar-redeploy").removeAttribute("disabled");
            } else {
                flakture.elem("control-bar-redeploy").setAttribute("disabled", "disabled");
            }
            if (deadCount > redeployableCount) {
                flakture.elem("control-bar-undo-redeploy").classList.remove("is-hidden");
                flakture.elem("control-bar-undo-redeploy").removeAttribute("disabled");
            } else {
                flakture.elem("control-bar-undo-redeploy").classList.add("is-hidden");
            }
        } else {
            flakture.elem("control-bar-redeploy").classList.add("is-hidden");
            flakture.elem("control-bar-undo-redeploy").classList.add("is-hidden");
        }
    } else {
        if (flakture.elemExists("control-bar-side-switch-right")) {
            flakture.elem("control-bar-side-switch-left").classList.remove("is-selected");
        }
        if (flakture.elemExists("control-bar-side-switch-right")) {
            flakture.elem("control-bar-side-switch-right").classList.remove("is-selected");
        }
        flakture.elem("control-bar-redeploy").classList.add("is-hidden");
        flakture.elem("control-bar-undo-redeploy").classList.add("is-hidden");
    }
    if (flakture.selectedPieceIndex !== null) {
        const selectedPiece = flakture.gameState.pieces[flakture.selectedPieceIndex];
        const orderNumber = parseInt(selectedPiece.name.replace(selectedPiece.side, ""));
        if (turn.moves[selectedPiece.side]?.pieces && turn.moves[selectedPiece.side]!.pieces[orderNumber]) {
            flakture.elem("control-bar-speed").classList.remove("is-hidden");
            flakture.elem("control-bar-adjust").classList.remove("is-hidden");
            (flakture.elem(`speed-radio-${ turn.moves[selectedPiece.side]!.pieces[orderNumber].speed }`) as HTMLElement).click();
        } else {
            flakture.elem("control-bar-speed").classList.add("is-hidden");
            flakture.elem("control-bar-adjust").classList.add("is-hidden");
        }
    } else {
        flakture.elem("control-bar-speed").classList.add("is-hidden");
        flakture.elem("control-bar-adjust").classList.add("is-hidden");
    }
}

// ==========================================================================
export const renderDistanceFill = (flakture: Flakture, distFillProps: DistanceBarProps, side: Side) => {
    flakture.elem(`control-bar-distance-box-fill-${ side }`).setAttribute(
        "style",
        `width: ${ distFillProps[side].currentFill }%;`
    );
}

// ==========================================================================
export const renderDistanceLine = (flakture: Flakture, distFillProps: DistanceBarProps, side: Side) => {
    const lineElem = flakture.elem(`control-bar-distance-box-line-${ side }`);
    const diamondElem = flakture.elem(`control-bar-distance-box-diamond-${ side }`);
    const textElem = flakture.elem(`control-bar-distance-box-text-${ side }`);
    textElem.innerHTML = `${Math.round(distFillProps[side].fillAfterDistance)}%`;
    diamondElem.setAttribute("style", `left: ${ distFillProps[side].fillAfterDistanceAndRefresh }%;`)
    if (distFillProps[side].currentFill === distFillProps[side].fillAfterDistance) {
        lineElem.classList.add('is-invisible');
        return;
    }
    lineElem.classList.remove('is-invisible');
    lineElem.setAttribute("style", `left: ${ distFillProps[side].fillAfterDistance }%`);
}

// ==========================================================================
export const renderInitialControlBar = (flakture: Flakture) => {
    const controlBarElem = flakture.createElem("div", {
        appendTo: flakture.containingElem,
        attributes: {
            "class": "control-bar",
        }
    });
    const controlBarTopElem = flakture.createElem("menu", {
        appendTo: controlBarElem,
        attributes: {
            "class": "control-bar-row"
        }
    });
    const controlBarBottomElem = flakture.createElem("menu", {
        appendTo: controlBarElem,
        attributes: {
            "class": "control-bar-row"
        }
    });
    const distFillProps = deriveDistanceFillProps(flakture);
    const createTopRowSideDetails = (side: Side, reversed: boolean) => {
        let submitContents: Element | string;
        if (!flakture.controllingSides.includes(side)) {
            submitContents = sideThinkingButton();
        } else {
            submitContents = sideSubmitButton(flakture, side);
        }
        const topElements = [
            flakture.createElem("li", {
                attributes: {
                    "class": `control-bar-willpower is-${flakture.gameProperties.colors[side]} is-${side.toLowerCase()}`
                },
                children: [
                    flakture.createElem("span", {
                        attributes: {"class": `control-bar-willpower-number control-bar-willpower-number-${ side }`},
                        children: [flakture.gameState.willpower[side].toString()]
                    }),
                    flakture.createElem("span", {
                        attributes: {"class": "control-bar-willpower-label"},
                        children: ["Willpower"]
                    })
                ]
            }),
            flakture.createElem("li", {
                attributes: {"class": "control-bar-distance"},
                children: [
                    flakture.createElem("div", {
                        attributes: {"class": "control-bar-distance-box"},
                        children: [
                            flakture.createElem("div", {
                                attributes: {"class": `control-bar-distance-box-fill control-bar-distance-box-fill-${ side } is-${ flakture.gameProperties.colors[side] }`, style: `width: ${ distFillProps[side].currentFill }%;`}
                            }),
                            flakture.createElem("div", {
                                attributes: {"class": `control-bar-distance-box-line control-bar-distance-box-line-${ side } ${ distFillProps[side].currentFill !== distFillProps[side].fillAfterDistance ? "" : "is-invisible"}`, style: `left: ${ distFillProps[side].fillAfterDistance }%;`}
                            }),
                            flakture.createElem("i", {
                                attributes: {"class": `control-bar-distance-box-diamond control-bar-distance-box-diamond-${ side } is-${ flakture.gameProperties.colors[side] } fa-solid fa-diamond`, style: `left: ${ distFillProps[side].fillAfterDistanceAndRefresh }%;`}
                            }),
                            flakture.createElem("span", {
                                attributes: {"class": `control-bar-distance-box-text control-bar-distance-box-text-${ side }`},
                                children: [`${Math.round(distFillProps[side].fillAfterDistance)}%`]
                            }),
                        ]
                    })
                ]
            }),
            flakture.createElem("li", {
                attributes: {"class": `control-bar-confirmer control-bar-confirmer-${side}`},
                children: [submitContents]
            }),
        ];
        if (reversed) {
            topElements.reverse();
        }
        topElements.forEach(elem => {
            controlBarTopElem.append(elem);
        });
    }
    BothSides.forEach(side => {
        createTopRowSideDetails(side, side === Side.right);
    });
    const speedRadioAndLabel = (speedInt: number, icon: string): Element[] => {
        const radioAttributes: Record<string, string | null> = {
            type: "radio",
            "name": "speed",
            "class": `speed-radio-${ speedInt }`,
            value: speedInt.toString(),
            id: `speed-${ speedInt }`
        };
        if (speedInt === 0) {
            radioAttributes.checked = speedInt === 0 ? "checked" : null;
        }
        const radio = flakture.createElem("input", {
            attributes: radioAttributes
        });
        setupClickSpeedChange(flakture, radio);
        const labelIcon = flakture.createElem("i", {
            attributes: {"class": `fa-solid fa-${ icon }`}
        })
        return [
            radio,
            flakture.createElem("label", {
                attributes: {"for": `speed-${ speedInt }`},
                children: [labelIcon]
            })
        ]
    }

    const nameElement = (side: Side) => {
        const name = flakture.gameProperties.names[side];
        const color = flakture.gameProperties.colors[side];
        const isSelected = flakture.selectedSide === side ? " is-selected" : "";
        if (flakture.controllingSides.includes(side)) {
            const button = flakture.createElem("button", {
                attributes: { "class": `control-bar-side-switch control-bar-side-switch-${side} is-${color}${isSelected}` },
                children: [name]
            });
            setupSelectedSideClick(flakture, button as HTMLButtonElement, side);
            return button;
        }
        return flakture.createElem("span", {
            attributes: { "class": `control-bar-side-display control-bar-side-display-${side} is-${color}`},
            children: [name]
        })
    }

    controlBarBottomElem.append(nameElement(Side.left));

    const undoButton = flakture.createElem("i", { attributes: { "class": "fa-solid fa-undo" }});
    setupUndo(flakture, undoButton);
    controlBarBottomElem.append(flakture.createElem("li", {
        attributes: {
            "class": "control-bar-adjust is-hidden"
        },
        children: [
            undoButton
        ]
    }));

    let speedElements: Element[] = [];
    flakture.ruleset.SPEEDS.forEach((speed, i) => {
        speedElements = speedElements.concat(speedRadioAndLabel(i, speed.icon));
    });
    controlBarBottomElem.append(flakture.createElem("li", {
        attributes: {"class": "control-bar-speed is-hidden"},
        children: speedElements
    }));
    const redeployButton = flakture.createElem("button", {
        attributes: {"class": "control-bar-redeploy is-hidden", "type": "button"},
        children: ["Redeploy (1)"]
    });
    setupClickRedeploy(flakture, redeployButton);
    const undoRedeployButton = flakture.createElem("button", {
        attributes: {"class": "control-bar-undo-redeploy is-hidden", "type": "button"},
        children: ["Undo Redeploy"]
    });
    setupClickUndoRedeploy(flakture, undoRedeployButton);
    controlBarBottomElem.append(flakture.createElem("li", {
        children: [undoRedeployButton, redeployButton]
    }));
    controlBarBottomElem.append(nameElement(Side.right));
}
