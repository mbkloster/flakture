import {BothSides, Coord, CtfGameProperties, CtfGameState, PieceCodex, Ruleset, Side, Turn} from "common-types";
import {ordinalSuffix} from "utilities/number-utilities";
import {closestOnLineToPoint, firstCollisionPointOnLine, opponentSide} from "utilities";
import {RULESETS} from "../ctf-defines";
import {circlesCollide} from "./board-utilities";

// ==========================================================================
export const deriveRenderRatio = (desiredW: number, desiredH: number, additionalW: number, additionalH: number): number => {
  const vw = document.documentElement.clientWidth || 0;
  const vh = document.documentElement.clientHeight || 0;

  if (vw >= (desiredW + additionalW) && vh >= (desiredH + additionalH)) {
    return 1;
  } else {
    const wRatio = (vw - additionalW) / (desiredW - additionalW);
    const hRatio = (vh - additionalH) / (desiredH - additionalH);
    return Math.min(wRatio, hRatio, 1);
  }
}

// ==========================================================================
export const destinationConflictPoints = (gameProperties: CtfGameProperties, gameState: CtfGameState, turn: Turn, pieceCodex: PieceCodex): {x: number, y: number, showForSide: Side}[] => {
  const conflictPoints: {x: number, y: number, showForSide: Side}[] = [];
  const ruleset = RULESETS[gameProperties.rulesetName];
  BothSides.forEach(side => {
    const move = turn.moves[side] || {pieces: {}};
    const opponentPieceIndexes = pieceCodex.side[opponentSide(side)];
    Object.entries(move.pieces).forEach(orderAndPieceMove => {
      const [order, pieceMove] = orderAndPieceMove;
      const piece = gameState.pieces[pieceCodex.name[`${side}${order}`]];
      let prevPoint: Coord = piece;
      pieceMove.destinations.forEach(destination => {
        const line = {from: prevPoint, to: destination};
        opponentPieceIndexes.forEach(opponentPieceIndex => {
          const opponentPiece = gameState.pieces[opponentPieceIndex];
          if (!opponentPiece.dead) {
            const closestPoint = closestOnLineToPoint(opponentPiece, line);
            const pieceDistSq = Math.pow(closestPoint.y - opponentPiece.y, 2) + Math.pow(closestPoint.x - opponentPiece.x, 2);
            if (pieceDistSq < ruleset.PIECE_R * ruleset.PIECE_R * 4) {
              conflictPoints.push(
                  { ...firstCollisionPointOnLine(opponentPiece, {from: prevPoint, to: closestPoint}, ruleset.PIECE_R), showForSide: side}
              );
            }
          }
        });
        prevPoint = destination;
      });
    });
  });
  return conflictPoints;
}

// ==========================================================================
export const flagEntryPoint = (ruleset: Ruleset, posA: Coord, posB: Coord, flagSide: Side): Coord => {
  const {BOARD_H, BOARD_W, FLAG_AREA_RADIUS, FLAG_AREA_THICKNESS, PIECE_R} = ruleset;
  const m = (posB.y - posA.y) / (posB.x - posA.x);
  const c = posA.y - (m * posA.x);
  const possiblePoints: Coord[] = [];

  if (flagSide === Side.right) {
    if (posB.x > BOARD_W - FLAG_AREA_THICKNESS - PIECE_R) {
      // add to possiblePoints (here and elsewhere that "returns")
      possiblePoints.push({x: BOARD_W - FLAG_AREA_THICKNESS - PIECE_R, y: c + m*(BOARD_W - FLAG_AREA_THICKNESS - PIECE_R)})
    }
    if (circlesCollide(posB, PIECE_R, {x: BOARD_W - FLAG_AREA_THICKNESS, y: BOARD_H / 2}, FLAG_AREA_RADIUS)) {
      possiblePoints.push(firstCollisionPointOnLine({x: BOARD_W - FLAG_AREA_THICKNESS, y: BOARD_H / 2}, {from: posA, to: posB}, FLAG_AREA_RADIUS));
    }
    if (possiblePoints.length > 1 && possiblePoints[1].x < possiblePoints[0].x) {
      return possiblePoints[1]
    }
    return possiblePoints[0];
  } else {
    if (posB.x < FLAG_AREA_THICKNESS + PIECE_R) {
      possiblePoints.push({x: FLAG_AREA_THICKNESS + PIECE_R, y: c + m*(FLAG_AREA_THICKNESS + PIECE_R)})
    }
    if (circlesCollide(posB, PIECE_R, {x: FLAG_AREA_THICKNESS, y: BOARD_H / 2}, FLAG_AREA_RADIUS)) {
      possiblePoints.push(firstCollisionPointOnLine({x: FLAG_AREA_THICKNESS, y: BOARD_H / 2}, {from: posA, to: posB}, FLAG_AREA_RADIUS));
    }
    if (possiblePoints.length > 1 && possiblePoints[1].x > possiblePoints[0].x) {
      return possiblePoints[1];
    }
    return possiblePoints[0];
  }
}

// ==========================================================================
export const gameContextTurnText = (turn: Turn) => {
  if (turn.turnNumber === 0) {
    return "Setup";
  }
  return `${turn.turnNumber}${ordinalSuffix(turn.turnNumber)}`
}
