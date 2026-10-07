/** Do Not Track or Global Privacy Control: either keeps all website measurement off. */
export function measurementBlocked(signal: {
  doNotTrack?: string | null;
  globalPrivacyControl?: boolean;
}) {
  return signal.doNotTrack === "1" || signal.globalPrivacyControl === true;
}
