import ApplicationComponent from "components/application-component";
import { assembleCtfState, derivePieceCodex } from "ctf-state-assembly";
import { BothSides } from "../common-types";
import { renderDestinations, renderHoveredPiece, renderInitialBoard, renderMovedPieces, renderRedeployedPieces, renderRedeployLine, renderRedeployPoint, renderSelectedPiece, renderWillpowerBidOpacities, renderWillpowerBids, rerenderFlag, rerenderGameContextTurn, rerenderWillpowerBids } from "render/flakture/board";
import { clearRenderedDestinations, clearDestinationsAndHideControls, deriveDistanceFillProps, renderControlBar, renderDistanceFill, renderDistanceLine, renderInitialControlBar, sideConfirmedIcon } from "render/flakture/control-bar";
import { setupBoardHoverAndClick } from "event-handlers";
import { RULESETS } from "ctf-defines";
import { newTurn } from "factories";
import { distanceCost, runTimeSlice, startGameMovement, stopGameMovement } from "ctf-state-transition";
import { deriveDeadPieceCount, opponentSide, orderNumber, redeployLines } from "utilities";
import { ConflictingInstructionsException, RuleViolationException } from "utilities/exceptions";
import { destinationConflictPoints } from "utilities/render-utilities";
import { COLORS, EQUAL_BID_COLLISION_DELAY_S, PRE_KICKOFF_DELAY_S, WILLPOWER_BID_FADE_IN_S, WILLPOWER_BID_OPACITY_MAX } from "ctf-render-defines";
import { WillpowerBidOpacityFade } from "animations/willpower-bid-opacity-fade";
import { WillpowerBidCollisionTravel } from "animations/willpower-bid-collision-travel";
import { WillpowerBidPlacementTravel } from "animations/willpower-bid-placement-travel";
import { InlineText } from "animations/inline-text";
import { Notification } from "animations/notification";
export default class Flakture extends ApplicationComponent {
    // ==========================================================================
    constructor(containingElem, props) {
        super(containingElem, props);
        // ==========================================================================
        this.kickstartIntoMotion = () => {
            clearDestinationsAndHideControls(this);
            this.gameMovement = startGameMovement(this.ruleset, this.gameState, this.currentTurn(), this.pieceCodex);
            this.hoveredPieceIndex = null;
            this.selectedPieceIndex = null;
            if (this.controllingSides.length !== 1) {
                this.selectedSide = null;
            }
            const placementTravelAnimation = new WillpowerBidPlacementTravel(this);
            this.elapseTimeAfter = Date.now() + (placementTravelAnimation.durationS + PRE_KICKOFF_DELAY_S + WILLPOWER_BID_FADE_IN_S) * 1000;
            this.addAnimation(new WillpowerBidOpacityFade(this, 0, WILLPOWER_BID_OPACITY_MAX));
            setTimeout(() => {
                this.addAnimation(placementTravelAnimation);
            }, WILLPOWER_BID_FADE_IN_S * 1000);
            rerenderWillpowerBids(this);
            renderControlBar(this);
            renderRedeployedPieces(this);
            renderHoveredPiece(this);
            renderSelectedPiece(this);
            renderDestinations(this);
        };
        // ==========================================================================
        this.popRedeployment = () => {
            if (!this.selectedSide) {
                throw new ConflictingInstructionsException("Cannot pop redeploy with no selectedSide");
            }
            let foundMatch = false;
            for (let i = this.redeployedPieces.length - 1; i >= 0; i--) {
                const redeployedPiece = this.redeployedPieces[i];
                if (redeployedPiece.side === this.selectedSide) {
                    this.redeployedPieces.splice(i, 1);
                    const turn = this.currentTurn();
                    delete turn.moves[this.selectedSide].redeployments[redeployedPiece.order];
                    this.elem(`piece-g-${redeployedPiece.side}${redeployedPiece.order}`).setAttribute("opacity", "0");
                    foundMatch = true;
                    if (this.selectedPieceIndex && this.gameState.pieces[this.selectedPieceIndex].name === `${this.selectedSide}${redeployedPiece.order}`) {
                        this.selectedPieceIndex = null;
                        this.hoveredPieceIndex = null;
                    }
                    break;
                }
            }
            if (!foundMatch) {
                throw new ConflictingInstructionsException(`Side ${this.selectedSide} doesn't have redeployments`);
            }
            renderRedeployedPieces(this);
            renderHoveredPiece(this);
            renderSelectedPiece(this);
            renderControlBar(this);
            renderDestinations(this);
        };
        containingElem.innerHTML = "";
        this.conflictPoints = [];
        this.controllingSides = props.controllingSides;
        this.elapseTimeAfter = 0;
        this.selectedSide = this.controllingSides[0];
        this.gameProperties = props.gameProperties;
        this.ruleset = RULESETS[props.gameProperties.rulesetName];
        this.gameState = assembleCtfState(this.ruleset, props.formations);
        this.imagePaths = props.imagePaths;
        this.pieceCodex = derivePieceCodex(this.gameState.pieces);
        this.hoveredPieceIndex = null;
        this.redeployedPieces = [];
        this.renderRatio = 1.0;
        this.selectedPieceIndex = null;
        this.turnNumber = props.initialTurnNumber;
        this.turns = {
            [props.initialTurnNumber]: newTurn(props.initialTurnNumber, this.controllingSides)
        };
        this.redeploying = false;
        this.redeployLines = [];
        this.redeployPoint = { x: -1000, y: -1000 };
        this.timeTicker = 0;
        const event = new CustomEvent('newTurn', {
            detail: {
                gameProperties: this.gameProperties,
                gameState: this.gameState,
                turn: this.currentTurn(),
                turnNumber: this.turnNumber,
                initial: true
            },
            bubbles: true, // Allow the event to bubble up the DOM
            cancelable: true
        });
        this.containingElem.dispatchEvent(event);
        // Renders
        const { renderRatio, ruleset } = this;
        const { BOARD_W, BOARD_H } = ruleset;
        this.svg = this.createSvgElem("svg", {
            appendTo: this.containingElem,
            attributes: {
                "width": (BOARD_W * renderRatio).toString(),
                "height": (BOARD_H * renderRatio).toString(),
            }
        });
        this.layers = [];
        for (let i = 0; i <= 5; i++) {
            this.layers.push(this.createSvgElem("g", { appendTo: this.svg, attributes: { "class": `layer${i}` } }));
        }
        renderInitialBoard(this);
        //this.containingElem.setAttribute("style", `width: ${ this.svg.getAttribute("width") }px; height: ${ this.svg.getAttribute("height") }px;`)
        renderInitialControlBar(this);
        // Event handlers
        setupBoardHoverAndClick(this);
        renderWillpowerBids(this);
        containingElem.classList.add("is-ready");
    }
    // ==========================================================================
    confirmMove(willpowerBid) {
        var _a;
        const turn = this.currentTurn();
        const side = this.selectedSide;
        turn.moves[side].willpowerBid = willpowerBid;
        (_a = turn.moveSubmissionTimes)[side] || (_a[side] = Date.now());
        this.elem(`control-bar-confirmer-${side}`).replaceChildren(sideConfirmedIcon(this, side));
        if (turn.moveSubmissionTimes.left && turn.moveSubmissionTimes.right) {
            this.kickstartIntoMotion();
        }
    }
    // ==========================================================================
    runTimeSlice(dSeconds) {
        var _a, _b;
        super.runTimeSlice(dSeconds);
        const { ruleset } = this;
        if (Date.now() >= this.elapseTimeAfter) {
            this.timeTicker += dSeconds;
            if (this.timeTicker >= ruleset.TIME_SLICE_S) {
                if (this.gameMovement) {
                    const meta = runTimeSlice(this.ruleset, this.gameState, this.gameMovement, this.pieceCodex);
                    const firstImportantCollision = meta.collisions.find(col => col.deductedWillpower || col.flagCarriers);
                    if (firstImportantCollision) {
                        const collision = firstImportantCollision;
                        const winningSide = collision.winner;
                        let resultText;
                        const winningBid = this.currentTurn().moves[winningSide].willpowerBid;
                        const losingBid = this.currentTurn().moves[opponentSide(winningSide)].willpowerBid;
                        if (collision.flagCarriers >= 2) {
                            resultText = "Carrier vs. carrier!";
                        }
                        else if (collision.flagCarriers === 1) {
                            resultText = "RIP carrier";
                        }
                        else if (winningBid > losingBid) {
                            resultText = `${this.gameProperties.names[winningSide]} outbids!`;
                        }
                        else {
                            resultText = "Defense prevails!";
                        }
                        const textColor = COLORS.inlineText[this.gameProperties.colors[winningSide]];
                        const outlineColor = COLORS.inlineTextOutline[this.gameProperties.colors[winningSide]];
                        const inlineTextAnimation = new InlineText(this, resultText, textColor, outlineColor, (collision.left.x + collision.right.x) / 2, (collision.left.y + collision.right.y) / 2, 0.1, 1, 0.4);
                        let beforeTextDelay = EQUAL_BID_COLLISION_DELAY_S;
                        if (winningBid > losingBid && collision.flagCarriers % 2 !== 1) {
                            const willpowerBidTravelAnimation = new WillpowerBidCollisionTravel(this, collision, winningSide, this.currentTurn().moves[winningSide].willpowerBid);
                            beforeTextDelay = willpowerBidTravelAnimation.travelTimeS;
                            this.addAnimation(willpowerBidTravelAnimation);
                        }
                        this.elapseTimeAfter = Date.now() + beforeTextDelay * 1000 + inlineTextAnimation.totalTimeS() * 1000;
                        setTimeout(() => {
                            this.addAnimation(inlineTextAnimation);
                        }, beforeTextDelay * 1000);
                    }
                    renderMovedPieces(this);
                    if (this.gameMovement.finalized) {
                        if (this.gameMovement.winner) {
                            const color = COLORS.notification[this.gameProperties.colors[this.gameMovement.winner]];
                            let text = "Winner!";
                            if (this.controllingSides.length === 1) {
                                if (this.controllingSides.includes(this.gameMovement.winner)) {
                                    text = "Victory!";
                                }
                                else {
                                    text = "DEFEAT!";
                                }
                            }
                            else {
                                text = `${this.gameProperties.names[this.gameMovement.winner]} wins!`;
                            }
                            this.addAnimation(new Notification(this, text, color, "#000", 1, 5, 5));
                        }
                        const oldTurn = this.turns[this.turnNumber];
                        oldTurn.finishedAt || (oldTurn.finishedAt = Date.now());
                        this.turnNumber++;
                        this.gameState = stopGameMovement(this.ruleset, this.gameState, this.gameMovement, oldTurn);
                        (_a = this.turns)[_b = this.turnNumber] || (_a[_b] = newTurn(this.turnNumber, this.controllingSides));
                        const event = new CustomEvent('newTurn', {
                            detail: {
                                gameProperties: this.gameProperties,
                                gameState: this.gameState,
                                turn: this.currentTurn(),
                                turnNumber: this.turnNumber,
                                initial: true
                            },
                            bubbles: true, // Allow the event to bubble up the DOM
                            cancelable: true
                        });
                        this.containingElem.dispatchEvent(event);
                        this.ensureElemRemoved("dest-flag-entry");
                        this.ensureElemRemoved("conflict-point");
                        rerenderGameContextTurn(this);
                        clearRenderedDestinations(this);
                        renderWillpowerBids(this);
                        this.conflictPoints = [];
                        BothSides.forEach(side => {
                            const distFillProps = deriveDistanceFillProps(this);
                            renderDistanceFill(this, distFillProps, side);
                            renderDistanceLine(this, distFillProps, side);
                            rerenderFlag(this, side);
                            renderControlBar(this);
                        });
                        this.gameMovement = undefined;
                        renderWillpowerBidOpacities(this, 0);
                    }
                }
                this.timeTicker -= ruleset.TIME_SLICE_S;
            }
        }
    }
    // ==========================================================================
    appendSelectedPieceDestination(coords) {
        var _a;
        if (this.selectedPieceIndex === null) {
            return;
        }
        const selectedPiece = this.gameState.pieces[this.selectedPieceIndex];
        const order = orderNumber(selectedPiece);
        const existingSpeed = this.currentTurn().moves[selectedPiece.side]?.pieces[order]?.speed;
        this.elem("control-bar-speed").classList.remove("is-hidden");
        this.elem("control-bar-adjust").classList.remove("is-hidden");
        if (existingSpeed !== undefined) {
            this.elem(`speed-radio-${existingSpeed}`).click();
        }
        else {
            this.elem(`speed-radio-0`).click();
        }
        (_a = this.currentTurn().moves[selectedPiece.side].pieces)[order] || (_a[order] = { destinations: [], speed: 0 });
        this.currentTurn().moves[selectedPiece.side].pieces[order].destinations.push(coords);
        this.conflictPoints = destinationConflictPoints(this.gameProperties, this.gameState, this.currentTurn(), this.pieceCodex);
        renderDestinations(this);
        renderControlBar(this);
    }
    // ==========================================================================
    currentTurn() {
        return this.turns[this.turnNumber];
    }
    // ==========================================================================
    finishRedeploy() {
        if (!this.selectedSide) {
            throw new ConflictingInstructionsException("Cannot redeploy with no selectedSide");
        }
        else if (!this.redeploying) {
            throw new ConflictingInstructionsException("Trying to redeploy with redeploying=false");
        }
        const turn = this.currentTurn();
        if (!turn.moves[this.selectedSide]) {
            throw new ConflictingInstructionsException(`No move yet for ${this.selectedSide}`);
        }
        let firstDeadPiece = this.gameState.pieces[0];
        let order = 0;
        const firstDeadPieceIndex = this.gameState.pieces.findIndex(piece => {
            firstDeadPiece = piece;
            order = orderNumber(firstDeadPiece);
            return this.selectedSide && !turn.moves[this.selectedSide].redeployments[order] &&
                piece.side === this.selectedSide && piece.dead;
        });
        if (firstDeadPieceIndex < 0) {
            throw new ConflictingInstructionsException("Attempting to redeploy when no dead pieces");
        }
        turn.moves[this.selectedSide].redeployments[order] = { ...this.redeployPoint };
        this.redeploying = false;
        this.redeployedPieces.push({
            side: firstDeadPiece.side,
            order: order
        });
        this.setRedeployedPieces();
        renderRedeployLine(this);
        renderRedeployPoint(this);
        renderRedeployedPieces(this);
        renderControlBar(this);
    }
    // ==========================================================================
    redeployedCount() {
        if (!this.selectedSide) {
            return 0;
        }
        return this.redeployedPieces.filter(redeployment => redeployment.side === this.selectedSide).length;
    }
    // ==========================================================================
    netRedeployableCount() {
        if (!this.selectedSide) {
            return 0;
        }
        const deadPieceCount = deriveDeadPieceCount(this.gameState.pieces, this.selectedSide);
        return deadPieceCount - this.redeployedCount();
    }
    // ==========================================================================
    removeDestination() {
        if (this.selectedPieceIndex === null) {
            return;
        }
        const turn = this.currentTurn();
        const selectedPiece = this.gameState.pieces[this.selectedPieceIndex];
        const order = orderNumber(selectedPiece);
        const pieceMove = { ...turn.moves[selectedPiece.side].pieces[order] };
        if (!pieceMove.destinations || pieceMove.destinations.length <= 1) {
            delete turn.moves[selectedPiece.side].pieces[order];
            clearDestinationsAndHideControls(this);
        }
        else {
            turn.moves[selectedPiece.side].pieces[order].destinations = pieceMove.destinations.slice(0, pieceMove.destinations.length - 1);
            this.conflictPoints = destinationConflictPoints(this.gameProperties, this.gameState, this.currentTurn(), this.pieceCodex);
            renderDestinations(this);
        }
        renderControlBar(this);
    }
    // ==========================================================================
    setRedeployedPieces() {
        this.redeployedPieces = [];
        Object.entries(this.currentTurn().moves).forEach(sideAndMove => {
            const [side, move] = sideAndMove;
            Object.entries(move.redeployments).forEach(orderAndRedeployment => {
                const [order, _redeployment] = orderAndRedeployment;
                this.redeployedPieces.push({ side: side, order: parseInt(order) });
            });
        });
    }
    // ==========================================================================
    setRedeploying(redeploying) {
        this.redeploying = redeploying;
        if (redeploying) {
            this.redeployLines = redeployLines(this.gameProperties, this.gameState, this.currentTurn(), this.selectedSide);
            const medianLine = this.redeployLines[Math.floor(this.redeployLines.length / 2)];
            if (medianLine) {
                this.redeployPoint = { x: (medianLine.from.x + medianLine.to.x) / 2,
                    y: (medianLine.from.y + medianLine.to.y) / 2 };
            }
        }
        else {
            this.redeployLines = [];
            this.redeployPoint = { x: -9999, y: -9999 };
        }
        renderRedeployLine(this);
        renderRedeployPoint(this);
    }
    // ==========================================================================
    setRedeployPoint(point) {
        const { ruleset } = this;
        let minimumDistance = ruleset.BOARD_W * 2;
        let finalPoint = { x: -999, y: -999 };
        let closestPoint = { x: -999, y: -999 };
        for (let i = 0; i < this.redeployLines.length; i++) {
            const line = this.redeployLines[i];
            let dist = ruleset.BOARD_W * 2;
            if (line.from.x === line.to.x) {
                const minY = Math.min(line.from.y, line.to.y);
                const maxY = Math.max(line.from.y, line.to.y);
                if (point.y >= minY && point.y <= maxY) {
                    dist = Math.abs(point.x - line.from.x);
                    closestPoint = { x: line.from.x, y: point.y };
                }
                else if (point.y > maxY) {
                    dist = Math.sqrt(Math.pow(point.y - maxY, 2) + Math.pow(point.x - line.from.x, 2));
                    closestPoint = { x: line.from.x, y: maxY };
                }
                else {
                    dist = Math.sqrt(Math.pow(point.y - minY, 2) + Math.pow(point.x - line.from.x, 2));
                    closestPoint = { x: line.from.x, y: minY };
                }
            }
            else {
                const minX = Math.min(line.from.x, line.to.x);
                const maxX = Math.max(line.from.x, line.to.x);
                if (point.x >= minX && point.x <= maxX) {
                    dist = Math.abs(point.y - line.from.y);
                    closestPoint = { x: point.x, y: line.from.y };
                }
                else if (point.x > maxX) {
                    dist = Math.sqrt(Math.pow(point.x - maxX, 2) + Math.pow(point.y - line.from.y, 2));
                    closestPoint = { x: maxX, y: line.from.y };
                }
                else {
                    dist = Math.sqrt(Math.pow(point.x - minX, 2) + Math.pow(point.y - line.from.y, 2));
                    closestPoint = { x: minX, y: line.from.y };
                }
            }
            if (dist < minimumDistance) {
                minimumDistance = dist;
                finalPoint = closestPoint;
            }
        }
        this.redeployPoint = finalPoint;
    }
    // ==========================================================================
    setTurnMove(side, move, submitted) {
        var _a;
        const turn = this.currentTurn();
        turn.moves[side] = move;
        const cost = distanceCost(this.ruleset, this.gameState, turn.moves, this.pieceCodex);
        if (cost[side] > this.gameState.distance[side]) {
            throw new RuleViolationException("tooMuchDistance");
        }
        if (submitted) {
            (_a = turn.moveSubmissionTimes)[side] || (_a[side] = Date.now());
            renderControlBar(this);
        }
        if (turn.moveSubmissionTimes.left && turn.moveSubmissionTimes.right) {
            this.kickstartIntoMotion();
        }
    }
    // ==========================================================================
    updateHoveredPiece(hoveredPieceIndex) {
        if (hoveredPieceIndex !== null && this.selectedPieceIndex === hoveredPieceIndex) {
            return; // Can't override a selected piece with a hovered one
        }
        this.hoveredPieceIndex = hoveredPieceIndex;
        renderHoveredPiece(this);
    }
    // ==========================================================================
    updateSelectedPiece(selectedPieceIndex) {
        this.selectedPieceIndex = selectedPieceIndex;
        if (this.selectedPieceIndex !== null) {
            const selectedPiece = this.gameState.pieces[selectedPieceIndex];
            if (selectedPiece.side !== this.selectedSide) {
                this.selectedSide = selectedPiece.side;
            }
            renderControlBar(this);
            renderDestinations(this);
        }
        renderSelectedPiece(this);
    }
}
//# sourceMappingURL=flakture.js.map