import { Ruleset, Side } from "../common-types";
export declare const circlesCollide: (circleA: {
    x: number;
    y: number;
}, radiusA: number, circleB: {
    x: number;
    y: number;
}, radiusB: number, debug?: boolean) => boolean;
export declare const distSqFromPoint: (pointA: {
    x: number;
    y: number;
}, pointB: {
    x: number;
    y: number;
}) => number;
export declare const inFlagZone: (ruleset: Ruleset, flagSide: Side, piece: {
    x: number;
    y: number;
}) => boolean;
//# sourceMappingURL=board-utilities.d.ts.map