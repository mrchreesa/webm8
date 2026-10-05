import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { projects, type Project } from "@/lib/site";

/**
 * The strongest demo sites, in the order shown, from different kinds of
 * business so a lead can picture their own. The first `featuredCount` span
 * the full width; the rest pair up. The line under each name is shorter than
 * the project description in lib/site.ts on purpose: this page is read on a
 * phone, between an ad and a phone call.
 *
 * `ground` and `glow` are taken from each site's own palette, so every
 * preview sits in its client's colours rather than ours. They are off-system
 * on purpose, like the palettes in BrowserMockup.
 */
const showcase: { slug: Project["slug"]; line: string; ground: string; glow: string }[] = [
  {
    slug: "allen-fitness",
    line: "A high-energy brand site that takes shoppers straight to their fit.",
    ground: "#171714",
    glow: "rgb(215 240 74 / 0.4)",
  },
  {
    slug: "stitch-house",
    line: "A heritage look for a London tailor, with fittings one tap away.",
    ground: "#0d1729",
    glow: "rgb(201 161 74 / 0.5)",
  },
  {
    slug: "solvers-cleaning",
    line: "A bold cleaning site built around fast quotes and WhatsApp.",
    ground: "#111b63",
    glow: "rgb(155 225 93 / 0.42)",
  },
  {
    slug: "removals",
    line: "A removals site that turns visitors into estimate requests.",
    ground: "#0b4fb3",
    glow: "rgb(125 196 255 / 0.6)",
  },
  {
    slug: "ideal-baby",
    line: "A bilingual family store site that brings parents through the door.",
    ground: "#f3bd2e",
    glow: "rgb(240 99 63 / 0.45)",
  },
  {
    slug: "cleaning",
    line: "A bright home cleaning site that makes packages easy to compare.",
    ground: "#211c54",
    glow: "rgb(99 209 247 / 0.5)",
  },
];

/** Two, so the four that follow fill their rows. */
const featuredCount = 2;

const examples = showcase.flatMap(({ slug, ...art }) => {
  const project = projects.find((item) => item.slug === slug);
  return project?.siteUrl ? [{ ...project, ...art, siteUrl: project.siteUrl }] : [];
});

type Example = (typeof examples)[number];

export function ThankYouWork() {
  return (
    <section
      id="examples"
      aria-labelledby="examples-title"
      className="scroll-mt-16 overflow-x-clip py-14 md:scroll-mt-20 md:py-24"
    >
      <div className="container-page">
        <h2
          id="examples-title"
          className="max-w-2xl text-[clamp(2rem,7vw,3.4rem)] leading-[1.02] font-bold text-balance text-ink"
        >
          Here&rsquo;s what we could create for your business
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Every WebM8 website is designed around the individual business. These
          are a few recent examples.
        </p>

        <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:gap-8">
          {examples.map((example, index) => (
            <li key={example.slug} className={cn(index < featuredCount && "md:col-span-2")}>
              <ExampleCard example={example} position={index + 1} featured={index < featuredCount} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ExampleCard({
  example,
  position,
  featured,
}: {
  example: Example;
  position: number;
  featured: boolean;
}) {
  const host = new URL(example.siteUrl).hostname;
  const tracking = {
    "data-lead-event": "portfolio_example_clicked",
    "data-lead-example": example.slug,
    "data-lead-position": position,
  };

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-border bg-surface shadow-card",
        featured && "lg:grid lg:grid-cols-[1.45fr_1fr]",
      )}
    >
      {/* The preview is a second, larger way into the same site, so it stays
          out of the tab order and the accessibility tree. */}
      <a
        href={example.siteUrl}
        target="_blank"
        rel="noreferrer"
        tabIndex={-1}
        aria-hidden
        {...tracking}
        data-lead-placement="preview"
        className="group relative block aspect-[4/3.3] overflow-hidden"
        style={{
          background: `radial-gradient(75% 70% at 78% 62%, ${example.glow}, transparent 70%), ${example.ground}`,
        }}
      >
        <div className="absolute top-[8%] left-[5%] w-[74%] overflow-hidden rounded-lg bg-white shadow-[0_0_0_1px_rgb(255_255_255/0.12),0_30px_50px_-24px_rgb(0_0_0/0.7)] transition-transform duration-500 ease-brand group-hover:-translate-y-1">
          <div className="flex h-[clamp(14px,4.2%,22px)] items-center gap-1 bg-[#e9edf3] px-2">
            <i className="h-1.5 w-1.5 rounded-full bg-[#c3cad5]" />
            <i className="h-1.5 w-1.5 rounded-full bg-[#c3cad5]" />
            <i className="h-1.5 w-1.5 rounded-full bg-[#c3cad5]" />
          </div>
          <div className="relative aspect-[16/9]">
            <Image
              src={example.screenshots.desktop}
              alt=""
              fill
              sizes="(min-width: 1024px) 560px, (min-width: 768px) 36vw, 78vw"
              className="object-cover object-top"
            />
          </div>
        </div>

        <div className="absolute top-[22%] right-[5%] w-[32%] rotate-[3deg] rounded-[1.15rem] bg-[#0b1220] p-[1.4%] shadow-[0_0_0_1px_rgb(255_255_255/0.14),0_40px_60px_-24px_rgb(0_0_0/0.85)] transition-transform duration-500 ease-brand group-hover:-translate-y-2 group-hover:rotate-0">
          <div className="relative aspect-[420/900] overflow-hidden rounded-[0.85rem]">
            <Image
              src={example.screenshots.mobile}
              alt=""
              fill
              sizes="(min-width: 1024px) 240px, (min-width: 768px) 15vw, 32vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </a>

      <div className="flex flex-1 flex-col p-5 md:p-6 lg:justify-center lg:p-8">
        <p className="text-sm font-medium text-muted">{example.industry}</p>
        <h3 className="mt-1 font-display text-2xl leading-tight font-bold text-ink md:text-[1.7rem]">
          {example.name}
        </h3>
        <p className="mt-2 leading-relaxed text-ink/80">{example.line}</p>

        <a
          href={example.siteUrl}
          target="_blank"
          rel="noreferrer"
          {...tracking}
          data-lead-placement="button"
          className="btn-arrow mt-5 inline-flex min-h-12 items-center justify-center gap-2 self-stretch rounded-full border border-border bg-white px-5 font-semibold tracking-tight text-ink transition-colors hover:border-ink/25 hover:bg-ink/5 sm:self-start lg:mt-6"
        >
          View website
          <Icon name="arrow" size={16} className="-rotate-45" aria-hidden />
          <span className="sr-only">
            {" "}
            for {example.name} at {host} (opens in a new tab)
          </span>
        </a>
      </div>
    </article>
  );
}
