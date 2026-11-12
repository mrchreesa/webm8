import { createHmac, timingSafeEqual } from "node:crypto";
import { BillingError } from "./instantBillingServer.ts";

export const VERIFICATION_COOKIE = "webm8-instant-verified";
export const VERIFICATION_SECONDS = 15 * 60;

export function turnstileKeys(env: Record<string, string | undefined> = process.env) {
  const siteKey = env.TURNSTILE_SITE_KEY;
  const secret = env.TURNSTILE_SECRET_KEY;
  // Public testing credentials must never authorize a live customer session.
  const localTest = env.INSTANT_STRIPE_MODE === "test" && env.VERCEL_ENV !== "production"
    && ["localhost", "127.0.0.1"].includes(new URL(env.INSTANT_WEBSITES_ORIGIN || "https://invalid.invalid").hostname);
  if (!siteKey || !secret || (!localTest && [siteKey, secret].some(key => /^[123]x0{10}/.test(key)))) {
    throw new BillingError("Signup verification is unavailable. Please try again later.", 503);
  }
  return { secret, siteKey };
}

export async function verifyTurnstile(token: unknown, secret: string, hostname: string) {
  const denied = () => new BillingError("Please complete the verification again.", 403);
  if (typeof token !== "string" || !token || token.length > 2048) throw denied();
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token }),
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!response.ok) throw new BillingError("Verification is temporarily unavailable. Please try again.", 503);
  const result = await response.json();
  if (result.success !== true) throw denied();
  // Cloudflare's public local-test key returns a synthetic hostname and omits the action.
  if (secret === "1x0000000000000000000000000000000AA" && ["localhost", "127.0.0.1"].includes(hostname)
    && result.metadata?.result_with_testing_key === true) return;
  if (result.hostname !== hostname || result.action !== "instant_signup") throw denied();
}

export function signupProof(session: string, expires: number, secret: string) {
  const signature = createHmac("sha256", secret).update(`instant-signup:v1:${session}:${expires}`).digest("hex");
  return `${expires}.${signature}`;
}

export function validSignupProof(session: string, proof: string | undefined, secret: string, now = Date.now()) {
  const match = /^(\d{13})\.[a-f0-9]{64}$/.exec(proof ?? "");
  if (!match || Number(match[1]) <= now) return false;
  return timingSafeEqual(Buffer.from(match[0]), Buffer.from(signupProof(session, Number(match[1]), secret)));
}
