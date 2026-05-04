import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { BrowserMockup } from "@/components/ui/BrowserMockup";
import { FinalCta } from "@/components/home/FinalCta";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { projects } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Our Work — Websites Built for Local Businesses",
  description:
    "Browse live website examples built by WebM8 for restaurants, cleaning companies, removals businesses, car rental brands, and travel agencies.",
  path: "/work/",
});

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Our work"
        title={
          <>
            Real Websites for Real{" "}
            <span className="text-brand">Local Businesses</span>
          </>
        }
        subtitle="Live examples across restaurants, cleaning, removals, car rental, and travel, shown with real desktop and mobile previews."
      />

      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="grid gap-16 lg:gap-24">
            {projects.map((project, index) => (
              <Reveal key={project.slug}>
                <article
                  id={project.slug}
                  className={cn(
                    "scroll-mt-24 grid gap-10 lg:gap-16",
                    index % 2 === 0
                      ? "lg:grid-cols-[1fr_1.1fr] lg:items-center"
                      : "lg:grid-cols-[1.1fr_1fr] lg:items-center",
                  )}
                >
                  <div
                    className={cn(index % 2 === 0 ? "" : "lg:order-2")}
                  >
                    <Eyebrow>{project.industry}</Eyebrow>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                      {project.title}
                    </h2>
                    <p className="mt-5 text-lg text-muted">
                      {project.description}
                    </p>

                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {project.outcomes.map((outcome) => (
                        <li
                          key={outcome}
                          className="flex items-start gap-3 rounded-xl border border-border bg-white p-3 text-sm text-ink transition-colors hover:border-ink/20"
                        >
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                            <Icon name="check" size={12} />
                          </span>
                          {outcome}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <LinkButton
                        href={project.siteUrl}
                        variant="primary"
                        target="_blank"
                        rel="noreferrer"
                      >
                        View live site
                        <Icon name="arrow" size={16} />
                      </LinkButton>
                      <Link
                        href="/audit"
                        className="btn-arrow inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
                      >
                        Request similar site
                        <Icon name="arrow" size={14} />
                      </Link>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "relative",
                      index % 2 === 0 ? "" : "lg:order-1",
                    )}
                  >
                    <div
                      aria-hidden
                      className="animate-drift-slow absolute -inset-6 rounded-[32px] bg-gradient-to-br from-brand/25 to-accent/25 blur-2xl"
                    />
                    <BrowserMockup
                      palette={project.palette}
                      title={project.title}
                      industry={project.industry}
                      siteUrl={project.siteUrl}
                      screenshots={project.screenshots}
                      className="relative"
                    />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
