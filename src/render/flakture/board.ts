import {
    COLORS,
    CONFLICT_POINT_RADIUS,
    FLAG_DISPLAY_H,
    FLAG_DISPLAY_W, FLAG_ENTRY_WIDTH,
    FONTS,
    GAME_CONTEXT_FRONT_OPACITY,
    HALO_BUFFER,
    REDEPLOY_OPACITY,
    REDEPLOY_POINT_RADIUS,
    THICKNESS_HOVER,
    THICKNESS_SELECT,
    WILLPOWER_BID_INITIAL_PADDING
} from "ctf-render-defines";
import {
    BothSides,
    Coord,
    CtfGameMovement,
    CtfGameState,
    FlagState,
    LooseFlag,
    PieceMove,
    Ruleset,
    Side
} from "common-types";
import Flakture from "components/flakture";
import {opponentSide, redeployedPieceMap} from "utilities";
import {flagEntryPoint, gameContextTurnText} from "utilities/render-utilities";
import {inFlagZone} from "utilities/board-utilities";

// ==========================================================================
function isLooseFlag(flagState: FlagState): flagState is LooseFlag {
    if (!flagState) { return false; }
    return (flagState as Coord).x !== undefined;
}

// ==========================================================================
const flagCenter = (ruleset: Ruleset, side: Side, gameState: CtfGameState, movement?: CtfGameMovement): Coord => {
    const flag = movement ? movement.flags[side] : gameState.flags[side];
    const { FLAG_AREA_THICKNESS, FLAG_AREA_RADIUS } = ruleset;
    if (flag === null) {
        return {
            x: side === Side.left ? FLAG_AREA_THICKNESS + FLAG_AREA_RADIUS / 2 : ruleset.BOARD_W - FLAG_AREA_THICKNESS - FLAG_AREA_RADIUS / 2,
            y: ruleset.BOARD_H / 2
        };
    } else if (isLooseFlag(flag)) {
        return {x: flag.x, y: flag.y};
    }
    const holdingPiece = movement?.pieces[flag as number] || gameState.pieces[flag as number];
    return {x: holdingPiece.x, y: holdingPiece.y - ruleset.PIECE_R * 0.8};
}

// ==========================================================================
const flagLooseCircleProps = (center: Coord, loose: boolean): { looseCircleCx: string, looseCircleCy: string } => {
    const looseCircleC = loose ? center : {x: -9999, y: -9999};
    return {
        looseCircleCx: looseCircleC.x.toString(),
        looseCircleCy: looseCircleC.y.toString(),
    }
}

// ==========================================================================
const willpowerBidTextRenderPos = (flakture: Flakture, side: Side) => {
    const { ruleset, renderRatio } = flakture;
    const x = side === Side.left
            ? ((ruleset.BOARD_W / 2 - WILLPOWER_BID_INITIAL_PADDING) * renderRatio)
            : ((ruleset.BOARD_W / 2 + WILLPOWER_BID_INITIAL_PADDING) * renderRatio);
    return { x, y: (ruleset.BOARD_H / 2) * renderRatio}
}

