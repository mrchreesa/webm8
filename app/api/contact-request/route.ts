import { acceptContact } from "@/lib/contactIntake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const recent = new Map<string, number[]>();

export async function POST(request: Request) {
  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const attempts = (recent.get(key) || []).filter(
    (time) => now - time < 600_000,
  );
  if (attempts.length >= 5)
    return Response.json(
      {
        ok: false,
        errors: {
          form: "Please wait a few minutes before trying again, or email info@webm8agency.com.",
        },
      },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  if (recent.size > 5000) recent.clear();
  recent.set(key, [...attempts, now]);
  let input: unknown;
  try {
    const body = await request.text();
    if (body.length > 20_000)
      return Response.json(
        {
          ok: false,
          errors: {
            form: "That enquiry is too long. Please shorten your message.",
          },
        },
        { status: 413 },
      );
    input = JSON.parse(body);
  } catch {
    return Response.json(
      { ok: false, errors: { form: "That request could not be read." } },
      { status: 400 },
    );
  }
  const result = await acceptContact(input);
  return Response.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}
