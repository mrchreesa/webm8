
"use client";

import { analyticsName } from "@/lib/analyticsNames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { brand, intakeEmail } from "@/lib/site";

export function Footer({ agencyUrl = "" }: { agencyUrl?: string }) {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  // Instant Websites opens on a navy hero, so its footer closes the page on
  // the same ground. Every other page keeps the white footer.
  const dark = Boolean(agencyUrl) || pathname === "/instant/" || pathname === "/instant";
  const heading = cn("font-mono text-xs font-semibold uppercase tracking-[0.18em]", dark ? "text-brand" : "text-ink");
  const body = dark ? "text-muted-invert" : "text-muted";
  const link = cn("transition-colors", dark ? "text-muted-invert hover:text-white" : "text-muted hover:text-link");

  return (
    <footer
      data-analytics-section="Footer"
      className={cn(
        "border-t",
        dark
          ? "surface-dark border-white/10 bg-[radial-gradient(55%_70%_at_100%_100%,rgb(43_108_252_/_0.22),transparent_70%),linear-gradient(#0a2146,var(--color-night))] text-white"
          : "border-border bg-white",
      )}
    >
      <div className="container-page py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link data-analytics-id="Logo - Home"
              href="/"
              className={cn("flex items-center gap-2 text-lg font-bold tracking-tight", dark ? "text-white" : "text-ink")}
              aria-label={`${brand.name} home`}
            >
              <BrandLogo />
              {brand.name}
            </Link>
            <p className={cn("mt-4 text-sm leading-relaxed", body)}>
              Clear, professional websites that help local businesses in the
              US and UK get more calls, bookings, and customers.
            </p>
          </div>

          <FooterCol
            title="Site"
            heading={heading}
            link={link}
            baseUrl={agencyUrl}
            links={[
              { label: "Home", href: "/" },
              { label: "Websites for Movers", href: "/movers/" },
              { label: "Work", href: "/work" },
              { label: "Free Demo", href: "/free-demo/" },
            ]}
          />
          <FooterCol
            title="Company"
            heading={heading}
            link={link}
            baseUrl={agencyUrl}
            links={[
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Pricing", href: "/pricing/" },
              { label: "Privacy", href: "/privacy/" },
            ]}
          />

          <div>
            <h3 className={heading}>
              Get in touch
            </h3>
            <ul className={cn("mt-4 space-y-3 text-sm", body)}>
              <li>
                <a data-analytics-id="Email WebM8"
                  className={link}
                  href={`mailto:${intakeEmail}`}
                >
                  {intakeEmail}
                </a>
              </li>
              <li>Reply within 1 business day</li>
            </ul>
          </div>
        </div>

        <div className={cn("mt-12 flex flex-col items-start justify-between gap-4 border-t pt-6 text-xs md:flex-row md:items-center", dark ? "border-white/10" : "border-border", body)}>
          <p>© {year} {brand.name}. All rights reserved.</p>
          <p>
            Websites for local businesses that want more calls, bookings, and
            customers.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
  baseUrl = "",
  heading,
  link,
}: {
  title: string;
  links: { label: string; href: string }[];
  baseUrl?: string;
  heading: string;
  link: string;
}) {
  return (
    <div>
      <h3 className={heading}>
        {title}
      </h3>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link data-analytics-id={analyticsName(l.label)}
              href={`${baseUrl}${l.href}`}
              className={link}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