// ==========================================================================
export const renderDestinations = (flakture: Flakture) => {
    const { renderRatio } = flakture;
    const turn = flakture.currentTurn();
    const movementPieces = flakture.gameMovement?.pieces;
    flakture.ensureElemRemoved("dest-line");
    flakture.ensureElemRemoved("dest-flag-entry");
    let sidesToShow: Side[] = [];
    if (flakture.currentTurn().moveSubmissionTimes.left && flakture.currentTurn().moveSubmissionTimes.right) {
        sidesToShow = BothSides;
    } else if (flakture.selectedSide) {
        sidesToShow = [flakture.selectedSide];
    }
    sidesToShow.forEach(side => {
        Object.entries(turn.moves[side]?.pieces || {}).forEach(orderNumberAndMove => {
            const [orderNumber, move] = orderNumberAndMove;
            const pieceIndex = flakture.pieceCodex.name[`${side}${orderNumber}`];
            const piece = flakture.gameState.pieces[pieceIndex];
            const movementPiece = movementPieces ? movementPieces[pieceIndex] : null;

            if (movementPiece) {
                if (!movementPiece.dead) {
                    renderDestinationForPiece(flakture, pieceIndex, movementPiece, move);
                }
            } else if (piece.dead) {
                const redeployedPiece = redeployedPieceMap(flakture)[piece.name];
                if (redeployedPiece) {
                    renderDestinationForPiece(flakture, pieceIndex, redeployedPiece, move);
                }
            } else {
                renderDestinationForPiece(flakture, pieceIndex, piece, move);
            }
        });
    });

    // Conflict points
    flakture.ensureElemRemoved("conflict-point");
    flakture.conflictPoints.filter(pt => pt.showForSide === flakture.selectedSide).forEach(point => {
        flakture.createElem("g", {
            appendTo: flakture.svg,
            attributes: {"class": "conflict-point"},
            children: [
                flakture.createElem("line", {
                    attributes: {
                        stroke: COLORS.destinationLine,
                        "stroke-width": "2",
                        x1: ((point.x - CONFLICT_POINT_RADIUS) * renderRatio).toString(),
                        y1: ((point.y - CONFLICT_POINT_RADIUS) * renderRatio).toString(),
                        x2: ((point.x + CONFLICT_POINT_RADIUS) * renderRatio).toString(),
                        y2: ((point.y + CONFLICT_POINT_RADIUS) * renderRatio).toString(),
                    },
                    isSvg: true
                }),
                flakture.createElem("line", {
                    attributes: {
                        stroke: COLORS.destinationLine,
                        "stroke-width": "2",
                        x1: ((point.x + CONFLICT_POINT_RADIUS) * renderRatio).toString(),
                        y1: ((point.y - CONFLICT_POINT_RADIUS) * renderRatio).toString(),
                        x2: ((point.x - CONFLICT_POINT_RADIUS) * renderRatio).toString(),
                        y2: ((point.y + CONFLICT_POINT_RADIUS) * renderRatio).toString(),
                    },
                    isSvg: true
                })
            ],
            isSvg: true,
        })
    });
}

// ==========================================================================
// Used in two places so that we can render both standard and redeployed pieces
const renderDestinationForPiece = (flakture: Flakture, pieceIndex: number, pieceStart: Coord, move: PieceMove) => {
    let previousPoint: { x: number, y: number } = pieceStart;
    const { renderRatio } = flakture;
    let enteredFlagArea = false;
    const side = flakture.gameState.pieces[pieceIndex].side;
    move.destinations.forEach(destPoint => {
        flakture.ensureElem(`dest-line dest-${pieceIndex} dest-${pieceIndex}-${destPoint.x}-${destPoint.y}`, 'line', {
            appendTo: flakture.svg,
            attributes: {
                x1: (previousPoint.x * renderRatio).toString(),
                y1: (previousPoint.y * renderRatio).toString(),
                x2: (destPoint.x * renderRatio).toString(),
                y2: (destPoint.y * renderRatio).toString(),
                stroke: COLORS.destinationLine,
            }, isSvg: true
        });
        if (!enteredFlagArea) {
            const targetFlagZone = pieceIndex === flakture.gameState.flags[opponentSide(side)] ? side : opponentSide(side);
            if (inFlagZone(flakture.ruleset, targetFlagZone, destPoint)) {
                const entryPoint = flagEntryPoint(flakture.ruleset, previousPoint, destPoint, targetFlagZone);
                flakture.createSvgElem("rect", {
                    appendTo: flakture.svg,
                    attributes: {
                        "class": "dest-flag-entry",
                        fill: COLORS.destinationLine,
                        x: ((entryPoint.x - FLAG_ENTRY_WIDTH / 2) * renderRatio).toString(),
                        y: ((entryPoint.y - FLAG_ENTRY_WIDTH / 2) * renderRatio).toString(),
                        width: (FLAG_ENTRY_WIDTH * renderRatio).toString(),
                        height: (FLAG_ENTRY_WIDTH * renderRatio).toString(),
                    }
                });
                enteredFlagArea = true;
            }
        }
        previousPoint = destPoint;
    });
}

