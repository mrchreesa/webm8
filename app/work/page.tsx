
import { analyticsName } from "@/lib/analyticsNames";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { BrowserMockup } from "@/components/ui/BrowserMockup";
import { DemoClosing } from "@/components/demo/DemoClosing";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { projects } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Website Examples: Demo Sites for Local Businesses",
  description:
    "Demo websites WebM8 designed for local businesses: tailors, cleaners, a heating engineer, removals, clinics and shops. See each on a computer and a phone.",
  path: "/work/",
  shareCard: "work",
});

export default function WorkPage() {
  return (
    <>
      <PageHero
        title="Demo sites we designed for local businesses"
        subtitle="Each one is a working website, built around how that business's customers search, decide and get in touch. See it on a computer and on a phone."
      />

      <section data-analytics-section="Work gallery" className="overflow-x-clip py-16 md:py-24">
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
                  <div className={cn(index % 2 === 0 ? "" : "lg:order-2")}>
                    <Eyebrow>{project.industry}</Eyebrow>
                    <p className="mt-4 text-sm font-semibold text-muted">{project.name}</p>
                    <h2 className="mt-1 text-3xl font-bold text-ink md:text-4xl">
                      {project.title}
                    </h2>
                    <p className="mt-5 text-lg text-muted">{project.description}</p>

                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {project.outcomes.map((outcome) => (
                        <li
                          key={outcome}
                          className="flex items-start gap-3 rounded-xl border border-border bg-white p-3 text-sm text-ink"
                        >
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                            <Icon name="check" size={12} />
                          </span>
                          {outcome}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 flex flex-wrap gap-3">
                      {project.siteUrl ? (
                        <LinkButton data-analytics-id={analyticsName(`Open ${project.name}`)} href={project.siteUrl} target="_blank" rel="noreferrer">
                          Open the live site
                          <Icon name="arrow" size={16} className="-rotate-45" />
                        </LinkButton>
                      ) : null}
                      <LinkButton data-analytics-id={analyticsName(`Request a demo like ${project.name}`)} href="/free-demo/" variant="ghost">
                        Get a free demo like this
                      </LinkButton>
                    </div>
                  </div>
                  <div className={cn("relative", index % 2 === 0 ? "" : "lg:order-1")}>
                    <div
                      aria-hidden
                      className="animate-drift-slow absolute -inset-6 rounded-[32px] bg-gradient-to-br from-electric/20 to-accent/20 blur-2xl"
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

      <DemoClosing />
    </>
  );
}
