import ApplicationComponent from "components/application-component";
import { Coord, CtfGameMovement, CtfGameProperties, CtfGameState, Formation, Line, PieceCodex, Ruleset, Side, SideMove, Turn } from "common-types";
type ComponentProperties = {
    controllingSides: Side[];
    formations: Record<Side, Formation>;
    gameProperties: CtfGameProperties;
    imagePaths: Record<string, string>;
    initialTurnNumber: number;
};
export default class Flakture extends ApplicationComponent {
    conflictPoints: {
        x: number;
        y: number;
        showForSide: Side;
    }[];
    controllingSides: Side[];
    elapseTimeAfter: number;
    gameProperties: CtfGameProperties;
    gameMovement?: CtfGameMovement;
    gameState: CtfGameState;
    hoveredPieceIndex: null | number;
    imagePaths: Record<string, string>;
    layers: SVGElement[];
    pieceCodex: PieceCodex;
    redeploying: boolean;
    redeployedPieces: {
        side: Side;
        order: number;
    }[];
    redeployLines: Line[];
    redeployPoint: Coord;
    renderRatio: number;
    ruleset: Ruleset;
    selectedSide: Side | null;
    selectedPieceIndex: null | number;
    svg: SVGElement;
    timeTicker: number;
    turns: Record<number, Turn>;
    turnNumber: number;
    constructor(containingElem: Element, props: ComponentProperties);
    confirmMove(willpowerBid: number): void;
    runTimeSlice(dSeconds: number): void;
    appendSelectedPieceDestination(coords: {
        x: number;
        y: number;
    }): void;
    currentTurn(): Turn;
    finishRedeploy(): void;
    redeployedCount(): number;
    kickstartIntoMotion: () => void;
    netRedeployableCount(): number;
    popRedeployment: () => void;
    removeDestination(): void;
    setRedeployedPieces(): void;
    setRedeploying(redeploying: boolean): void;
    setRedeployPoint(point: Coord): void;
    setTurnMove(side: Side, move: SideMove, submitted: boolean): void;
    updateHoveredPiece(hoveredPieceIndex: null | number): void;
    updateSelectedPiece(selectedPieceIndex: null | number): void;
}
export {};
//# sourceMappingURL=flakture.d.ts.map