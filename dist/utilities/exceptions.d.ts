declare abstract class CustomError extends Error {
    constructor(message: string);
}
export declare class ConflictingInstructionsException extends CustomError {
    message: string;
    constructor(message: string);
}
export declare class AmbiguousElementException extends CustomError {
    className: string;
    constructor(message: string);
}
export declare class MissingElementException extends CustomError {
    className: string;
    constructor(message: string);
}
export declare class RuleViolationException extends CustomError {
    details: any;
    rule: string;
    constructor(rule: string, details?: any);
}
export {};
//# sourceMappingURL=exceptions.d.ts.map