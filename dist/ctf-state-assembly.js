import { Side } from "./common-types";
import { distributeValuesIntoSlots } from "./utilities/data-utilities";
// ==========================================================================
export const assembleCtfState = (ruleset, formations) => {
    const pieces = [];
    for (let i = 0; i < ruleset.PIECE_PER_SIDE; i++) {
        const leftFormationPiece = formations.left[i];
        pieces.push({
            direction: "r",
            name: `left${i}`,
            side: Side.left,
            x: leftFormationPiece.x,
            y: leftFormationPiece.y
        });
        const rightFormationPiece = formations.right[i];
        pieces.push({
            direction: "l",
            name: `right${i}`,
            side: Side.right,
            x: ruleset.BOARD_W - rightFormationPiece.x,
            y: rightFormationPiece.y
        });
    }
    return {
        decidingTurnNumber: 0,
        distance: {
            [Side.left]: ruleset.DISTANCE_INITIAL,
            [Side.right]: ruleset.DISTANCE_INITIAL,
        },
        flags: {
            [Side.left]: null,
            [Side.right]: null,
        },
        pieces: pieces,
        willpower: {
            [Side.left]: ruleset.WILLPOWER_INITIAL,
            [Side.right]: ruleset.WILLPOWER_INITIAL,
        },
    };
};
// ==========================================================================
export const derivePieceCodex = (pieces) => {
    const bySide = { left: [], right: [] };
    const byName = {};
    for (let i = 0; i < pieces.length; i++) {
        const piece = pieces[i];
        bySide[piece.side].push(i);
        byName[piece.name] = i;
    }
    return {
        name: byName,
        side: bySide
    };
};
// ==========================================================================
export const evenPieceDistributionToFormation = (evenPieceDistribution, ruleset) => {
    const spotDistribution = distributeValuesIntoSlots(evenPieceDistribution, ruleset.PIECE_PER_SIDE);
    const minWidth = ruleset.FLAG_AREA_THICKNESS;
    const maxWidth = ruleset.BOARD_W / 2 - ruleset.UNUSABLE_SPACE_WIDTH - ruleset.PIECE_R;
    let orderNumber = 0;
    const formation = {};
    Object.entries(spotDistribution).forEach(spotAndPieces => {
        const [slot, pieceCount] = spotAndPieces;
        const x = minWidth + (maxWidth - minWidth) * parseFloat(slot);
        const yIncrement = ruleset.BOARD_H / (pieceCount + 1);
        let y = 0;
        for (let i = 0; i < pieceCount; i++) {
            y += yIncrement;
            formation[orderNumber] = {
                x, y
            };
            orderNumber++;
        }
    });
    return formation;
};
//# sourceMappingURL=ctf-state-assembly.js.map