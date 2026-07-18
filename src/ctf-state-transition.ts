import {
    BothSides,
    Coord,
    CtfGameMovement,
    CtfGameState,
    FlagState, LooseFlag,
    PieceCodex,
    Ruleset,
    Side, SideMove, TimeSliceMeta,
    Turn,
} from "common-types";
import {opponentSide} from "utilities";
import {circlesCollide, inFlagZone} from "utilities/board-utilities";

function isLooseFlag(flagState: FlagState): flagState is LooseFlag {
    if (!flagState) { return false; }
    return (flagState as Coord).x !== undefined;
}

// ==========================================================================
export const distanceCost = (ruleset: Ruleset, ctfGameState: CtfGameState, moves: Record<Side, SideMove | null>, pieceCodex: PieceCodex): Record<Side, number> => {
    const distances = { left: 0, right: 0 };
    BothSides.forEach(side => {
        const pieces = moves[side] ? moves[side].pieces : {};
        Object.entries(pieces).forEach(orderNumberAndMove => {
            const [ orderNumber, move ] = orderNumberAndMove;
            const pieceIndex = pieceCodex.name[`${ side }${ orderNumber }`]
            let lastDestination: { x: number, y: number } = ctfGameState.pieces[pieceIndex];
            let totalPieceDistance = 0;
            move.destinations.forEach(destination => {
                const nextDestination = destination;
                totalPieceDistance += Math.sqrt(
                    Math.pow(nextDestination.y - lastDestination.y, 2) +
                    Math.pow(nextDestination.x - lastDestination.x, 2)
                );
                lastDestination = nextDestination;
            });
            const speedMult = ruleset.SPEEDS[move.speed].cost;
            distances[side] += speedMult * Math.min(totalPieceDistance, ruleset.PIECE_DIST_HIGH_COST_THRESHOLD) +
                ruleset.PIECE_DIST_HIGH_COST_MULTIPLIER * Math.max(0, (totalPieceDistance - ruleset.PIECE_DIST_HIGH_COST_THRESHOLD) * speedMult)
        });
    });
    return distances;
}

// ==========================================================================
export const piecesCollide = (ruleset: Ruleset, pieceA: {x: number, y: number}, pieceB: {x: number, y: number}): boolean => {
    return circlesCollide(pieceA, ruleset.PIECE_R, pieceB, ruleset.PIECE_R);
}

