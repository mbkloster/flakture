interface AnyCallable {
    (): any;
}
export default class BaseAnimation {
    animations: BaseAnimation[];
    afterComplete: AnyCallable | null;
    done: boolean;
    constructor();
    addTime(dSeconds: number): void;
    completelyDestroy(): void;
    setUp(): void;
}
export {};
//# sourceMappingURL=base-animation.d.ts.map