// ==========================================================================
export const renderHoveredPiece = (flakture: Flakture) => {
    const { renderRatio, ruleset } = flakture;
    if (flakture.hoveredPieceIndex === null) {
        flakture.ensureElemRemoved("hovered-piece-halo");
    } else {
        const hoveredPiece = flakture.gameState.pieces[flakture.hoveredPieceIndex];
        // redeployed piece pos takes precedent
        const pos = redeployedPieceMap(flakture)[hoveredPiece.name] || hoveredPiece;
        flakture.ensureElem("hovered-piece-halo", "circle", {
            appendTo: flakture.svg,
            attributes: {
                cx: (pos.x * renderRatio).toString(),
                cy: (pos.y * renderRatio).toString(),
                r: ((ruleset.PIECE_R + HALO_BUFFER) * renderRatio).toString(),
                stroke: COLORS.hover,
                "stroke-width": THICKNESS_HOVER.toString(),
                fill: "transparent"
            }, isSvg: true
        });
    }
}

// ==========================================================================
export const renderInitialBoard = (flakture: Flakture) => {
    const {gameProperties, layers, renderRatio, ruleset} = flakture;
    const {BOARD_H, BOARD_W} = ruleset;

    // Patterns
    flakture.createSvgElem("defs", {
        appendTo: flakture.svg,
        children: [
            flakture.createSvgElem("pattern", {
                attributes: {
                    id: "gameBackground",
                    width: "100",
                    height: "100",
                    patternUnits: "userSpaceOnUse"
                }, children: [
                    flakture.createSvgElem("rect", {attributes: {fill: "none", width: "100", height: "100"}}),
                    flakture.createSvgElem("image", {attributes: {x: "0", y: "0", href: flakture.imagePaths["grass"], width: "100", height: "100"}}),
                ]
            })
        ]
    })

    // Main rect
    flakture.createSvgElem("rect", {
        appendTo: layers[0],
        attributes: {
            fill: "url(#gameBackground)",
            x: "0",
            y: "0",
            width: (BOARD_W * renderRatio).toString(),
            height: (BOARD_H * renderRatio).toString()
        },
    });
    // Loose flag circles
    BothSides.forEach(side => {
        const center = flagCenter(ruleset, side, flakture.gameState);
        const flagProps = flagLooseCircleProps(center, isLooseFlag(flakture.gameState.flags[side]));
        flakture.createSvgElem("circle", {
            appendTo: layers[1],
            attributes: {
                "class": `flag-loose-circle-${ side }`,
                cx: flagProps.looseCircleCx,
                cy: flagProps.looseCircleCy,
                r: (ruleset.FLAG_R * renderRatio).toString(),
                fill: COLORS.looseFlags[flakture.gameProperties.colors[side]]
            },
        });
    });
    // Middle line
    flakture.createSvgElem("line", {
        appendTo: layers[1],
        attributes: {
            "class": "middle-line",
            x1: (BOARD_W * 0.5 * renderRatio).toString(),
            y1: "0",
            x2: (BOARD_W * 0.5 * renderRatio).toString(),
            y2: (BOARD_H * renderRatio).toString(),
            stroke: COLORS.middleLine,
        }
    });
    // Game context behind
    flakture.createSvgElem("text", {
        appendTo: layers[2],
        attributes: {
            "class": "game-context game-context-behind game-context-turn-number",
            fill: COLORS.gameContext,
            style: `font: ${FONTS.gameContextTimeless.size * renderRatio}px ${FONTS.gameContextTimeless.face }; font-weight: bold`,
            "text-anchor": "middle",
            x: (BOARD_W * 0.5 * renderRatio).toString(),
            y: (BOARD_H * 0.5 * renderRatio).toString(),
        }, children: [gameContextTurnText(flakture.currentTurn())]
    });
    BothSides.forEach(side => {
        const boardWShare = side === Side.left ? 0.25 : 0.75;
        flakture.createSvgElem("text", {
            appendTo: layers[2],
            attributes: {
                "class": "game-context game-context-behind",
                fill: COLORS.gameContextNames[gameProperties.colors[side]],
                style: `font: ${FONTS.gameContextNames.size * renderRatio}px ${FONTS.gameContextNames.face }; font-weight: bold`,
                "text-anchor": "middle",
                x: (BOARD_W * boardWShare * renderRatio).toString(),
                y: (BOARD_H * 0.5 * renderRatio).toString(),
            }, children: [gameProperties.names[side]]
        });
    });

    // Flag areas
    BothSides.forEach(side => {
        const x = (side === Side.left ? 0 : BOARD_W - ruleset.FLAG_AREA_THICKNESS);
        const circleX = (side === Side.left ? ruleset.FLAG_AREA_THICKNESS : BOARD_W - ruleset.FLAG_AREA_THICKNESS);
        flakture.createSvgElem("rect", {
            appendTo: layers[2],
            attributes: {
                "class": `flag-area-rect-${ side }`,
                x: (x * renderRatio).toString(),
                y: "0",
                width: (ruleset.FLAG_AREA_THICKNESS * renderRatio).toString(),
                height: (BOARD_H * renderRatio).toString(),
                fill: COLORS.flagBackground[flakture.gameProperties.colors[side]]
            }
        });
        flakture.createSvgElem("circle", {
            appendTo: layers[2],
            attributes: {
                "class": `flag-area-circle-${ side }`,
                cx: (circleX * renderRatio).toString(),
                cy: (BOARD_H * 0.5).toString(),
                r: (ruleset.FLAG_AREA_RADIUS * renderRatio).toString(),
                fill: COLORS.flagBackground[flakture.gameProperties.colors[side]]
            }
        });
    });

    const pieceGroup = flakture.createSvgElem("g", {
        appendTo: layers[3],
        attributes: {
            "class": "pieces"
        }
    });

    flakture.gameState.pieces.forEach((piece, i) => {
        const pieceG = flakture.createSvgElem("g", {
            appendTo: pieceGroup,
            attributes: {
                "class": `piece-g-${ piece.name }`,
                transform: `translate(${piece.x},${piece.y})`
            }
        });

        flakture.createSvgElem("image", {
            appendTo: pieceG,
            attributes: {
                "class": `piece-g-body-${ piece.name }`,
                href: flakture.imagePaths["piece"],
                x: (-ruleset.PIECE_R * renderRatio).toString(),
                y: (-ruleset.PIECE_R * renderRatio).toString(),
                width: (renderRatio * ruleset.PIECE_R * 2).toString(),
                height: (renderRatio * ruleset.PIECE_R * 2).toString(),
            }
        });
        flakture.createSvgElem("image", {
            appendTo: pieceG,
            attributes: {
                "class": `piece-g-shirt-${ piece.name }`,
                href: flakture.imagePaths[`shirt-${gameProperties.colors[piece.side]}`],
                x: (-ruleset.PIECE_R * renderRatio).toString(),
                y: (-ruleset.PIECE_R * renderRatio).toString(),
                width: (renderRatio * ruleset.PIECE_R * 2).toString(),
                height: (renderRatio * ruleset.PIECE_R * 2).toString(),
            }
        });
        flakture.createSvgElem("image", {
            appendTo: pieceG,
            attributes: {
                "class": `piece-g-eyes-${piece.name}`,
                href: flakture.imagePaths[`eyes-${piece.direction}`],
                x: (-ruleset.PIECE_R * renderRatio).toString(),
                y: (-ruleset.PIECE_R * renderRatio).toString(),
                width: (renderRatio * ruleset.PIECE_R * 2).toString(),
                height: (renderRatio * ruleset.PIECE_R * 2).toString(),
            }
        });
    });

    // Flags
    BothSides.forEach(side => {
        const center = flagCenter(ruleset, side, flakture.gameState);
        flakture.createSvgElem("image", {
            appendTo: layers[3],
            attributes: {
                "class": `flag-image-${side}`,
                href: flakture.imagePaths[`flag-${gameProperties.colors[side]}-${side}`],
                x: (renderRatio * (center.x - FLAG_DISPLAY_W / 2)).toString(),
                y: (renderRatio * (center.y - FLAG_DISPLAY_H / 2)).toString()
            },
        });
    });
    // Game context front
    flakture.createSvgElem("text", {
        appendTo: layers[4],
        attributes: {
            "class": "game-context game-context-front game-context-turn-number",
            fill: COLORS.gameContext,
            opacity: GAME_CONTEXT_FRONT_OPACITY.toString(),
            style: `font: ${FONTS.gameContextTimeless.size * renderRatio}px ${FONTS.gameContextTimeless.face }; font-weight: bold`,
            "text-anchor": "middle",
            x: (BOARD_W * 0.5 * renderRatio).toString(),
            y: (BOARD_H * 0.5 * renderRatio).toString(),
        }, children: [gameContextTurnText(flakture.currentTurn())]
    });
}

