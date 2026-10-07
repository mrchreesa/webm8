import { NextResponse } from "next/server";
import { demoConfirmationEmail, demoEmailFrom, demoNotificationEmail } from "@/lib/demoEmail";
import { validateDemoSubmission, type DemoSubmission } from "@/lib/demoRequest";
import { sendEmail } from "@/lib/resend";
import { brand, intakeEmail } from "@/lib/site";
import { saveDemoToCrm } from "@/lib/crmIntake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** /free-demo/ requests are accepted only after the CRM saves them. */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const recentRequests = new Map<string, number[]>();


export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: "That request could not be read." } }, { status: 400 });
  }

  if (isRateLimited(clientKey(request))) {
    return NextResponse.json(
      { ok: false, errors: { form: `That's a few requests in a row. Email ${intakeEmail} and we'll pick it up from there.` } },
      { status: 429 },
    );
  }

  const validation = validateDemoSubmission(payload);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, errors: validation.errors }, { status: 400 });
  }
  const demo = validation.value;

  let id: string;
  try {
    const receipt = await saveDemoToCrm(demo);
    id = receipt.id;
    if (receipt.duplicate) return NextResponse.json({ ok: true, id, confirmationSent: false });
  } catch (error) {
    console.error("demo-request: insert failed", error);
    return NextResponse.json(
      {
        ok: false,
        errors: { form: `We couldn't save that just now. Your answers are still here. Please try again, or email ${intakeEmail}.` },
      },
      { status: 502 },
    );
  }

  // Awaited, because work after the response is not guaranteed on Vercel. The
  // request is saved either way, so a failed email is logged, not returned.
  const confirmationSent = await sendEmails(demo, id);

  return NextResponse.json({ ok: true, id, confirmationSent });
}

async function sendEmails(demo: DemoSubmission, id: string) {
  const notification = demoNotificationEmail(demo, { id, receivedAt: new Date() });
  const confirmation = demoConfirmationEmail(demo, { callFrom: brand.phoneLabel || brand.phone || undefined });

  const [toUs, toThem] = await Promise.all([
    sendEmail({ from: demoEmailFrom, to: intakeEmail, replyTo: demo.email, ...notification }),
    sendEmail({ from: demoEmailFrom, to: demo.email, replyTo: intakeEmail, ...confirmation }),
  ]);
  if (!toUs.ok) console.error(`demo-request: notification not sent for ${id} (${toUs.reason})`);
  if (!toThem.ok) console.error(`demo-request: confirmation not sent for ${id} (${toThem.reason})`);
  return toThem.ok;
}

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const seen = (recentRequests.get(key) ?? []).filter((at) => now - at < RATE_LIMIT_WINDOW_MS);

  if (seen.length >= RATE_LIMIT_MAX) {
    recentRequests.set(key, seen);
    return true;
  }

  seen.push(now);
  recentRequests.set(key, seen);
  if (recentRequests.size > 5000) recentRequests.clear();
  return false;
}
