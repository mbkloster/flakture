import { distSqFromPoint } from "./utilities/board-utilities";
import { renderControlBar } from "./render/flakture/control-bar";
import { renderRedeployPoint } from "./render/flakture/board";
import { redeployedPieceMap } from "./utilities";
import { renderWillpowerBidPopup } from "./render/flakture/willpower-bid-popup";
// ==========================================================================
export const setupBoardHoverAndClick = (flakture) => {
    // Hover
    flakture.svg.addEventListener("mousemove", event => {
        if (flakture.gameState.winner) {
            return;
        } // Can't select a piece when the game is already won
        const mouseEvent = event;
        const point = {
            x: mouseEvent.offsetX / flakture.renderRatio,
            y: mouseEvent.offsetY / flakture.renderRatio
        };
        if (flakture.redeploying) {
            flakture.setRedeployPoint(point);
            renderRedeployPoint(flakture);
            return;
        }
        const radiusSq = flakture.ruleset.PIECE_R * flakture.ruleset.PIECE_R;
        const redeployedPieceNameToPos = redeployedPieceMap(flakture);
        const foundMatch = flakture.gameState.pieces.find((piece, i) => {
            const pos = piece.dead ? redeployedPieceNameToPos[piece.name] : piece;
            if (flakture.controllingSides.includes(piece.side) && pos && distSqFromPoint(pos, point) <= radiusSq) {
                flakture.updateHoveredPiece(i);
                return true;
            }
        });
        if (!foundMatch) {
            flakture.updateHoveredPiece(null);
        }
    });
    // Click
    flakture.svg.addEventListener("click", event => {
        if (flakture.gameState.winner) {
            return;
        } // Can't select a piece when the game is already won
        const mouseEvent = event;
        const point = {
            x: mouseEvent.offsetX / flakture.renderRatio,
            y: mouseEvent.offsetY / flakture.renderRatio
        };
        if (flakture.redeploying) {
            flakture.setRedeployPoint(point);
            flakture.finishRedeploy();
            return;
        }
        const radiusSq = flakture.ruleset.PIECE_R * flakture.ruleset.PIECE_R;
        const redeployedPieceNameToPos = redeployedPieceMap(flakture);
        const foundMatch = flakture.gameState.pieces.find((piece, i) => {
            const pos = piece.dead ? redeployedPieceNameToPos[piece.name] : piece;
            if (flakture.controllingSides.includes(piece.side) && pos && distSqFromPoint(pos, point) <= radiusSq) {
                flakture.updateSelectedPiece(i);
                return true;
            }
        });
        if (!foundMatch) {
            flakture.appendSelectedPieceDestination(point);
        }
    });
};
// ==========================================================================
export const setupClickConfirm = (flakture, button) => {
    button.addEventListener("click", () => {
        flakture.selectedSide = button.getAttribute("data-side");
        renderWillpowerBidPopup(flakture);
    });
};
// ==========================================================================
export const setupClickRedeploy = (flakture, button) => {
    button.addEventListener("click", event => {
        event.preventDefault();
        flakture.setRedeploying(!flakture.redeploying);
    });
};
// ==========================================================================
export const setupClickSpeedChange = (flakture, radio) => {
    radio.addEventListener("change", event => {
        const { selectedPieceIndex } = flakture;
        if (selectedPieceIndex === null) {
            return;
        }
        const target = event.target;
        const selectedPiece = flakture.gameState.pieces[selectedPieceIndex];
        const { name, side } = selectedPiece;
        const orderNumber = parseInt(name.replace(side, ""));
        const currentTurn = flakture.currentTurn();
        if (currentTurn.moves[side].pieces[orderNumber]) {
            currentTurn.moves[side].pieces[orderNumber].speed = parseInt(target.getAttribute("value"));
        }
        renderControlBar(flakture);
    });
};
// ==========================================================================
export const setupClickUndoRedeploy = (flakture, button) => {
    button.addEventListener("click", event => {
        event.preventDefault();
        flakture.popRedeployment();
    });
};
// ==========================================================================
export const setupSelectedSideClick = (flakture, elem, side) => {
    elem.addEventListener("click", event => {
        event.preventDefault();
        flakture.selectedSide = side;
        renderControlBar(flakture);
    });
};
// ==========================================================================
export const setupUndo = (flakture, undoElement) => {
    undoElement.addEventListener("click", () => {
        flakture.removeDestination();
    });
};
//# sourceMappingURL=event-handlers.js.map