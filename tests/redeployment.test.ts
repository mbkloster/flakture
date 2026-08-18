import {CtfGameState, LooseFlag, PieceCodex, Side, Turn} from "common-types";
import {runTimeSlice, startGameMovement, stopGameMovement} from "ctf-state-transition";
import {derivePieceCodex} from "ctf-state-assembly";
import {RULESETS} from "ctf-defines";

const ruleset = RULESETS.AntiquatedAvian;
const { BOARD_H, BOARD_W, FLAG_AREA_RADIUS, FLAG_AREA_THICKNESS, PIECE_R } = ruleset;

// ==========================================================================
describe("CTF State redeployment", function () {
    let ctfState: CtfGameState;
    let aboutNow: number;
    let pieceCodex: PieceCodex

    beforeEach(() => {
        aboutNow = Date.now();
        ctfState = {
            "decidingTurnNumber": 2,
            "distance": {"left": 1800, "right": 1800},
            "flags": {"left": null, "right": null},
            "pieces": [
                {
                    "direction": "l", "name": "left0", "side": Side.left, "x": BOARD_W/2 - 50, "y": 50
                },
                {
                    "direction": "l", "name": "right0", "side": Side.right, "x": BOARD_W/2 + 50, "y": 50
                },
                {
                    "direction": "l", "name": "left1", "side": Side.left, "x": 69, "y": 60, dead: true
                },
                {
                    "direction": "l", "name": "right1", "side": Side.right, "x": 60, "y": 60, dead: true
                },
            ],
            "willpower": {"left": 20, "right": 20},
        };
        pieceCodex = derivePieceCodex(ctfState.pieces);
    });

    it("allows Left to redeploy, and kill Right", () => {
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {
                    pieces: {"1": {destinations: [{x: 50, y: 90}], speed: 0}},
                    redeployments: {"1": {x: PIECE_R, y: 140}},
                    willpowerBid: 0
                },
                right: {
                    pieces: {"0": {destinations: [{x: 50, y: 90}, {x: 50, y: 130}], speed: 1}},
                    redeployments: {},
                    willpowerBid: 0
                }
            },
            moveSubmissionTimes: { left: aboutNow + 3, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfState, turn, pieceCodex);
        const movementLeft1 = movement.pieces[ctfState.pieces.findIndex(piece => piece.name === "left1")];
        expect(movementLeft1.dead).toBeFalsy();
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfState, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfState, movement, turn);
        const newLeft1 = newCtfState.pieces.find(piece => piece.name === "left1")!;
        expect(newLeft1.x).toEqual(50);
        expect(newLeft1.y).toEqual(90);
        expect(newLeft1.dead).toBeFalsy();
        expect(newCtfState.willpower.left).toEqual(19);
        expect(newCtfState.willpower.right).toEqual(21);

        const newRight0 = newCtfState.pieces.find(piece => piece.name === "right0")!;
        expect(newRight0.dead).toBeTruthy();
    });
});