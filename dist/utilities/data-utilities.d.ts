export declare function deepClone<K>(obj: K): K;
export declare function distributeValuesIntoSlots<T extends Record<PropertyKey, number>>(distribution: T, slots: number): {
    [K in keyof T]: number;
};
//# sourceMappingURL=data-utilities.d.ts.map