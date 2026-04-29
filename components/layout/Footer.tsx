import Link from "next/link";
import { brand, intakeEmail, primaryNav } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-white">
      <div className="container-page py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
                <span className="font-mono text-sm font-black tracking-tighter">
                  W8
                </span>
              </span>
              {brand.name}
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              High-converting websites for US local businesses. More calls,
              more bookings, more customers. Monthly plans from $197.
            </p>
          </div>

          <FooterCol title="Site" links={primaryNav.slice(0, 4)} />
          <FooterCol
            title="Company"
            links={[
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Free Website Audit", href: "/audit" },
            ]}
          />

          <div>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>
                <a
                  className="transition-colors hover:text-brand"
                  href={`mailto:${intakeEmail}`}
                >
                  {intakeEmail}
                </a>
              </li>
              <li>United States · Remote-first</li>
              <li>Reply within 1 business day</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted md:flex-row md:items-center">
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
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink">
        {title}
      </h3>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-muted transition-colors hover:text-brand"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
