import { Side } from "../common-types";
// ==========================================================================
export const circlesCollide = (circleA, radiusA, circleB, radiusB, debug) => {
    if (circleA.x < circleB.x - radiusA - radiusB || circleA.x > circleB.x + radiusA + radiusB) {
        return false;
    }
    if (circleA.y < circleB.y - radiusA - radiusB || circleA.y > circleB.y + radiusA + radiusB) {
        return false;
    }
    const distSq = Math.pow(circleA.y - circleB.y, 2) + Math.pow(circleA.x - circleB.x, 2);
    return distSq <= Math.pow(radiusA + radiusB, 2);
};
// ==========================================================================
export const distSqFromPoint = (pointA, pointB) => {
    return Math.pow(pointA.y - pointB.y, 2) + Math.pow(pointA.x - pointB.x, 2);
};
// ==========================================================================
export const inFlagZone = (ruleset, flagSide, piece) => {
    const { BOARD_H, BOARD_W, FLAG_AREA_RADIUS, FLAG_AREA_THICKNESS, PIECE_R } = ruleset;
    if (flagSide === Side.right) {
        if (piece.x > BOARD_W - FLAG_AREA_THICKNESS - PIECE_R) {
            return true;
        }
        return circlesCollide(piece, PIECE_R, { x: BOARD_W - FLAG_AREA_THICKNESS, y: BOARD_H / 2 }, FLAG_AREA_RADIUS);
    }
    if (piece.x < FLAG_AREA_THICKNESS + PIECE_R) {
        return true;
    }
    return circlesCollide(piece, PIECE_R, { x: FLAG_AREA_THICKNESS, y: BOARD_H / 2 }, FLAG_AREA_RADIUS);
};
//# sourceMappingURL=board-utilities.js.map