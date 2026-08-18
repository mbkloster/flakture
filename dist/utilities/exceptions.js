class CustomError extends Error {
    constructor(message) {
        super(message);
        // Assigns the class name dynamically
        this.name = this.constructor.name;
        // Fixes the prototype chain for accurate 'instanceof' checks
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class ConflictingInstructionsException extends CustomError {
    message;
    constructor(message) {
        super(message);
        this.message = message;
    }
}
export class AmbiguousElementException extends CustomError {
    className;
    constructor(message) {
        super(message);
        this.className = message;
    }
}
export class MissingElementException extends CustomError {
    className;
    constructor(message) {
        super(message);
        this.className = message;
    }
}
export class RuleViolationException extends CustomError {
    details;
    rule;
    constructor(rule, details) {
        super(rule);
        this.details = details;
        this.rule = rule;
    }
}
//# sourceMappingURL=exceptions.js.map