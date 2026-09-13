import { NextResponse } from "next/server";
import { createPreviewAccessToken, isUuid, verifyPreviewAccessToken } from "@/lib/previewAccess";
import { validateReviewRequest } from "@/lib/reviewRequest";
import { supabaseTableRequest } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLE = "agency_review_requests";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const recentRequests = new Map<string, number[]>();

type RequestRow = {
  id: string;
  contact_name: string;
  email: string;
  company_name: string;
  booking_status: "unbooked" | "booked" | "cancelled";
  booking_uid: string | null;
  booking_start: string | null;
  booking_end: string | null;
  booking_timezone: string | null;
  booking_format: string | null;
  booking_title: string | null;
  materials_submitted_at: string | null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  const token = url.searchParams.get("token") || "";

  if (!isUuid(id) || !verifyPreviewAccessToken(id, token)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  try {
    const rows = await supabaseTableRequest<RequestRow[]>(TABLE, {
        query:
          `select=id,contact_name,email,company_name,booking_status,booking_uid,` +
          `booking_start,booking_end,booking_timezone,booking_format,booking_title,materials_submitted_at&id=eq.${id}&limit=1`,
      });
    const row = rows[0];
    if (!row) return NextResponse.json({ ok: false }, { status: 404 });

    return NextResponse.json({ ok: true, request: publicRequest(row), token });
  } catch (error) {
    console.error("mover-preview: request lookup failed", error);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}

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
    return NextResponse.json(
      { ok: false, errors: validation.errors },
      { status: 400 },
    );
  }

  const fields = validation.value;

  try {
    const existing = await findBySubmissionKey(fields.submissionKey);
    if (existing) return acceptedResponse(existing);

    const rows = await supabaseTableRequest<RequestRow[]>(TABLE, {
      method: "POST",
      prefer: "return=representation",
      body: {
        contact_name: fields.contactName,
        company_name: fields.companyName,
        email: fields.email,
        phone: fields.phone,
        website_url: fields.businessLink,
        business_link: fields.businessLink,
        has_website: Boolean(
          fields.businessLink &&
            !/(facebook\.com|instagram\.com|maps\.app\.goo\.gl|google\.[^/]+\/maps)/i.test(
              fields.businessLink,
            ),
        ),
        main_city_state: fields.mainCityState,
        services: fields.services,
        submission_key: fields.submissionKey,
        request_type: "preview",
        plan: fields.plan,
        billing: fields.billing,
        utm_source: fields.utmSource,
        utm_medium: fields.utmMedium,
        utm_campaign: fields.utmCampaign,
        utm_content: fields.utmContent,
        utm_term: fields.utmTerm,
        referrer: fields.referrer,
        page_path: fields.pagePath,
      },
    });

    const row = rows[0];
    if (!row?.id) throw new Error("Insert returned no row");
    return acceptedResponse(row);
  } catch (error) {
    // A simultaneous retry can race the initial insert. Resolve it as the same
    // saved request instead of creating a second lead or showing a false error.
    try {
      const existing = await findBySubmissionKey(fields.submissionKey);
      if (existing) return acceptedResponse(existing);
    } catch {
      // The original error is more useful in server logs.
    }

    console.error("mover-preview: insert failed", error);
    return NextResponse.json(
      {
        ok: false,
        errors: {
          form: "We couldn't save that just now. Your information is still in the form — please try again, or email info@webm8agency.com.",
        },
      },
      { status: 502 },
    );
  }
}

async function findBySubmissionKey(submissionKey: string) {
  const rows = await supabaseTableRequest<RequestRow[]>(TABLE, {
    query:
      `select=id,contact_name,email,company_name,booking_status,booking_uid,` +
      `booking_start,booking_end,booking_timezone,booking_format,booking_title,materials_submitted_at` +
      `&submission_key=eq.${submissionKey}&limit=1`,
  });
  return rows[0] || null;
}

function acceptedResponse(row: RequestRow) {
  const token = createPreviewAccessToken(row.id);
  return NextResponse.json(
    { ok: true, request: publicRequest(row), token },
    { status: 200 },
  );
}

function publicRequest(row: RequestRow) {
  return {
    id: row.id,
    name: row.contact_name,
    email: row.email,
    companyName: row.company_name,
    bookingStatus: row.booking_status,
    booking: row.booking_uid
      ? {
          uid: row.booking_uid,
          start: row.booking_start,
          end: row.booking_end,
          timeZone: row.booking_timezone,
          format: row.booking_format,
          title: row.booking_title,
        }
      : null,
    materialsSubmitted: Boolean(row.materials_submitted_at),
  };
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
