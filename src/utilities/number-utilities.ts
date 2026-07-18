// ==========================================================================
export const direction = (num: number) => {
  return (num < 0) ? -1 : 1;
}

// ==========================================================================
export const ordinalSuffix = (num: number): string => {
  const leastSignificant = num % 10;
  const tensPlace = Math.floor(num / 10);
  if (leastSignificant === 1 && tensPlace !== 1) {
    return "st";
  }
  if (leastSignificant === 2 && tensPlace !== 1) {
    return "nd";
  }
  if (leastSignificant === 3 && tensPlace !== 1) {
    return "rd";
  }
  return "th";
}
