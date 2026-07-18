import {assembleCtfState, evenPieceDistributionToFormation} from "ctf-state-assembly";
import {Side} from "common-types";
import {RULESETS} from "ctf-defines";

const ruleset = RULESETS.AntiquatedAvian;
const { PIECE_PER_SIDE } = ruleset;

// ==========================================================================
describe("CTF State assembly", function () {
    it("assembles a valid formation or two, then a valid state", async () => {
        const formation1 = evenPieceDistributionToFormation({
            1: 3,
            0.8: 5,
            0.5: 4,
            0.2: 6
        }, ruleset);
        const xPoses1 = Object.values(formation1).map(entry => entry.x).sort((x, y) => y - x);
        expect(xPoses1).toEqual([
            531, 531, 531, 426, 426, 426, 426, 426, 426, 268.5, 268.5, 268.5, 268.5, 268.5, 111, 111, 111, 111, 111, 111, 111
        ]);

        const formation2 = evenPieceDistributionToFormation({
            1: 10,
            0.8: 3,
            0.4: 3,
            0: 5
        }, ruleset);
        const xPoses2 = Object.values(formation2).map(entry => entry.x).sort((x, y) => y - x);
        expect(xPoses2).toEqual([
            531, 531, 531, 531, 531, 531, 531, 531, 531, 531, 426, 426, 426, 216, 216, 216, 6, 6, 6, 6, 6
        ]);

        const ctfState = assembleCtfState(ruleset, {[Side.left]: formation1, [Side.right]: formation2});
        expect(ctfState.pieces).toHaveLength(PIECE_PER_SIDE * 2);
        expect(ctfState.willpower.left).toEqual(ruleset.WILLPOWER_INITIAL);
        expect(ctfState.willpower.right).toEqual(ruleset.WILLPOWER_INITIAL);

        const leftPieceNames = new Set(ctfState.pieces.filter(piece => piece.side === Side.left).map(piece => piece.name));
        const rightPieceNames = new Set(ctfState.pieces.filter(piece => piece.side === Side.right).map(piece => piece.name));
        expect (leftPieceNames.size).toEqual(PIECE_PER_SIDE);
        expect (rightPieceNames.size).toEqual(PIECE_PER_SIDE);
    });
});