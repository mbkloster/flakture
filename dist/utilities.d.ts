import { Coord, CtfGameProperties, CtfGameState, Line, Piece, Side, Turn } from "./common-types";
import Flakture from "components/flakture";
export declare const redeployedPieceMap: (flakture: Flakture) => Record<string, {
    x: number;
    y: number;
}>;
export declare const deriveDeadPieceCount: (pieces: Piece[], side: Side) => number;
export declare const closestOnLineToPoint: (point: Coord, line: Line) => Coord;
export declare const firstCollisionPointOnLine: (coord: Coord, line: Line, withinPx: number) => Coord;
export declare const orderNumber: (piece: Piece) => number;
export declare const opponentSide: (side: Side) => Side;
export declare const redeployLines: (gameProperties: CtfGameProperties, gameState: CtfGameState, turn: Turn, side: Side) => Line[];
//# sourceMappingURL=utilities.d.ts.map