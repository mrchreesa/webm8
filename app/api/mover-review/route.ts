import { NextResponse } from "next/server";
import { validateReviewRequest } from "@/lib/reviewRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Accepts a free 10-minute review request from /movers/ and records it.
 *
 * The browser is told the request succeeded only after the row exists. There is
 * no mailto fallback and no optimistic success: a failure here is reported as a
 * failure, so a request is never quietly lost.
 */

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

/**
 * Best-effort throttle. Serverless instances are not shared, so this stops
 * casual repeat submissions rather than a determined attacker; the honeypot and
 * timing checks in the validator cover the rest.
 */
const recentRequests = new Map<string, number[]>();

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: { form: "That request could not be read." } },
      { status: 400 },
    );
  }

  if (isRateLimited(clientKey(request))) {
    return NextResponse.json(
      {
        ok: false,
        errors: {
          form: "That's a few requests in a row. Email info@webm8agency.com and we'll pick it up from there.",
        },
      },
      { status: 429 },
    );
  }

  const validation = validateReviewRequest(payload);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, errors: validation.errors }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("mover-review: SUPABASE_URL or SUPABASE_SECRET_KEY is not set");
    return NextResponse.json(
      {
        ok: false,
        errors: {
          form: "We couldn't save that just now. Please try again, or email info@webm8agency.com.",
        },
      },
      { status: 502 },
    );
  }

  const fields = validation.value;

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/$/, "")}/rest/v1/agency_review_requests`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          contact_name: fields.contactName,
          company_name: fields.companyName,
          email: fields.email,
          phone: fields.phone,
          website_url: fields.websiteUrl,
          has_website: fields.hasWebsite,
          plan: fields.plan,
          billing: fields.billing,
          utm_source: fields.utmSource,
          utm_medium: fields.utmMedium,
          utm_campaign: fields.utmCampaign,
          utm_content: fields.utmContent,
          utm_term: fields.utmTerm,
          referrer: fields.referrer,
          page_path: fields.pagePath,
        }),
      },
    );

    if (!response.ok) {
      // Log the status, never the submitted values.
      console.error(`mover-review: insert rejected with ${response.status}`);
      return NextResponse.json(
        {
          ok: false,
          errors: {
            form: "We couldn't save that just now. Please try again, or email info@webm8agency.com.",
          },
        },
        { status: 502 },
      );
    }

    const rows = (await response.json()) as Array<{ id?: string }>;
    const id = rows?.[0]?.id;

    if (!id) {
      console.error("mover-review: insert returned no row");
      return NextResponse.json(
        {
          ok: false,
          errors: {
            form: "We couldn't save that just now. Please try again, or email info@webm8agency.com.",
          },
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch (error) {
    console.error("mover-review: insert failed", error);
    return NextResponse.json(
      {
        ok: false,
        errors: {
          form: "We couldn't save that just now. Please try again, or email info@webm8agency.com.",
        },
      },
      { status: 502 },
    );
  }
}

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const seen = (recentRequests.get(key) ?? []).filter(
    (at) => now - at < RATE_LIMIT_WINDOW_MS,
  );

  if (seen.length >= RATE_LIMIT_MAX) {
    recentRequests.set(key, seen);
    return true;
  }

  seen.push(now);
  recentRequests.set(key, seen);

  if (recentRequests.size > 5000) recentRequests.clear();
  return false;
}