// ==========================================================================
export const runTimeSlice = (ruleset: Ruleset, ctfGameState: CtfGameState, movement: CtfGameMovement, pieceCodex: PieceCodex): TimeSliceMeta => {
    let stillInMotion = false;
    const stillMovingPieces: Set<number> = new Set<number>();
    const result: TimeSliceMeta = {collisions: [], willpowerUsed: new Set<Side>()};
    Object.entries(movement.pieces).forEach(indexAndPiece => {
        const [index, movingPiece] = indexAndPiece;
        if (movingPiece.dead) {
            movingPiece.opacity = Math.max(0, movingPiece.opacity - ruleset.FADE_PER_S * ruleset.TIME_SLICE_S);
            if (movingPiece.opacity > 0) {
                stillMovingPieces.add(parseInt(index));
                stillInMotion = true;
            }
        } else {
            const speed = ruleset.SPEEDS[movingPiece.speed];
            let distToTravel = speed.speedPerS * ruleset.TIME_SLICE_S;
            if (movingPiece.destinations?.length && distToTravel > 0) {
                stillMovingPieces.add(parseInt(index));
            }
            while (movingPiece.destinations.length && distToTravel > 0) {
                const destination = movingPiece.destinations[0]!;
                const distToDest = Math.sqrt(Math.pow(destination.y - movingPiece.y, 2) + Math.pow(destination.x - movingPiece.x, 2));
                movingPiece.direction = (Math.sign(destination.x - movingPiece.x) > 0) ? "r" : "l";
                if (distToDest <= distToTravel) {
                    movingPiece.x = destination.x;
                    movingPiece.y = destination.y;
                    movingPiece.destinations.shift();
                    distToTravel -= distToDest;
                } else {
                    const angleToDest = Math.atan2(destination.y - movingPiece.y, destination.x - movingPiece.x);
                    movingPiece.x += distToTravel * Math.cos(angleToDest);
                    movingPiece.y += distToTravel * Math.sin(angleToDest);
                    distToTravel = 0;
                    stillInMotion = true;
                }
            }
        }
    });
    for (let i = 0; i < ctfGameState.pieces.length - 1; i++) {
        const pieceA = ctfGameState.pieces[i], movementA = movement.pieces[i];
        for (let j = i + 1; j < ctfGameState.pieces.length; j++) {
            if (!stillMovingPieces.has(i) && !stillMovingPieces.has(j)) {
                continue;
            }
            const pieceB = ctfGameState.pieces[j], movementB = movement.pieces[j];
            if (pieceA.side === pieceB.side || (movementA || pieceA).dead || (movementB || pieceB).dead) {
                continue;
            }
            if (piecesCollide(ruleset, movementA || pieceA, movementB || pieceB)) {
                const willpowerA = movement.willpowerBid[pieceA.side];
                const willpowerB = movement.willpowerBid[pieceB.side];
                const leftPieceIndex = pieceA.side === Side.left ? i : j;
                const rightPieceIndex = pieceA.side === Side.left ? j : i;
                let winner = Side.left;
                if ((movement.flags.left === i && movement.flags.right !== j) || (movement.flags.right === i && movement.flags.left !== j)) {
                    // piece B is the non flag carrier
                    winner = pieceB.side;
                } else if ((movement.flags.left === j && movement.flags.right !== i) || (movement.flags.right === j && movement.flags.left !== i)) {
                    // piece A is the non flag carrier
                    winner = pieceA.side;
                } else if (willpowerA > willpowerB) {
                    winner = pieceA.side;
                } else if (willpowerB > willpowerA) {
                    winner = pieceB.side;
                } else {
                    // If the willpower bid was equal, we use the midpoint of the collision and have defense trump
                    const maxX = Math.max(movementA?.x || pieceA.x, movementB?.x || pieceB.x);
                    const minX = Math.min(movementA?.x || pieceA.x, movementB?.x || pieceB.x);
                    const avgX = (minX + maxX) / 2;
                    if (avgX > ruleset.BOARD_W / 2) {
                        winner = Side.right;
                    } else if (avgX < ruleset.BOARD_W / 2) {
                        winner = Side.left;
                    } else {
                        // ... and if somehow that produces an exact tie, then have the remaining distance trump
                        const aDistance = ctfGameState.distance[pieceA.side] - movement.distanceTraveled[pieceA.side];
                        const bDistance = ctfGameState.distance[pieceB.side] - movement.distanceTraveled[pieceB.side];
                        winner = (aDistance >= bDistance) ? pieceA.side : pieceB.side;
                    }
                }

                const leftPiece = movement.pieces[leftPieceIndex] || ctfGameState.pieces[leftPieceIndex];
                const rightPiece = movement.pieces[rightPieceIndex] || ctfGameState.pieces[rightPieceIndex];
                let deductedWillpower = false;
                let flagCarriers = 0;
                if (winner === Side.left) {
                    if (movement.flags[winner] === rightPieceIndex) {
                        flagCarriers++;
                        movement.flags[winner] = { x: rightPiece.x, y: rightPiece.y, untilDecidingTurnNumber: ctfGameState.decidingTurnNumber + ruleset.FLAG_LOOSE_TURNS};
                    }
                    if (movement.flags[opponentSide(winner)] === leftPieceIndex) {
                        flagCarriers++;
                    }
                    movement.pieces[rightPieceIndex] ||= {direction: ctfGameState.pieces[rightPieceIndex].direction, x: pieceB.x, y: pieceB.y, dead: false, speed: 0, opacity: 1, destinations: []};
                    movement.pieces[rightPieceIndex].dead = true;
                    if (!movement.willpowerUsed.has(Side.left)) {
                        result.willpowerUsed.add(Side.left);
                        deductedWillpower = true;
                    }
                    movement.willpowerUsed.add(Side.left);
                } else {
                    if (movement.flags[winner] === leftPieceIndex) {
                        flagCarriers++;
                        movement.flags[winner] = { x: leftPiece.x, y: leftPiece.y, untilDecidingTurnNumber: ctfGameState.decidingTurnNumber + ruleset.FLAG_LOOSE_TURNS};
                    }
                    if (movement.flags[opponentSide(winner)] === rightPieceIndex) {
                        flagCarriers++;
                    }
                    movement.pieces[leftPieceIndex] ||= {direction: ctfGameState.pieces[leftPieceIndex].direction, x: pieceA.x, y: pieceA.y, dead: false, speed: 0, opacity: 1, destinations: []};
                    movement.pieces[leftPieceIndex].dead = true;
                    if (!movement.willpowerUsed.has(Side.right)) {
                        result.willpowerUsed.add(Side.right);
                        deductedWillpower = true;
                    }
                    movement.willpowerUsed.add(Side.right);
                }
                result.collisions.push({
                    left: {...leftPiece}, right: {...rightPiece}, winner, deductedWillpower, flagCarriers
                });
            }
        }
    }
    stillMovingPieces.forEach(i => {
        const gamePiece = ctfGameState.pieces[i];
        const oppSide = opponentSide(gamePiece.side);
        const movementPiece = movement.pieces[i];
        if ((movement.flags[oppSide] === null || isLooseFlag(movement.flags[oppSide])) && inFlagZone(ruleset, opponentSide(gamePiece.side), movementPiece)) {
            movement.flags[oppSide] = i;
        } else if (i === movement.flags[oppSide] && inFlagZone(ruleset, gamePiece.side, movementPiece)) {
            movement.winner = gamePiece.side;
        } else if (isLooseFlag(movement.flags[oppSide]) && !movementPiece.dead && circlesCollide(movement.flags[oppSide], ruleset.FLAG_R, movementPiece, ruleset.PIECE_R)) {
            movement.flags[oppSide] = i;
        }
    });
    if (!stillInMotion || movement.winner) {
        movement.finalized = true;
        stillMovingPieces.clear();
    }
    movement.stillMovingPieces = stillMovingPieces;
    return result;
}