// ==========================================================================
export const renderMovedPieces = (flakture: Flakture) => {
    const { renderRatio, ruleset, gameMovement, gameState } = flakture;
    if (!gameMovement) {
        return;
    }
    Object.entries(gameMovement.pieces).forEach(indexAndPieceMove => {
        const [i, pieceMove] = indexAndPieceMove;
        const gameStatePiece = gameState.pieces[parseInt(i)];
        const pieceG = flakture.elem(`piece-g-${ gameStatePiece.name }`);
        if (pieceMove.dead) {
            pieceG.setAttribute("opacity", pieceMove.opacity.toString());
        } else {
            pieceG.setAttribute("transform", `translate(${pieceMove.x * renderRatio},${pieceMove.y * renderRatio})`)
        }
        flakture.elem(`piece-g-eyes-${gameStatePiece.name}`).setAttribute("href", flakture.imagePaths[`eyes-${gameStatePiece.direction}`],)
    });
    BothSides.forEach(side => {
        if ((gameMovement.flags[side] || gameState.flags[side]) !== null) {
            rerenderFlag(flakture, side);
        }
    });
    renderDestinations(flakture);
}

// ==========================================================================
export const renderRedeployedPieces = (flakture: Flakture) => {
    const redeployedPieceNameToPos = redeployedPieceMap(flakture);
    Object.entries(redeployedPieceNameToPos).forEach(nameAndPos => {
        const [name, pos] = nameAndPos;
        const pieceCircle = flakture.elem(`piece-g-${name}`);
        const opacity = flakture.gameMovement ? 1.0 : REDEPLOY_OPACITY;
        pieceCircle.setAttribute("opacity", opacity.toString());
        pieceCircle.setAttribute("transform", `translate(${pos.x},${pos.y})`)
    });
}

