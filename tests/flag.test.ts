import {Coord, CtfGameState, FlagState, LooseFlag, PieceCodex, Side, Turn} from "common-types";
import {runTimeSlice, startGameMovement, stopGameMovement} from "ctf-state-transition";
import {derivePieceCodex} from "ctf-state-assembly";
import {RULESETS} from "ctf-defines";
import {FLAG_CARRIER_DEATH_STATE, FLAG_CARRIER_DEATH_TURN} from "./presets/flag-carrier-death";

const ruleset = RULESETS.AntiquatedAvian;
const { BOARD_H, BOARD_W, FLAG_AREA_RADIUS, FLAG_AREA_THICKNESS, PIECE_R } = ruleset;

function isLooseFlag(flagState: FlagState): flagState is LooseFlag {
    if (!flagState) { return false; }
    return (flagState as Coord).x !== undefined;
}

// ==========================================================================
describe("CTF State flag transition", function () {
    let ctfStateFlagsUnheldPiecesEdges: CtfGameState;
    let ctfStateFlagsUnheldPiecesCenter: CtfGameState;
    let ctfStateFlagsHeld: CtfGameState;
    let ctfStateFlagsLoose: CtfGameState;
    let pieceCodex: PieceCodex;
    let aboutNow: number;

    beforeEach(() => {
        aboutNow = Date.now();
        ctfStateFlagsUnheldPiecesEdges = {
            "decidingTurnNumber": 2,
            "distance": {"left": 1600, "right": 1600},
            "flags": {"left": null, "right": null},
            "pieces": [
                {
                    "direction": "l", "name": "left0", "side": Side.left, "x": BOARD_W - PIECE_R - 120, "y": 95 + PIECE_R * 3
                },
                {
                    "direction": "l", "name": "right0", "side": Side.right, "x": PIECE_R + 120, "y": BOARD_H - 95
                },
                {
                    "direction": "l", "name": "left1", "side": Side.left, "x": PIECE_R + 20, "y": BOARD_H - 95 - PIECE_R * 3
                },
                {
                    "direction": "l", "name": "right1", "side": Side.right, "x": BOARD_W - PIECE_R - 20, "y": 95
                },
            ],
            "willpower": {"left": 20, "right": 20},
        };
        ctfStateFlagsUnheldPiecesCenter = { ...ctfStateFlagsUnheldPiecesEdges };
        ctfStateFlagsUnheldPiecesCenter.pieces[0].x = BOARD_W - FLAG_AREA_THICKNESS - FLAG_AREA_RADIUS - PIECE_R - 20;
        ctfStateFlagsUnheldPiecesCenter.pieces[0].y = BOARD_H / 2;
        ctfStateFlagsUnheldPiecesCenter.pieces[1].x = FLAG_AREA_THICKNESS + FLAG_AREA_RADIUS + PIECE_R + 20;
        ctfStateFlagsUnheldPiecesCenter.pieces[1].y = BOARD_H / 2;

        ctfStateFlagsHeld = {
            "decidingTurnNumber": 2,
            "distance": {"left": 1600, "right": 1600},
            "flags": {"left": 1, "right": 0},
            "pieces": [
                {
                    "direction": "l",
                    "name": "left0",
                    "side": Side.left,
                    "x": FLAG_AREA_THICKNESS + FLAG_AREA_RADIUS + PIECE_R + 40,
                    "y": BOARD_H / 2
                },
                {
                    "direction": "l",
                    "name": "right0",
                    "side": Side.right,
                    "x": BOARD_W - FLAG_AREA_THICKNESS - FLAG_AREA_RADIUS - PIECE_R - 40,
                    "y": BOARD_H / 2
                },
                {
                    "direction": "l",
                    "name": "left1",
                    "side": Side.left,
                    "x": BOARD_W - FLAG_AREA_THICKNESS - FLAG_AREA_RADIUS - PIECE_R - 1,
                    "y": BOARD_H / 2 + PIECE_R * 2 + 1
                },
                {
                    "direction": "l",
                    "name": "right1",
                    "side": Side.right,
                    "x": FLAG_AREA_THICKNESS + FLAG_AREA_RADIUS + PIECE_R + 1,
                    "y": BOARD_H / 2 - PIECE_R * 2 - 1
                },
            ],
            "willpower": {"left": 20, "right": 20},
        };
        ctfStateFlagsLoose = {
            "decidingTurnNumber": 3,
            "distance": {"left": 1600, "right": 1600},
            "flags": {"left": {x: 40, y: 40, untilDecidingTurnNumber: 4}, "right": {x: 140, y: 140, untilDecidingTurnNumber: 4}},
            "pieces": [
                {
                    "direction": "l",
                    "name": "left0",
                    "side": Side.left,
                    "x": 230,
                    "y": 230
                },
                {
                    "direction": "l",
                    "name": "right0",
                    "side": Side.right,
                    "x": 95,
                    "y": 95
                },
                {
                    "direction": "l",
                    "name": "left1",
                    "side": Side.left,
                    "x": 20,
                    "y": 190
                },
                {
                    "direction": "l",
                    "name": "right1",
                    "side": Side.right,
                    "x": 220,
                    "y": 190
                },
            ],
            "willpower": {"left": 20, "right": 20},
        };
        pieceCodex = derivePieceCodex(ctfStateFlagsUnheldPiecesEdges.pieces);
    });

    it("allows Left taking the flag from the edge", () => {
        const leftTaker = ctfStateFlagsUnheldPiecesEdges.pieces.find(piece => piece.name === "left0")!;
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {"0": {destinations: [{ x: ruleset.BOARD_W, y: leftTaker.y }], speed: 0}}, redeployments: {}, willpowerBid: 0},
                right: {pieces: {}, redeployments: {}, willpowerBid: 0}
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfStateFlagsUnheldPiecesEdges, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfStateFlagsUnheldPiecesEdges, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfStateFlagsUnheldPiecesEdges, movement, turn);
        expect(newCtfState.flags.right).toEqual(ctfStateFlagsUnheldPiecesEdges.pieces.findIndex(piece => piece.name === "left0"));
    });

    it("allows Right taking the flag from the edge", () => {
        const rightTaker = ctfStateFlagsUnheldPiecesEdges.pieces.find(piece => piece.name === "right0")!;
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {}, redeployments: {}, willpowerBid: 0},
                right: {pieces: {"0": {destinations: [{ x: 0, y: rightTaker.y }], speed: 0}}, redeployments: {}, willpowerBid: 0},
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfStateFlagsUnheldPiecesEdges, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfStateFlagsUnheldPiecesEdges, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfStateFlagsUnheldPiecesEdges, movement, turn);
        expect(newCtfState.flags.left).toEqual(ctfStateFlagsUnheldPiecesEdges.pieces.findIndex(piece => piece.name === "right0"));
    });

    it("allows Left taking the flag from the center", () => {
        const leftTaker = ctfStateFlagsUnheldPiecesCenter.pieces.find(piece => piece.name === "left0")!;
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {"0": {destinations: [{ x: BOARD_W - FLAG_AREA_THICKNESS - FLAG_AREA_RADIUS - PIECE_R + 2, y: leftTaker.y }], speed: 0}}, redeployments: {}, willpowerBid: 0},
                right: {pieces: {}, redeployments: {}, willpowerBid: 0}
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfStateFlagsUnheldPiecesCenter, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfStateFlagsUnheldPiecesEdges, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfStateFlagsUnheldPiecesEdges, movement, turn);
        expect(newCtfState.flags.right).toEqual(ctfStateFlagsUnheldPiecesEdges.pieces.findIndex(piece => piece.name === "left0"));
    });

    it("allows Right taking the flag from the center", () => {
        const rightTaker = ctfStateFlagsUnheldPiecesCenter.pieces.find(piece => piece.name === "right0")!;
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {}, redeployments: {}, willpowerBid: 0},
                right: {pieces: {"0": {destinations: [{ x: FLAG_AREA_THICKNESS + FLAG_AREA_RADIUS + PIECE_R - 2, y: rightTaker.y }], speed: 0}}, redeployments: {}, willpowerBid: 0},
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfStateFlagsUnheldPiecesCenter, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfStateFlagsUnheldPiecesEdges, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfStateFlagsUnheldPiecesEdges, movement, turn);
        expect(newCtfState.flags.left).toEqual(ctfStateFlagsUnheldPiecesEdges.pieces.findIndex(piece => piece.name === "right0"));
    });

    it("allows Left to capture the flag", () => {
        const leftHolder = ctfStateFlagsHeld.pieces[ctfStateFlagsHeld.flags.right as number]!;
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {"0": {destinations: [{ x: 0, y: leftHolder.y }], speed: 0}}, redeployments: {}, willpowerBid: 0},
                right: {pieces: {}, redeployments: {}, willpowerBid: 0}
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfStateFlagsHeld, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfStateFlagsHeld, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfStateFlagsHeld, movement, turn);
        expect(newCtfState.winner).toEqual(Side.left);
    });

    it("allows Right to capture the flag", () => {
        const leftHolder = ctfStateFlagsHeld.pieces[ctfStateFlagsHeld.flags.left as number]!;
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {}, redeployments: {}, willpowerBid: 0},
                right: {pieces: {"0": {destinations: [{ x: ruleset.BOARD_W, y: leftHolder.y }], speed: 0}}, redeployments: {}, willpowerBid: 0},
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfStateFlagsHeld, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfStateFlagsHeld, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfStateFlagsHeld, movement, turn);
        expect(newCtfState.winner).toEqual(Side.right);
    });

    it("kill the holder of the Left flag from a collision with a normie piece", () => {
        const leftHolderIndex = ctfStateFlagsHeld.flags.left as number;
        const leftHolder = ctfStateFlagsHeld.pieces[leftHolderIndex];
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {"1": { destinations: [{x: leftHolder.x, y: leftHolder.y}], speed: 0}}, redeployments: {}, willpowerBid: 0},
                right: {pieces: {}, redeployments: {}, willpowerBid: 0},
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfStateFlagsHeld, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfStateFlagsHeld, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfStateFlagsHeld, movement, turn);
        expect(newCtfState.winner).toBeUndefined();
        expect(newCtfState.pieces[leftHolderIndex].dead).toBeTruthy();
        expect(newCtfState.flags.left).toEqual({x: leftHolder.x, y: leftHolder.y, untilDecidingTurnNumber: 2 + ruleset.FLAG_LOOSE_TURNS});
    });

    it("kill the holder of the Right flag from a collision with a normie piece", () => {
        const rightHolderIndex = ctfStateFlagsHeld.flags.right as number;
        const rightHolder = ctfStateFlagsHeld.pieces[rightHolderIndex];
        const turn: Turn = {
            finishedAt: null,
            moves: {
                right: {pieces: {"1": { destinations: [{x: rightHolder.x, y: rightHolder.y}], speed: 0}}, redeployments: {}, willpowerBid: 0},
                left: {pieces: {}, redeployments: {}, willpowerBid: 0},
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfStateFlagsHeld, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfStateFlagsHeld, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfStateFlagsHeld, movement, turn);
        expect(newCtfState.winner).toBeUndefined();
        expect(newCtfState.pieces[rightHolderIndex].dead).toBeTruthy();
        expect(newCtfState.flags.right).toEqual({x: rightHolder.x, y: rightHolder.y, untilDecidingTurnNumber: 2 + ruleset.FLAG_LOOSE_TURNS});
    });

    it("allows Left to retake Right's flag", () => {
        const rightFlag = ctfStateFlagsLoose.flags.right as LooseFlag;
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {"0": { destinations: [{x: rightFlag.x, y: rightFlag.y}], speed: 0}}, redeployments: {}, willpowerBid: 0},
                right: {pieces: {}, redeployments: {}, willpowerBid: 0},
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfStateFlagsLoose, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfStateFlagsLoose, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfStateFlagsLoose, movement, turn);
        expect(newCtfState.flags.right).toEqual(0);
    });

    it("allows Left to retake Right's flag via hitting the flag are", () => {
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {"0": { destinations: [{x: ruleset.BOARD_W, y: ruleset.BOARD_H}], speed: 0}}, redeployments: {}, willpowerBid: 0},
                right: {pieces: {}, redeployments: {}, willpowerBid: 0},
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfStateFlagsLoose, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfStateFlagsLoose, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfStateFlagsLoose, movement, turn);
        expect(newCtfState.flags.right).toEqual(0);
    });

    it("returns both flags if neither side tries to re-grab", () => {
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {}, redeployments: {}, willpowerBid: 0},
                right: {pieces: {}, redeployments: {}, willpowerBid: 0},
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfStateFlagsLoose, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfStateFlagsLoose, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfStateFlagsLoose, movement, turn);
        expect(newCtfState.decidingTurnNumber).toEqual(4);
        expect(newCtfState.flags.left).toEqual(null);
        expect(newCtfState.flags.right).toEqual(null);
    });

    it("does not end up with a flag carrier being a dead piece", () => {
        const turn: Turn = FLAG_CARRIER_DEATH_TURN;
        pieceCodex = derivePieceCodex(FLAG_CARRIER_DEATH_STATE.pieces);

        const movement = startGameMovement(ruleset, FLAG_CARRIER_DEATH_STATE, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, FLAG_CARRIER_DEATH_STATE, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfStateFlagsLoose, movement, turn);
        if (newCtfState.flags.left !== null && !isLooseFlag(newCtfState.flags.left)) {
            const flagPiece = newCtfState.pieces[newCtfState.flags.left];
            expect(flagPiece.dead).toBeFalsy();
        }
        if (newCtfState.flags.right !== null && !isLooseFlag(newCtfState.flags.right)) {
            const flagPiece = newCtfState.pieces[newCtfState.flags.right];
            expect(flagPiece.dead).toBeFalsy();
        }
    });
});