// ==========================================================================
export const startGameMovement = (ruleset: Ruleset, ctfGameState: CtfGameState, turn: Turn, pieceCodex: PieceCodex): CtfGameMovement => {
    const cost = distanceCost(ruleset, ctfGameState, turn.moves, pieceCodex);
    const gameMovement: CtfGameMovement = {
        finalized: false,
        flags: { ...ctfGameState.flags },
        distanceTraveled: cost,
        pieces: {},
        stillMovingPieces: new Set<number>(),
        willpowerBid: { left: turn.moves.left!.willpowerBid, right: turn.moves.right!.willpowerBid },
        willpowerUsed: new Set<Side>()
    };
    BothSides.forEach(side => {
        Object.entries(turn.moves[side]!.redeployments).forEach(orderNumberAndSpot => {
            const [orderNumber, spot] = orderNumberAndSpot;
            const pieceIndex = pieceCodex.name[`${ side }${ orderNumber }`]!
            gameMovement.pieces[pieceIndex] = {
                direction: side === Side.left ? "r" : "l",
                dead: false,
                destinations: [],
                opacity: 1,
                speed: 0,
                x: spot.x,
                y: spot.y,
            };
            gameMovement.stillMovingPieces.add(pieceIndex);
        })
        Object.entries(turn.moves[side]!.pieces).forEach(orderNumberAndMove => {
            const [orderNumber, move] = orderNumberAndMove;
            const pieceIndex = pieceCodex.name[`${ side }${ orderNumber }`]!
            const piece = ctfGameState.pieces[pieceIndex];
            if (gameMovement.pieces[pieceIndex]) {
                gameMovement.pieces[pieceIndex].destinations = move.destinations;
                gameMovement.pieces[pieceIndex].speed = move.speed;
            } else {
                gameMovement.pieces[pieceIndex] = {
                    direction: move.destinations[0].x > piece.x ? "r" : "l",
                    dead: false,
                    destinations: move.destinations,
                    opacity: 1,
                    speed: move.speed,
                    x: piece.x,
                    y: piece.y,
                };
            }
            gameMovement.stillMovingPieces.add(pieceIndex);
        });
    });
    return gameMovement;
}

