import { NextResponse } from "next/server";
import { demoConfirmationEmail, demoEmailFrom, demoNotificationEmail } from "@/lib/demoEmail";
import { hasOwnWebsite, validateDemoSubmission, type DemoSubmission } from "@/lib/demoRequest";
import { sendEmail } from "@/lib/resend";
import { brand, intakeEmail } from "@/lib/site";
import { supabaseTableRequest } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** /free-demo/ requests share the review-request table with /movers/, told apart by request_type. */
const TABLE = "agency_review_requests";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const recentRequests = new Map<string, number[]>();

type SavedRow = { id: string };

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
    // A retry of a request already saved (a double tap, or a lost response)
    // gets the same id back, and no second round of emails.
    const existing = await findBySubmissionKey(demo.submissionKey);
    if (existing) return NextResponse.json({ ok: true, id: existing.id });
    id = await insert(demo);
  } catch (error) {
    // A simultaneous retry can race the insert. Resolve it as the same request.
    try {
      const existing = await findBySubmissionKey(demo.submissionKey);
      if (existing) return NextResponse.json({ ok: true, id: existing.id });
    } catch {
      // The original error is more useful in the logs.
    }
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
  await sendEmails(demo, id);

  return NextResponse.json({ ok: true, id });
}

async function insert(demo: DemoSubmission): Promise<string> {
  const rows = await supabaseTableRequest<SavedRow[]>(TABLE, {
    method: "POST",
    prefer: "return=representation",
    query: "select=id",
    body: {
      request_type: "demo",
      contact_name: demo.name,
      company_name: demo.business,
      email: demo.email,
      phone: demo.phone,
      main_city_state: demo.area,
      business_link: demo.link,
      website_url: demo.link,
      has_website: hasOwnWebsite(demo.link),
      business_type: demo.trade,
      business_type_other: demo.tradeOther,
      submission_key: demo.submissionKey,
      utm_source: demo.attribution.utm_source ?? null,
      utm_medium: demo.attribution.utm_medium ?? null,
      utm_campaign: demo.attribution.utm_campaign ?? null,
      utm_content: demo.attribution.utm_content ?? null,
      utm_term: demo.attribution.utm_term ?? null,
      referrer: demo.referrer,
      page_path: demo.pagePath,
    },
  });
  const id = rows[0]?.id;
  if (!id) throw new Error("Insert returned no row");
  return id;
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
}

async function findBySubmissionKey(submissionKey: string) {
  const rows = await supabaseTableRequest<SavedRow[]>(TABLE, {
    query: `select=id&submission_key=eq.${encodeURIComponent(submissionKey)}&limit=1`,
  });
  return rows[0] ?? null;
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
