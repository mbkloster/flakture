import {CtfGameState, PieceCodex, Side, Turn} from "common-types";
import {runTimeSlice, startGameMovement, stopGameMovement} from "ctf-state-transition";
import {derivePieceCodex} from "ctf-state-assembly";
import {RULESETS} from "ctf-defines";

const ruleset = RULESETS.AntiquatedAvian;

// ==========================================================================
describe("CTF State transition", function () {
    let ctfState: CtfGameState;
    let pieceCodex: PieceCodex;
    let aboutNow: number;

    beforeEach(() => {
        aboutNow = Date.now();
        ctfState = {
            "decidingTurnNumber": 2,
            "distance": {"left": 1600, "right": 1600},
            "flags": {"left": null, "right": null},
            "pieces": [
                {
                    "direction": "l", "name": "left0", "side": Side.left, "x": 600, "y": 210
                },
                {
                    "direction": "l", "name": "right0", "side": Side.right, "x": 500, "y": 190
                },
            ],
            "willpower": {"left": 20, "right": 20},
        };
        pieceCodex = derivePieceCodex(ctfState.pieces);
    });

    it("translates into being in motion", async () => {
        const leftDest = {"x": 330, "y": 200};
        const rightDest = {"x": 25, "y": 40};
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {"0": {destinations: [leftDest], speed: 0}}, redeployments: {}, willpowerBid: 0},
                right: {pieces: {"0": {destinations: [rightDest], speed: 0}}, redeployments: {}, willpowerBid: 0}
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const lefty = ctfState.pieces[0];
        const righty = ctfState.pieces[1];
        const leftDistance = Math.sqrt(Math.pow(lefty.y - leftDest.y, 2) + Math.pow(lefty.x - leftDest.x, 2));
        let rightDistance = Math.sqrt(Math.pow(righty.y - rightDest.y, 2) + Math.pow(righty.x - rightDest.x, 2));
        rightDistance += Math.sqrt(Math.pow(rightDest.y - rightDest.y, 2) + Math.pow(rightDest.x - rightDest.x, 2))
        const originalDistance = { ...ctfState.distance };
        const movement = startGameMovement(ruleset, ctfState, turn, pieceCodex);

        const originalLeft = { ...ctfState.pieces[0] };
        const originalRight = { ...ctfState.pieces[1] };

        // Try a single runTimeSlice
        runTimeSlice(ruleset, ctfState, movement, pieceCodex);
        expect(movement.pieces[0].x).not.toEqual(originalLeft.x);
        expect(movement.pieces[0].y).not.toEqual(originalLeft.y);
        expect(movement.pieces[1].x).not.toEqual(originalRight.x);
        expect(movement.pieces[1].y).not.toEqual(originalRight.y);

        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfState, movement, pieceCodex);
        }

        expect(movement.stillMovingPieces.size).toEqual(0);

        const newCtfState = stopGameMovement(ruleset, ctfState, movement, turn);

        expect(newCtfState.distance.left).toEqual(originalDistance.left - leftDistance + ruleset.DISTANCE_PER_TURN);
        // < since this piece goes far (adding the high-distance-cost marginal rates)
        expect(newCtfState.distance.right).toBeLessThan(originalDistance.right - rightDistance + ruleset.DISTANCE_PER_TURN);

        expect(newCtfState.decidingTurnNumber).toEqual(3);
        expect(newCtfState.pieces[0].x).toEqual(leftDest.x);
        expect(newCtfState.pieces[0].y).toEqual(leftDest.y);
        expect(newCtfState.pieces[1]!.x).toEqual(rightDest.x);
        expect(newCtfState.pieces[1]!.y).toEqual(rightDest.y);
        expect(newCtfState.willpower.left).toEqual(21);
        expect(newCtfState.willpower.right).toEqual(20);
    });

    it("blows away Right when Left has a higher willpower bid", async () => {
        const lefty = ctfState.pieces[pieceCodex.side.left[0]];
        const righty = ctfState.pieces[pieceCodex.side.right[0]];
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {"0": {destinations: [{x: righty.x, y: righty.y}], speed: 0}}, redeployments: {}, willpowerBid: 5},
                right: {pieces: {"0": {destinations: [{x: lefty.x, y: lefty.y}], speed: 0}}, redeployments: {}, willpowerBid: 1}
            },
            moveSubmissionTimes: { left: aboutNow + 2, right: aboutNow + 1 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfState, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfState, movement, pieceCodex);
        }
        expect(movement.finalized).toBeTruthy();
        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfState, movement, turn);
        const newLefty = newCtfState.pieces[pieceCodex.side.left[0]];
        const newRighty = newCtfState.pieces[pieceCodex.side.right[0]];
        expect(newLefty.dead).toBeFalsy();
        expect(newRighty.dead).toBeTruthy();
        expect(newCtfState.willpower.left).toEqual(15);
        expect(newCtfState.willpower.right).toEqual(22); // Also includes "out willpowered" bonus
    });

    it("blows away Left on a tie when collision occurs in Right's end", async () => {
        const lefty = ctfState.pieces[pieceCodex.side.left[0]];
        const righty = ctfState.pieces[pieceCodex.side.right[0]];
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {"0": {destinations: [{x: righty.x, y: righty.y}], speed: 0}}, redeployments: {}, willpowerBid: 3},
                // right backtracks, then moves forward, thus making the collision happen further right
                right: {pieces: {"0": {destinations: [{x: righty.x + 20, y: righty.y}, {x: lefty.x, y: lefty.y}], speed: 0}}, redeployments: {}, willpowerBid: 3}
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfState, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfState, movement, pieceCodex);
        }
        expect(movement.finalized).toBeTruthy();
        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfState, movement, turn);
        const newLefty = newCtfState.pieces[pieceCodex.side.left[0]];
        const newRighty = newCtfState.pieces[pieceCodex.side.right[0]];
        expect(newLefty.dead).toBeTruthy();
        expect(newRighty.dead).toBeFalsy();
        expect(newCtfState.willpower.left).toEqual(21);
        expect(newCtfState.willpower.right).toEqual(17);
    });

    it("grants Left some extra Willpower if Right outbids", async () => {
        const lefty = ctfState.pieces[pieceCodex.side.left[0]];
        const righty = ctfState.pieces[pieceCodex.side.right[0]];
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {"0": {destinations: [{x: lefty.x - 5, y: lefty.y - 5}], speed: 0}}, redeployments: {}, willpowerBid: 0},
                // right backtracks, then moves forward, thus making the collision happen further right
                right: {pieces: {"0": {destinations: [{x: righty.x + 10, y: righty.y + 10}], speed: 0}}, redeployments: {}, willpowerBid: 1}
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfState, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfState, movement, pieceCodex);
        }
        expect(movement.finalized).toBeTruthy();
        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfState, movement, turn);
        expect(newCtfState.willpower.left).toEqual(22);
        expect(newCtfState.willpower.right).toEqual(20);
    });

    it("blows away Right on a tie when collision occurs in Left's end", async () => {
        const lefty = ctfState.pieces[pieceCodex.side.left[0]];
        const righty = ctfState.pieces[pieceCodex.side.right[0]];
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {"0": {destinations: [{x: lefty.x - 15, y: lefty.y}, {x: righty.x, y: righty.y}], speed: 0}}, redeployments: {}, willpowerBid: 3},
                // right backtracks, then moves forward, thus making the collision happen further right
                right: {pieces: {"0": {destinations: [{x: lefty.x, y: lefty.y}], speed: 0}}, redeployments: {}, willpowerBid: 3}
            },
            moveSubmissionTimes: { left: aboutNow + 2, right: aboutNow + 1 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfState, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfState, movement, pieceCodex);
        }
        expect(movement.finalized).toBeTruthy();
        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfState, movement, turn);
        const newLefty = newCtfState.pieces[pieceCodex.side.left[0]];
        const newRighty = newCtfState.pieces[pieceCodex.side.right[0]];
        expect(newLefty.dead).toBeFalsy();
        expect(newRighty.dead).toBeTruthy();
        expect(newCtfState.willpower.left).toEqual(17);
        expect(newCtfState.willpower.right).toEqual(21);
    });

    it("blows away Right on a tie when collision at midpoint and Right has less distance", async () => {
        const lefty = ctfState.pieces[pieceCodex.side.left[0]];
        const righty = ctfState.pieces[pieceCodex.side.right[0]];
        const turn: Turn = {
            finishedAt: null,
            moves: {
                left: {pieces: {"0": {destinations: [{x: righty.x, y: righty.y}], speed: 0}}, redeployments: {}, willpowerBid: 3},
                // right backtracks, then moves forward, thus making the collision happen further right
                right: {pieces: {"0": {destinations: [{x: lefty.x, y: lefty.y}, {x: lefty.x - 10, y: lefty.y - 10}], speed: 0}}, redeployments: {}, willpowerBid: 3}
            },
            moveSubmissionTimes: { left: aboutNow + 1, right: aboutNow + 2 },
            startedAt: aboutNow,
            turnNumber: 1
        }

        const movement = startGameMovement(ruleset, ctfState, turn, pieceCodex);
        for (let i = 0; movement.stillMovingPieces.size && i < 1000; i++) {
            runTimeSlice(ruleset, ctfState, movement, pieceCodex);
        }
        expect(movement.finalized).toBeTruthy();
        expect(movement.stillMovingPieces.size).toEqual(0);
        const newCtfState = stopGameMovement(ruleset, ctfState, movement, turn);
        const newLefty = newCtfState.pieces[pieceCodex.side.left[0]];
        const newRighty = newCtfState.pieces[pieceCodex.side.right[0]];
        expect(newLefty.dead).toBeFalsy();
        expect(newRighty.dead).toBeTruthy();
        expect(newCtfState.willpower.left).toEqual(18);
        expect(newCtfState.willpower.right).toEqual(20);
    });
});