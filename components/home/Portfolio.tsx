import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { BrowserMockup } from "@/components/ui/BrowserMockup";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { projects, type Project } from "@/lib/site";

type PortfolioProps = {
  limit?: number;
  variant?: "section" | "bare";
};

export function Portfolio({ limit, variant = "section" }: PortfolioProps) {
  const items = limit ? projects.slice(0, limit) : projects;

  const grid = (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((project, i) => (
          <Reveal key={project.slug} delay={i * 80}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>

      {limit && projects.length > limit && (
        <Reveal delay={200}>
          <div className="mt-12 flex justify-center">
            <Link
              href="/work"
              className="btn-arrow inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
            >
              View full portfolio
              <Icon name="arrow" size={16} />
            </Link>
          </div>
        </Reveal>
      )}
    </>
  );

  if (variant === "bare") {
    return grid;
  }

  return (
    <Section
      eyebrow="Recent work"
      title="Live Websites Built to Look Good on Every Screen"
      subtitle="A sample of live sites presented with real desktop and mobile screenshots, so visitors can see the responsive experience before they click through."
    >
      {grid}
    </Section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="p-4">
        <BrowserMockup
          palette={project.palette}
          industry={project.industry}
          title={project.title}
          siteUrl={project.siteUrl}
          screenshots={project.screenshots}
          compact
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 border-t border-border p-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-ink/5 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">
            {project.industry}
          </span>
        </div>
        <h3 className="text-lg font-bold text-ink">{project.title}</h3>
        <p className="text-sm leading-relaxed text-muted">
          {project.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
          <a
            href={project.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-arrow inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
          >
            View live site
            <Icon name="arrow" size={14} />
          </a>
          <Link
            href={`/work#${project.slug}`}
            className="text-sm font-semibold text-muted transition-colors hover:text-ink"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
