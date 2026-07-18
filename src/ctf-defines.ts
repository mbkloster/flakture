import {Ruleset, RulesetName} from "./common-types";

const BOARD_W = 1100;
const BOARD_H = 550;

export const DEFAULT_RULESET: RulesetName = "AntiquatedAvian";

export const RULESETS: Record<RulesetName, Ruleset> = {
    AntiquatedAvian: {
        BOARD_H: BOARD_H,
        BOARD_W: BOARD_W,
        
        DISTANCE_INITIAL: BOARD_W * 1.6,
        DISTANCE_MAX: BOARD_W * 4,
        DISTANCE_PER_TURN: BOARD_W * 0.5,
        DISTANCE_USED_RECOUP_SHARE_FIRST_TURN: 0.2,
        
        DISTRIBUTION_DEFAULT: {
            0.1: 195,
            0.3: 324,
            0.7: 226,
            1.0: 275
        },
        
        FADE_PER_S: 0.6,
        
        FLAG_AREA_THICKNESS: 6,
        FLAG_AREA_RADIUS: 50,
        FLAG_LOOSE_TURNS: 3,
        FLAG_R: 55,
        
        PIECE_DIST_HIGH_COST_MULTIPLIER: 2,
        PIECE_DIST_HIGH_COST_THRESHOLD: BOARD_W * 0.4,
        PIECE_PER_SIDE: 21,
        PIECE_R: 14,

        REDEPLOY_BLOCK_BUFFER_SHARE: 1.2,
        REDEPLOY_TICK_COUNT: 100,
        
        SPEEDS: [
            {label: "Normal", speedPerS: BOARD_W * 0.1, cost: 1, icon: "person-walking-with-cane"},
            {label: "Fast", speedPerS: BOARD_W * 0.15, cost: 1.7, icon: "person-walking"},
            {label: "Sprint", speedPerS: BOARD_W * 0.2, cost: 2.8, icon: "person-running"}
        ],
        
        TIME_SLICE_S: 1 / 30.0,
        
        UNUSABLE_SPACE_WIDTH: 5,
        
        WILLPOWER_INITIAL: 20,
        WILLPOWER_PER_INITIATIVE: 1,
        WILLPOWER_TO_RESURRECT: 1
    }
};
