import { previewCalendarEventTypeId } from "@/lib/movers";
import { supabaseTableRequest } from "@/lib/supabaseAdmin";

export type ConfirmedBooking = {
  uid: string;
  start: string;
  end: string;
  timeZone: string;
  format: string;
  title: string;
};

type CalBooking = {
  uid?: string;
  status?: string;
  start?: string;
  end?: string;
  title?: string;
  location?: string;
  eventTypeId?: number;
  eventType?: { id?: number };
  attendees?: Array<{ email?: string; timeZone?: string }>;
  bookingFieldsResponses?: Record<string, unknown>;
};

type RequestIdentity = {
  id: string;
  email: string;
};

export async function verifyAndSaveCalBooking({
  requestId,
  bookingUid,
  visitorTimeZone,
}: {
  requestId: string;
  bookingUid: string;
  visitorTimeZone?: string;
}) {
  const requestRows = await supabaseTableRequest<RequestIdentity[]>(
    "agency_review_requests",
    { query: `select=id,email&id=eq.${requestId}&limit=1` },
  );
  const intake = requestRows[0];
  if (!intake) throw new Error("Preview request was not found");

  const calApiKey = process.env.CAL_API_KEY;
  if (!calApiKey) throw new Error("Cal.com verification is not configured");

  const response = await fetch(
    `https://api.cal.com/v2/bookings/${encodeURIComponent(bookingUid)}`,
    {
      headers: {
        Authorization: `Bearer ${calApiKey}`,
        "cal-api-version": "2026-02-25",
      },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error(`Cal.com booking lookup failed with ${response.status}`);
  }

  const result = (await response.json()) as { data?: CalBooking | CalBooking[] };
  const booking = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!booking?.uid || !booking.start || !booking.end) {
    throw new Error("Cal.com returned an incomplete booking");
  }

  const eventTypeId = booking.eventType?.id ?? booking.eventTypeId;
  if (eventTypeId !== previewCalendarEventTypeId) {
    throw new Error("The booking belongs to another event type");
  }
  if (booking.status?.toLowerCase() !== "accepted") {
    throw new Error("The booking is not confirmed by Cal.com");
  }

  const attendee = booking.attendees?.find(
    (item) => item.email?.toLowerCase() === intake.email.toLowerCase(),
  );
  if (!attendee) throw new Error("The booking contact does not match the request");

  const linkedRequest = booking.bookingFieldsResponses?.["webm8-request-id"];
  if (typeof linkedRequest === "string" && linkedRequest !== requestId) {
    throw new Error("The booking is linked to another preview request");
  }

  const confirmed: ConfirmedBooking = {
    uid: booking.uid,
    start: booking.start,
    end: booking.end,
    timeZone: attendee.timeZone || visitorTimeZone || "UTC",
    format: formatLocation(booking.location),
    title: booking.title || "WebM8 website preview call",
  };

  await saveBooking(requestId, confirmed);
  return confirmed;
}

export async function saveBooking(
  requestId: string,
  booking: ConfirmedBooking,
) {
  await supabaseTableRequest("agency_review_requests", {
    method: "PATCH",
    query: `id=eq.${requestId}`,
    prefer: "return=minimal",
    body: {
      stage: "booked",
      booking_status: "booked",
      booking_uid: booking.uid,
      booking_start: booking.start,
      booking_end: booking.end,
      booking_timezone: booking.timeZone,
      booking_format: booking.format,
      booking_title: booking.title,
    },
  });
}

export async function markBookingCancelled(requestId: string) {
  await supabaseTableRequest("agency_review_requests", {
    method: "PATCH",
    query: `id=eq.${requestId}`,
    prefer: "return=minimal",
    body: { stage: "received", booking_status: "cancelled" },
  });
}

function formatLocation(location?: string) {
  if (!location) return "Video call";
  if (/cal\.com|integrations:daily|cal-video/i.test(location)) {
    return "Cal.com video call";
  }
  if (/zoom/i.test(location)) return "Zoom video call";
  if (/meet\.google/i.test(location)) return "Google Meet video call";
  return "Video call";
}
