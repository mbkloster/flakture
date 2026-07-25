export enum PlayerColor {
    blue = "blue",
    red = "red",
}

export enum Side {
    left = "left",
    right = "right",
}
export const BothSides = [Side.left, Side.right];

export type Coord = { x: number, y: number };

export type Line = {from: Coord, to: Coord};

export type Piece = {
    dead?: boolean
    direction: "l" | "r"
    name: string
    side: Side
    x: number
    y: number
}

export type EvenPieceDistribution = Record<number, number>;
export type Formation = Record<number, Coord>

export type LooseFlag = {untilDecidingTurnNumber: number, x: number, y: number};
export type FlagState = null | LooseFlag | number;

export type CtfGameProperties = {
    aiAssignments: Partial<Record<Side, string>>
    colors: Record<Side, PlayerColor>
    names: Record<Side, string>
    rulesetName: RulesetName
}

export type CtfGameMovement = {
    distanceTraveled: Record<Side, number>
    finalized: boolean
    flags: Record<Side, FlagState>
    pieces: Record<number, {direction: "l" | "r", speed: number, x: number, y: number, dead: boolean, opacity: number, destinations: {x: number, y: number}[]}>
    stillMovingPieces: Set<number>
    willpowerBid: Record<Side, number>
    willpowerUsed: Set<Side>
    winner?: Side
}

export type CtfGameState = {
    decidingTurnNumber: number
    distance: Record<Side, number>
    flags: Record<Side, FlagState>
    pieces: Piece[]
    willpower: Record<Side, number>
    winner?: Side
}

export type PieceCodex = {
    name: Record<string, number>
    side: Record<Side, number[]>
}

export type RulesetName = "AntiquatedAvian";

export type Ruleset = {
    BOARD_H: number
    BOARD_W: number

    DISTANCE_INITIAL: number
    DISTANCE_MAX: number
    DISTANCE_PER_TURN: number
    DISTANCE_USED_RECOUP_SHARE_FIRST_TURN: number

    DISTRIBUTION_DEFAULT: Record<number, number>

    FADE_PER_S: number

    FLAG_AREA_THICKNESS: number
    FLAG_AREA_RADIUS: number
    FLAG_LOOSE_TURNS: number
    FLAG_R: number

    PIECE_DIST_HIGH_COST_MULTIPLIER: number
    PIECE_DIST_HIGH_COST_THRESHOLD: number
    PIECE_PER_SIDE: number
    PIECE_R: number

    REDEPLOY_BLOCK_BUFFER_SHARE: number
    REDEPLOY_TICK_COUNT: number

    SPEEDS: {label: string, speedPerS: number, cost: number, icon: string}[]

    TIME_SLICE_S: number

    UNUSABLE_SPACE_WIDTH: number

    WILLPOWER_INITIAL: number
    WILLPOWER_PER_INITIATIVE: number
    WILLPOWER_TO_RESURRECT: number
}

export type PieceMove = {destinations: {x: number, y: number}[], speed: number};

export type SideMove = {
    pieces: Record<number, PieceMove>
    redeployments: Record<number, {x: number, y: number}>
    willpowerBid: number
};

export type TimeSliceMeta = {
    collisions: {left: Coord, right: Coord, winner: Side, deductedWillpower: boolean, flagCarriers: number}[],
    willpowerUsed: Set<Side>
}

export type Turn = {
    finishedAt: null | number
    moves: Record<Side, null | SideMove>
    moveSubmissionTimes: Record<Side, null | number>
    startedAt: number
    turnNumber: number
}
