import { Coord, CtfGameProperties, CtfGameState, PieceCodex, Ruleset, Side, Turn } from "common-types";
export declare const deriveRenderRatio: (desiredW: number, desiredH: number, additionalW: number, additionalH: number) => number;
export declare const destinationConflictPoints: (gameProperties: CtfGameProperties, gameState: CtfGameState, turn: Turn, pieceCodex: PieceCodex) => {
    x: number;
    y: number;
    showForSide: Side;
}[];
export declare const flagEntryPoint: (ruleset: Ruleset, posA: Coord, posB: Coord, flagSide: Side) => Coord;
export declare const gameContextTurnText: (turn: Turn) => string;
//# sourceMappingURL=render-utilities.d.ts.map