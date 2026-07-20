import { CtfGameMovement, CtfGameState, PieceCodex, Ruleset, Side, SideMove, TimeSliceMeta, Turn } from "./common-types";
export declare const distanceCost: (ruleset: Ruleset, ctfGameState: CtfGameState, moves: Record<Side, SideMove | null>, pieceCodex: PieceCodex) => Record<Side, number>;
export declare const piecesCollide: (ruleset: Ruleset, pieceA: {
    x: number;
    y: number;
}, pieceB: {
    x: number;
    y: number;
}) => boolean;
export declare const runTimeSlice: (ruleset: Ruleset, ctfGameState: CtfGameState, movement: CtfGameMovement, pieceCodex: PieceCodex) => TimeSliceMeta;
export declare const startGameMovement: (ruleset: Ruleset, ctfGameState: CtfGameState, turn: Turn, pieceCodex: PieceCodex) => CtfGameMovement;
export declare const stopGameMovement: (ruleset: Ruleset, ctfGameState: CtfGameState, movement: CtfGameMovement, finishedTurn: Turn) => CtfGameState;
//# sourceMappingURL=ctf-state-transition.d.ts.map