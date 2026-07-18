abstract class CustomError extends Error {
  constructor(message: string) {
    super(message);
    // Assigns the class name dynamically
    this.name = this.constructor.name;

    // Fixes the prototype chain for accurate 'instanceof' checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConflictingInstructionsException extends CustomError {
  message: string

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class AmbiguousElementException extends CustomError {
  className: string

  constructor(message: string) {
    super(message);
    this.className = message;
  }
}

export class MissingElementException extends CustomError {
  className: string

  constructor(message: string) {
    super(message);
    this.className = message;
  }
}

export class RuleViolationException extends CustomError {
  rule: string

  constructor(rule: string) {
    super(rule);
    this.rule = rule;
  }
}
