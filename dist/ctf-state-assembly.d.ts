import { CtfGameState, EvenPieceDistribution, Formation, Piece, PieceCodex, Ruleset, Side } from "./common-types";
export declare const assembleCtfState: (ruleset: Ruleset, formations: Record<Side, Formation>) => CtfGameState;
export declare const derivePieceCodex: (pieces: Piece[]) => PieceCodex;
export declare const evenPieceDistributionToFormation: (evenPieceDistribution: EvenPieceDistribution, ruleset: Ruleset) => Formation;
//# sourceMappingURL=ctf-state-assembly.d.ts.map