// ==========================================================================
export const renderRedeployPoint = (flakture: Flakture) => {
    if (!flakture.redeploying  || !flakture.selectedSide) {
        flakture.ensureElemRemoved("redeploy-point");
        return;
    }
    const { renderRatio } = flakture;
    flakture.ensureElem("redeploy-point", "circle", {
        appendTo: flakture.svg,
        attributes: { cx: (flakture.redeployPoint.x * renderRatio).toString(), cy: (flakture.redeployPoint.y * renderRatio).toString(), fill: COLORS.redeployLine, r: (REDEPLOY_POINT_RADIUS * renderRatio).toString() },
        isSvg: true
    })
}

// ==========================================================================
export const renderRedeployLine = (flakture: Flakture) => {
    if (!flakture.redeploying  || !flakture.selectedSide) {
        flakture.ensureElemRemoved("redeploy-line");
        return;
    }
    const { renderRatio } = flakture;
    flakture.redeployLines.forEach(line => {
        flakture.createElem("line", {
            appendTo: flakture.svg,
            attributes: {
                "class": "redeploy-line",
                x1: (line.from.x * renderRatio).toString(),
                y1: (line.from.y * renderRatio).toString(),
                x2: (line.to.x * renderRatio).toString(),
                y2: (line.to.y * renderRatio).toString(),
                stroke: COLORS.redeployLine
            },
            isSvg: true
        })
    });
}

