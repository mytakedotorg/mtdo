export function convertSecondsToMilliseconds(seconds: number): number {
  return Math.round(seconds * 1000);
}

export function convertMillisecondsToSeconds(ms: number): number {
  if (ms === 0) {
    return 0;
  }
  return ms / 1000;
}
