export const MEASUREMENT_KEY = "webm8:measurement-choice:v1";
export const MEASUREMENT_DAYS = 180;
export type MeasurementChoice = { allowed: boolean; expires: number };
export function readMeasurementChoice(
  raw: string | null,
  now = Date.now(),
): MeasurementChoice | null {
  try {
    const value = JSON.parse(raw || "null");
    return value &&
      typeof value.allowed === "boolean" &&
      Number.isSafeInteger(value.expires) &&
      value.expires > now &&
      value.expires <= now + MEASUREMENT_DAYS * 86400_000
      ? value
      : null;
  } catch {
    return null;
  }
}
export function measurementBlocked(signal: {
  doNotTrack?: string | null;
  globalPrivacyControl?: boolean;
}) {
  return signal.doNotTrack === "1" || signal.globalPrivacyControl === true;
}