// ==========================================================================
export const renderSelectedPiece = (flakture: Flakture) => {
    const { renderRatio } = flakture;
    if (flakture.selectedPieceIndex === null) {
        flakture.ensureElemRemoved("selected-piece-halo");
    } else {
        const selectedPiece = flakture.gameState.pieces[flakture.selectedPieceIndex];
        // redeployed piece pos takes precedent
        const pos = redeployedPieceMap(flakture)[selectedPiece.name] || selectedPiece;
        flakture.ensureElem("selected-piece-halo", "circle", {
            appendTo: flakture.svg,
            attributes: {
                cx: (pos.x * renderRatio).toString(),
                cy: (pos.y * renderRatio).toString(),
                r: ((flakture.ruleset.PIECE_R + HALO_BUFFER) * renderRatio).toString(),
                stroke: COLORS.select,
                "stroke-width": THICKNESS_SELECT.toString(),
                fill: "transparent"
            }, isSvg: true
        });
    }
}

// ==========================================================================
export const renderWillpowerBids = (flakture: Flakture) => {
    const {gameProperties, renderRatio} = flakture;
    BothSides.forEach(side => {
        const renderPos = willpowerBidTextRenderPos(flakture, side);
        if (flakture.elemExists(`willpower-bid-text-${side}`)) {
            const willpowerBidElem = flakture.elem(`willpower-bid-text-${side}`);
            willpowerBidElem.setAttribute("x", renderPos.x.toString());
            willpowerBidElem.setAttribute("y", renderPos.y.toString());
            return;
        }
        flakture.createElem("text", {
            appendTo: flakture.svg,
            attributes: {
                "class": `willpower-bid-text willpower-bid-text-${side}`,
                opacity: "0",
                style: `font: ${FONTS.willpowerBid.size * renderRatio}px ${FONTS.willpowerBid.face }; font-weight: bold; pointer-events: none;`,
                x: renderPos.x.toString(),
                y: renderPos.y.toString(),
                stroke: COLORS.willpowerBidOutline[gameProperties.colors[side]],
                fill: COLORS.willpowerBid[gameProperties.colors[side]],
                "text-anchor": "middle",
            }, children: ["0"], isSvg: true
        });
    });
}

// ==========================================================================
export const renderWillpowerBidOpacities = (flakture: Flakture, opacity: number) => {
    const elems = flakture.containingElem.getElementsByClassName("willpower-bid-text");
    for (let i = 0; i < elems.length; i++) {
        elems[i].setAttribute("opacity", opacity.toString());
    }
}

// ==========================================================================
export const rerenderFlag = (flakture: Flakture, side: Side) => {
    const { ruleset, gameState, gameMovement, renderRatio } = flakture;
    const center = flagCenter(ruleset, side, gameState, gameMovement);
    const flagProps = flagLooseCircleProps(center, isLooseFlag(gameMovement?.flags[side] || gameState.flags[side]));
    const flagElem = flakture.elem(`flag-image-${side}`);
    flagElem.setAttribute("x", (renderRatio * (center.x - FLAG_DISPLAY_W / 2)).toString());
    flagElem.setAttribute("y", (renderRatio * (center.y - FLAG_DISPLAY_H / 2)).toString());
    const looseCircle = flakture.elem(`flag-loose-circle-${side}`);
    looseCircle.setAttribute("cx", flagProps.looseCircleCx);
    looseCircle.setAttribute("cy", flagProps.looseCircleCy);
}

// ==========================================================================
export const rerenderGameContextTurn = (flakture: Flakture) => {
    const turn = flakture.currentTurn();
    const turnElems = flakture.svg.getElementsByClassName("game-context-turn-number");
    for (let i = 0; i < turnElems.length; i++) {
        turnElems[i].innerHTML = gameContextTurnText(turn);
    }
}

// ==========================================================================
export const rerenderWillpowerBids = (flakture: Flakture) => {
    const turn = flakture.currentTurn();
    flakture.elem("willpower-bid-text-left").innerHTML = turn.moves.left!.willpowerBid.toString();
    flakture.elem("willpower-bid-text-right").innerHTML = turn.moves.right!.willpowerBid.toString();
}