import {PlayerColor} from "./common-types";

export const COLORS = {
    background: "#101010",
    destinationLine: "#f0f0f0",
    flagBackground: {
        [PlayerColor.blue]: "#000070",
        [PlayerColor.red]: "#600000"
    },
    flags: {
        [PlayerColor.blue]: "#5f9fff",
        [PlayerColor.red]: "#ff9f5f"
    },
    gameContext: "#757575",
    gameContextNames: {
        [PlayerColor.blue]: "#1010b0",
        [PlayerColor.red]: "#a00000",
    },
    hover: "#f0f0f0",
    inlineText: {
        [PlayerColor.blue]: "#c0b0ff",
        [PlayerColor.red]: "#ffb0c0",
    },
    inlineTextOutline: {
        [PlayerColor.blue]: "#a090c0",
        [PlayerColor.red]: "#c090a0",
    },
    looseFlags: {
        [PlayerColor.blue]: "#000070",
        [PlayerColor.red]: "#700000",
    },
    middleLine: "#808080",
    notification: {
        [PlayerColor.blue]: "#4040ff",
        [PlayerColor.red]: "#ff4040",
        neutral: "#e9e9e9"
    },
    notificationOutline: {
        neutral: "#e9e9e9"
    },
    pieces: {
        [PlayerColor.blue]: "#00f",
        [PlayerColor.red]: "#f00"
    },
    redeployLine: "#fff",
    select: "#fff",
    willpowerBid: {
        blue: "#5050d0",
        red: "#d04a4a",
    },
    willpowerBidOutline: {
        blue: "#202050",
        red: "#502020",
    }
};

export const CONFLICT_POINT_RADIUS = 4;

export const FLAG_DISPLAY_W = 15;
export const FLAG_DISPLAY_H = 25;

export const FONTS = {
    gameContextNames: {
        face: "Verdana, Arial, Helvetica, Sans-Serif", size: 64
    },
    gameContextTimeless: {
        face: "Verdana, Arial, Helvetica, Sans-Serif", size: 86
    },
    inlineText: {
        face: "Verdana, Arial, Helvetica, Sans-Serif", size: 24
    },
    notification: {
        face: "Verdana, Arial, Helvetica, Sans-Serif", size: 48
    },
    willpowerBid: {
        face: "Verdana, Arial, Helvetica, Sans-Serif", size: 60
    }
}

export const EQUAL_BID_COLLISION_DELAY_S = 0.75;
export const FLAG_ENTRY_WIDTH = 7;
export const GAME_CONTEXT_FRONT_OPACITY = 0.5;

export const HALO_BUFFER = 8;

export const PRE_KICKOFF_DELAY_S = 0.3;

export const REDEPLOY_OPACITY = 0.7;
export const REDEPLOY_POINT_RADIUS = 9;

export const THICKNESS_HOVER = 1;
export const THICKNESS_SELECT = 2;

export const WILLPOWER_BID_FADE_IN_S = 0.9;
export const WILLPOWER_BID_INITIAL_PADDING = 45;
export const WILLPOWER_BID_MARGIN_MIN = 12;
export const WILLPOWER_BID_OPACITY_MAX = 0.75;
export const WILLPOWER_BID_PADDING = 25;
export const WILLPOWER_BID_TRAVEL_PER_S = 500;

export const WILLPOWER_DEDUCTION_PER_S = 0.35;
