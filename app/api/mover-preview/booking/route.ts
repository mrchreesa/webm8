import { NextResponse } from "next/server";
import { verifyAndSaveCalBooking } from "@/lib/calBooking";
import { isUuid, verifyPreviewAccessToken } from "@/lib/previewAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const requestId = typeof body.requestId === "string" ? body.requestId : "";
  const token = typeof body.token === "string" ? body.token : "";
  const bookingUid = typeof body.bookingUid === "string" ? body.bookingUid : "";
  const visitorTimeZone =
    typeof body.visitorTimeZone === "string"
      ? body.visitorTimeZone.slice(0, 100)
      : undefined;

  if (
    !isUuid(requestId) ||
    !verifyPreviewAccessToken(requestId, token) ||
    !bookingUid ||
    bookingUid.length > 200
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const booking = await verifyAndSaveCalBooking({
      requestId,
      bookingUid,
      visitorTimeZone,
    });
    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    console.error("mover-preview: booking verification failed", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "We couldn't verify the appointment in this page yet. Check your Cal.com confirmation email, or return to this page in a moment.",
      },
      { status: 502 },
    );
  }
}
