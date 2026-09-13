"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNav, brand } from "@/lib/site";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMoversPage = pathname?.startsWith("/movers") ?? false;
  const navItems = isMoversPage
    ? [
        { label: "How it works", href: "#how-it-works" },
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
      ]
    : primaryNav;
  const ctaHref = isMoversPage ? "#review-request" : "/audit";
  const ctaLabel = isMoversPage ? "Book my free review" : "Get a Free Review";

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
    document.body.style.overflow = "";
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href) ?? false;

  // These heroes are navy fields that run up behind the header, so until the
  // page scrolls the header has to read light-on-dark.
  const hasDarkHero = pathname === "/" || isMoversPage;
  const overDarkHero = hasDarkHero && !scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all",
        scrolled
          ? "border-b border-border bg-white/85 backdrop-blur"
          : "bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 text-lg font-bold tracking-tight",
            overDarkHero ? "text-bg" : "text-ink",
          )}
          aria-label={`${brand.name} home`}
        >
          <LogoMark invert={overDarkHero} />
          <span>{brand.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                overDarkHero
                  ? isActive(item.href)
                    ? "bg-white/10 text-bg"
                    : "text-muted-invert hover:bg-white/10 hover:text-bg"
                  : isActive(item.href)
                    ? "bg-ink/5 text-ink"
                    : "text-muted hover:bg-ink/5 hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {brand.phone ? (
            <a
              href={`tel:${brand.phone}`}
              className={cn(
                "text-base font-bold tracking-tight transition-colors",
                overDarkHero
                  ? "text-highlight hover:text-white"
                  : "text-ink hover:text-brand",
              )}
            >
              {brand.phoneLabel || brand.phone}
            </a>
          ) : null}
          <LinkButton href={ctaHref} size="md">
            {ctaLabel}
          </LinkButton>
        </div>

        <button
          type="button"
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors md:hidden",
            overDarkHero
              ? "border-white/25 bg-white/10 text-bg hover:bg-white/20"
              : "border-border bg-white text-ink hover:bg-ink/5",
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <Icon name={open ? "close" : "menu"} size={20} />
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-border bg-white md:hidden"
      >
        <nav
          aria-label="Mobile"
          className="container-page flex flex-col gap-1 py-5"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-xl px-4 py-3 text-base font-semibold transition-colors",
                isActive(item.href)
                  ? "bg-brand/10 text-brand"
                  : "text-ink hover:bg-ink/5",
              )}
            >
              {item.label}
            </Link>
          ))}
          <LinkButton
            href={ctaHref}
            size="lg"
            className="mt-3 justify-center"
            onClick={() => setOpen(false)}
          >
            {ctaLabel}
          </LinkButton>
          {brand.phone ? (
            <a
              href={`tel:${brand.phone}`}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl px-4 py-3 text-center text-base font-bold tracking-tight text-ink hover:bg-ink/5"
            >
              {brand.phoneLabel || brand.phone}
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

function LogoMark({ invert = false }: { invert?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-xl shadow-sm",
        invert ? "bg-bg text-ink" : "bg-ink text-white",
      )}
    >
      <span className="font-mono text-sm font-black tracking-tighter">W8</span>
      <span
        className={cn(
          "absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-signal ring-2",
          invert ? "ring-ink" : "ring-white",
        )}
      />
    </span>
  );
}
