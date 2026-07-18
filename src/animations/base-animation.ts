interface AnyCallable {
  (): any
}

export default class BaseAnimation {
    animations: BaseAnimation[]
    afterComplete: AnyCallable | null
    done: boolean

    // ==========================================================================
    constructor() {
        this.animations = [];
        this.afterComplete = null;
        this.done = false;
    }

    // ==========================================================================
    addTime (dSeconds: number) {
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
