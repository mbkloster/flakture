import {Coord, CtfGameProperties, CtfGameState, Line, Piece, Ruleset, Side, Turn} from "common-types";
import Flakture from "components/flakture";
import {RULESETS} from "./ctf-defines";
import {distSqFromPoint} from "./utilities/board-utilities";

// ==========================================================================
export const redeployedPieceMap = (flakture: Flakture): Record<string, {x: number, y: number}> => {
    const deadPieceNameToPos: Record<string, {x: number, y: number}> = {};
    const turn = flakture.currentTurn();
    Object.entries(turn.moves).forEach(sideAndMove => {
        const [side, move] = sideAndMove;
        Object.entries(move?.redeployments || {}).forEach(orderAndRedeployment => {
            const [order, redeployment] = orderAndRedeployment;
            deadPieceNameToPos[`${side}${order}`] = redeployment;
        });
    });
    return deadPieceNameToPos;
}

// ==========================================================================
export const deriveDeadPieceCount = (pieces: Piece[], side: Side): number => {
    let count = 0;
    pieces.forEach(piece => {
        if (piece.side === side && piece.dead) {
            count++;
        }
    });
    return count;
}

// ==========================================================================
export const closestOnLineToPoint = (point: Coord, line: Line): Coord => {
    const n = (point.x - line.from.x) * (line.to.x - line.from.x) + (point.y - line.from.y) * (line.to.y - line.from.y);
    const d = Math.pow(line.to.x - line.from.x, 2) + Math.pow(line.to.y - line.from.y, 2);
    const t = Math.min(1, Math.max(0, n / d));
    // Q = A + t(B - A)
    return { x: line.from.x + t * (line.to.x - line.from.x), y: line.from.y + t * (line.to.y - line.from.y) };
}

// ==========================================================================
// Given we already know that (from) -> (to) collides at *exactly* (to), when does the collision actually begin?
export const firstCollisionPointOnLine = (coord: Coord, line: Line, withinPx: number): Coord => {
    const MAX_BISECTIONS = 5;
    let possibleMinT = 0, possibleMaxT = 1;
    const withinPxSq = withinPx * withinPx;
    for (let i = 0; i < MAX_BISECTIONS; i++) {
        let t = (possibleMinT + possibleMaxT) / 2;
        const potentialCollisionCoord = { x: line.from.x + t * (line.to.x - line.from.x), y: line.from.y + t * (line.to.y - line.from.y) };
        const distSq = Math.pow(coord.y - potentialCollisionCoord.y, 2) + Math.pow(coord.x - potentialCollisionCoord.x, 2);
        if (distSq <= withinPxSq) {
            possibleMaxT = t;
        } else {
            possibleMinT = t;
        }
    }
    const t = possibleMaxT;
    return { x: line.from.x + t * (line.to.x - line.from.x), y: line.from.y + t * (line.to.y - line.from.y) };
}

// ==========================================================================
export const orderNumber = (piece: Piece): number => {
    return parseInt(piece.name.replace(piece.side, ""));
}

// ==========================================================================
export const opponentSide = (side: Side): Side => {
    return side === Side.left ? Side.right : Side.left;
}

// ==========================================================================
const addRedeployLines = (ruleset: Ruleset, lines: Line[], startX: number, y: number, potentialBlockers: Piece[]) => {
    const {PIECE_R} = ruleset;
    const WIDTH_PER_TICK = (ruleset.BOARD_W / 2 - PIECE_R * 2) / (ruleset.REDEPLOY_TICK_COUNT - 1);
    const expandedR = (1 + ruleset.REDEPLOY_BLOCK_BUFFER_SHARE) * ruleset.PIECE_R;
    let lineStart: Coord | undefined;
    for (let i = 0; i < ruleset.REDEPLOY_TICK_COUNT; i++) {
        const tick = {x: startX + i * WIDTH_PER_TICK, y};
        let conflictFound = false;
        for (let j = 0; j < potentialBlockers.length; j++) {
            const potentialBlocker = potentialBlockers[j];
            if (potentialBlocker.x > tick.x + (PIECE_R + expandedR)) { break; }
            const distSqFromBlockerToPoint = Math.pow(potentialBlocker.y - tick.y, 2) + Math.pow(potentialBlocker.x - tick.x, 2);
            if (distSqFromBlockerToPoint <= (PIECE_R + expandedR) * (PIECE_R + expandedR)) {
                // Conflict!
                conflictFound = true;
                if (lineStart) {
                    const to = {x: startX + PIECE_R + (i - 1) * WIDTH_PER_TICK, y};
                    if (to.x !== lineStart.x) {
                        lines.push({from: lineStart, to});
                    }
                    lineStart = undefined;
                }
                break;
            }
        }
        if (!conflictFound) {
            lineStart ||= tick;
        }
        if (i >= ruleset.REDEPLOY_TICK_COUNT - 1 && lineStart) {
            // If we're at the end, try to fill out the start to whatever is left
            const to = {x: startX + PIECE_R + (i - 1) * WIDTH_PER_TICK, y};
            if (to.x !== lineStart.x) {
                lines.push({from: lineStart, to});
            }
        }
    }
}

// ==========================================================================
export const redeployLines = (gameProperties: CtfGameProperties, gameState: CtfGameState, turn: Turn, side: Side): Line[] => {
    let lines: Line[] = [];
    const ruleset = RULESETS[gameProperties.rulesetName];
    const { BOARD_W, BOARD_H, PIECE_R } = ruleset;
    const expandedR = (1 + ruleset.REDEPLOY_BLOCK_BUFFER_SHARE) * ruleset.PIECE_R;
    if (side === "left") {
        const potentialTopBlockers = gameState.pieces.filter(piece => piece.side === opponentSide(side) && piece.x <= BOARD_W / 2 && piece.y <= PIECE_R + expandedR).sort((pieceA, pieceB) => {
            return pieceA.x - pieceB.x;
        });
        const potentialBottomBlockers = gameState.pieces.filter(piece => piece.side === opponentSide(side) && piece.x <= BOARD_W / 2 && piece.y >= BOARD_H - (PIECE_R + expandedR)).sort((pieceA, pieceB) => {
            return pieceA.x - pieceB.x;
        });
        addRedeployLines(ruleset, lines, PIECE_R, PIECE_R, potentialTopBlockers);
        addRedeployLines(ruleset, lines, PIECE_R, BOARD_H - PIECE_R, potentialBottomBlockers);

    } else {
        const potentialTopBlockers = gameState.pieces.filter(piece => piece.side === opponentSide(side) && piece.x >= BOARD_W / 2 && piece.y <= PIECE_R + expandedR).sort((pieceA, pieceB) => {
            return pieceA.x - pieceB.x;
        });
        const potentialBottomBlockers = gameState.pieces.filter(piece => piece.side === opponentSide(side) && piece.x >= BOARD_W / 2 && piece.y >= BOARD_H - (PIECE_R + expandedR)).sort((pieceA, pieceB) => {
            return pieceA.x - pieceB.x;
        });
        addRedeployLines(ruleset, lines, BOARD_W / 2 + PIECE_R, PIECE_R, potentialTopBlockers);
        addRedeployLines(ruleset, lines, BOARD_W / 2 + PIECE_R, BOARD_H - PIECE_R, potentialBottomBlockers);
    }
    return lines;
}
