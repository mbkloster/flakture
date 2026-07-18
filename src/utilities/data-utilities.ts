// ==========================================================================
export function deepClone<K>(
    obj: K
): K {
    if (typeof obj === "object" && !Array.isArray(obj) && obj !== null) {
      const newObject = {} as { [P in keyof K]: K[P] };

        for (const key in obj) {
            newObject[key] = deepClone(obj[key]);
        }

        return newObject;
    } else if (Array.isArray(obj)) {
      return obj.map(oldEntry => deepClone(oldEntry)) as K;
    }
    return obj;
}

// ==========================================================================
export function distributeValuesIntoSlots<T extends Record<PropertyKey, number>>(
  distribution: T,
  slots: number
): { [K in keyof T]: number } {
    const result = {} as {[K in keyof T]: number};
    for (const k in distribution) {
        result[k] = 0;
    }
    const distKeys = Object.keys(distribution);
    for (let i = 0; i < slots; i++) {
        let highestKey = distKeys[0];
        let highestValue = distribution[highestKey] / ((result[highestKey] || 0) + 1);
        for (let j = 1; j < distKeys.length; j++) {
            const value = distribution[distKeys[j]] / ((result[distKeys[j]] || 0) + 1);
            if (value > highestValue) {
                highestKey = distKeys[j];
                highestValue = value;
            }
        }
        // @ts-ignore
        result[highestKey]++;
    }
    return result;
}
