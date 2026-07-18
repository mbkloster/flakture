export default class BaseAnimation {
    // ==========================================================================
    constructor() {
        this.animations = [];
        this.afterComplete = null;
        this.done = false;
    }
    // ==========================================================================
    addTime(dSeconds) {
        // Implement
    }
    // ==========================================================================
    completelyDestroy() {
        if (this.afterComplete) {
            this.afterComplete();
        }
    }
    // ==========================================================================
    setUp() {
        // Implement
    }
}
//# sourceMappingURL=base-animation.js.map