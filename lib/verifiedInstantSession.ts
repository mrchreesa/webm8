import { cookies } from "next/headers";
import { BillingError, SESSION_COOKIE } from "./instantBillingServer";
import { turnstileKeys, validSignupProof, VERIFICATION_COOKIE } from "./instantTurnstile";

export async function verifiedInstantSession() {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (!session || !/^[a-f0-9]{64}$/.test(session)) {
    throw new BillingError("Enable cookies and reload this page to continue.", 401);
  }
  if (!validSignupProof(session, jar.get(VERIFICATION_COOKIE)?.value, turnstileKeys().secret)) {
    throw new BillingError("Please complete the verification to continue.", 428);
  }
  return session;
}
