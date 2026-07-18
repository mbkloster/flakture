import { Side } from "common-types";
// ==========================================================================
export const newMove = () => {
    return {
        pieces: {},
        redeployments: {},
        willpowerBid: 0,
    };
};
// ==========================================================================
export const newTurn = (turnNumber, controllingSides) => {
    return {
        finishedAt: null,
        moves: {
            left: controllingSides.includes(Side.left) ? newMove() : null,
            right: controllingSides.includes(Side.right) ? newMove() : null,
        },
        moveSubmissionTimes: { [Side.left]: null, [Side.right]: null },
        startedAt: Date.now(),
        turnNumber: turnNumber
    };
};
//# sourceMappingURL=factories.js.map