// ==========================================================================
export const stopGameMovement = (ruleset: Ruleset, ctfGameState: CtfGameState, movement: CtfGameMovement, finishedTurn: Turn): CtfGameState => {
    const newGameState = {
        ...ctfGameState,
        pieces: [...ctfGameState.pieces],
        distance: { ...ctfGameState.distance },
        decidingTurnNumber: ctfGameState.decidingTurnNumber + 1
    };
    const distanceBonus = ctfGameState.decidingTurnNumber === 1
        ? {
            left: movement.distanceTraveled.left * ruleset.DISTANCE_USED_RECOUP_SHARE_FIRST_TURN,
            right: movement.distanceTraveled.right * ruleset.DISTANCE_USED_RECOUP_SHARE_FIRST_TURN
        }
        : {left: 0, right: 0};
    newGameState.distance.left = Math.min(ruleset.DISTANCE_MAX,
        newGameState.distance.left - movement.distanceTraveled.left + distanceBonus.left + ruleset.DISTANCE_PER_TURN);
    newGameState.distance.right = Math.min(ruleset.DISTANCE_MAX,
        newGameState.distance.right - movement.distanceTraveled.right + distanceBonus.right + ruleset.DISTANCE_PER_TURN);
    Object.entries(movement.pieces).forEach(indexAndPiece => {
        const [ i, pieceMovement ] = indexAndPiece;
        const index = parseInt(i);
        newGameState.pieces[index] = {
            ...ctfGameState.pieces[index],
            x: pieceMovement.x,
            y: pieceMovement.y
        };
        if (pieceMovement.dead) {
            newGameState.pieces[index].dead = true;
        } else {
            delete newGameState.pieces[index].dead;
        }
    });
    movement.willpowerUsed.forEach(side => {
        newGameState.willpower[side] -= movement.willpowerBid[side];
    });
    BothSides.forEach(side => {
        newGameState.willpower[side] -= Object.entries(finishedTurn.moves[side]?.redeployments || {}).length;
    })
    if (finishedTurn.moveSubmissionTimes.left! < finishedTurn.moveSubmissionTimes.right!) {
        newGameState.willpower.left += 1;
    } else if (finishedTurn.moveSubmissionTimes.left! > finishedTurn.moveSubmissionTimes.right!) {
        newGameState.willpower.right += 1;
    } else {
        // Extremely unlikely, but let's handle it anyway
        newGameState.willpower.right += 1;
        newGameState.willpower.left += 1;
    }
    if (movement.willpowerBid.left > movement.willpowerBid.right) {
        newGameState.willpower.right += 1;
    } else if (movement.willpowerBid.left < movement.willpowerBid.right) {
        newGameState.willpower.left += 1;
    }
    newGameState.flags = {...movement.flags};
    BothSides.forEach(side => {
        if (isLooseFlag(newGameState.flags[side]) && newGameState.flags[side].untilDecidingTurnNumber <= newGameState.decidingTurnNumber) {
            newGameState.flags[side] = null;
        }
    });
    if (movement.winner) {
        newGameState.winner = movement.winner;
    }
    return newGameState;
}
