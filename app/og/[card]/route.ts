import { renderShareImage } from "@/components/og/shareImage";
import { isShareCardName, shareCardNames, shareImagePath } from "@/lib/shareCards";

// Each card is drawn once, at build time, and served as a static file.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return shareCardNames.map((name) => ({
    card: shareImagePath(name).split("/").pop(),
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ card: string }> },
) {
  const name = (await params).card.replace(/\.jpg$/, "");
  if (!isShareCardName(name)) return new Response("Not found", { status: 404 });
  return renderShareImage(name);
}
