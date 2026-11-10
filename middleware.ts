import { NextResponse, type NextRequest } from "next/server";
import { requestInstantMarket } from "./lib/instantPricing";

/** Select a static public page before the CDN cache; private order data stays in the session API. */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/" && process.env.INSTANT_WEBSITES_SITE !== "1") return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = requestInstantMarket(request.headers) === "US" ? "/instant/us/" : "/instant/";
  return NextResponse.rewrite(url);
}
export const config = { matcher: ["/", "/instant/:path*"] };
