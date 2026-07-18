// ==========================================================================
export function deepClone(obj) {
    if (typeof obj === "object" && !Array.isArray(obj) && obj !== null) {
        const newObject = {};
        for (const key in obj) {
            newObject[key] = deepClone(obj[key]);
        }
        return newObject;
    }
    else if (Array.isArray(obj)) {
        return obj.map(oldEntry => deepClone(oldEntry));
    }
    return obj;
}
// ==========================================================================
export function distributeValuesIntoSlots(distribution, slots) {
    const result = {};
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
//# sourceMappingURL=data-utilities.js.map