import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  markBookingCancelled,
  verifyAndSaveCalBooking,
} from "@/lib/calBooking";
import { reviewCalendarEventTypeId } from "@/lib/movers";
import { isUuid } from "@/lib/previewAccess";
import { supabaseTableRequest } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebhookPayload = {
  triggerEvent?: string;
  payload?: {
    uid?: string;
    eventTypeId?: number;
    attendees?: Array<{ timeZone?: string }>;
    bookingFieldsResponses?: Record<string, unknown>;
    responses?: Record<string, { value?: unknown } | unknown>;
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.CAL_WEBHOOK_SECRET;
  const signature = request.headers.get("x-cal-signature-256") || "";

  if (!secret || !validSignature(rawBody, signature, secret)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let event: WebhookPayload;
  try {
    event = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payload = event.payload;
  if (!payload?.uid || payload.eventTypeId !== reviewCalendarEventTypeId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const requestId =
      bookingField(payload, "webm8-request-id") ||
      (await findRequestIdByBookingUid(payload.uid));
    if (!requestId || !isUuid(requestId)) {
      console.error("mover-preview: Cal.com webhook had no linked request id");
      return NextResponse.json({ ok: true });
    }

    if (event.triggerEvent === "BOOKING_CANCELLED") {
      await markBookingCancelled(requestId);
    } else if (
      event.triggerEvent === "BOOKING_CREATED" ||
      event.triggerEvent === "BOOKING_RESCHEDULED"
    ) {
      await verifyAndSaveCalBooking({
        requestId,
        bookingUid: payload.uid,
        visitorTimeZone: payload.attendees?.[0]?.timeZone,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("mover-preview: Cal.com webhook processing failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

function bookingField(
  payload: NonNullable<WebhookPayload["payload"]>,
  slug: string,
) {
  const direct = payload.bookingFieldsResponses?.[slug];
  if (typeof direct === "string") return direct;

  const response = payload.responses?.[slug];
  if (typeof response === "string") return response;
  if (
    response &&
    typeof response === "object" &&
    "value" in response &&
    typeof response.value === "string"
  ) {
    return response.value;
  }
  return null;
}

async function findRequestIdByBookingUid(uid: string) {
  const rows = await supabaseTableRequest<Array<{ id: string }>>(
    "agency_review_requests",
    { query: `select=id&booking_uid=eq.${encodeURIComponent(uid)}&limit=1` },
  );
  return rows[0]?.id || null;
}

function validSignature(body: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const supplied = signature.replace(/^sha256=/, "");
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
}
