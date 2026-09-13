import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { brand, projects } from "@/lib/site";

export function Hero() {
	return (
		<section className="relative -mt-16 overflow-hidden bg-ink pt-16 text-bg md:-mt-20 md:pt-20">
			<div className="container-page relative grid gap-12 pt-10 pb-14 md:grid-cols-2 md:items-center md:gap-12 md:pt-12 md:pb-18 lg:gap-14">
				<div>
					<div className="animate-rise inline-flex items-center gap-2 rounded-full border border-ink-raised bg-ink-raised/40 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-invert">
						<span className="inline-block h-1.5 w-1.5 rounded-full bg-info" />
						For US local businesses
					</div>

					<h1 className="animate-rise mt-6 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl" style={{ animationDelay: "80ms" }}>
						Websites for Local Businesses That Want More{" "}
						<span className="relative inline-block">
							<span className="relative z-10">Calls</span>
							<Underline />
						</span>
						, Bookings, and Customers.
					</h1>

					<p className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-muted-invert md:text-xl" style={{ animationDelay: "160ms" }}>
						We build and look after professional websites for US local businesses. Every page is made to help people understand your services, trust you, and get in touch.
					</p>

					<div className="animate-rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
						<LinkButton href="/audit" size="lg">
							Get a Free Website Review
							<Icon name="arrow" size={18} />
						</LinkButton>
						<LinkButton href="/contact/" size="lg" variant="outline-invert">
							Get a Fast Estimate
							<Icon name="arrow" size={18} />
						</LinkButton>
					</div>

					<div className="animate-rise mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-muted-invert" style={{ animationDelay: "320ms" }}>
						{brand.phone ? (
							<a href={`tel:${brand.phone}`} className="font-sans text-base font-bold tracking-tight text-highlight hover:underline">
								{brand.phoneLabel || brand.phone}
							</a>
						) : null}
						<span className="inline-flex items-center gap-1.5">
							<span className="text-highlight" aria-hidden>
								★★★★★
							</span>
							Rated by local owners
						</span>
						<span className="inline-flex items-center gap-1.5 text-info">
							<span aria-hidden>●</span>
							Taking new projects
						</span>
					</div>

					<ul className="animate-rise mt-7 flex flex-wrap gap-2 border-t border-ink-raised pt-6" style={{ animationDelay: "380ms" }}>
						{showcaseProjects.map((project) => (
							<li key={project.slug} className="rounded-md bg-ink-raised px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider">
								{project.industry}
							</li>
						))}
					</ul>
				</div>

				<div className="animate-rise -mt-4 md:-mt-10" style={{ animationDelay: "360ms" }}>
					<HeroShowcase />
				</div>
			</div>
		</section>
	);
}

function Underline() {
	return (
		<svg className="absolute -bottom-1 left-0 h-3 w-full text-signal" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none" aria-hidden>
			<path d="M2 9 C 60 2, 140 2, 198 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
		</svg>
	);
}

const showcaseProjects = ["removals", "cleaning", "restaurant", "car-rental", "travel-agency"].flatMap((slug) => projects.find((project) => project.slug === slug) ?? []);

function HeroShowcase() {
	return (
		<div className="relative mx-auto w-full max-w-[620px]" aria-hidden="true">
			<div className="relative rounded-[1.6rem] border border-ink-raised bg-ink-deep p-2 shadow-card-hover md:p-2.5">
				<div className="overflow-hidden rounded-[1.1rem] border border-border bg-white">
					<div className="flex items-center gap-1.5 border-b border-border bg-bg-alt px-3 py-2 md:gap-2 md:px-4">
						<span className="h-2.5 w-2.5 rounded-full bg-error/80" />
						<span className="h-2.5 w-2.5 rounded-full bg-highlight" />
						<span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
						<div className="ml-2 min-w-0 flex-1">
							<div className="mx-auto h-6 max-w-xs truncate rounded-md border border-border bg-white px-3 text-center font-mono text-[10px] leading-6 text-muted">live website preview</div>
						</div>
					</div>

					<div className="relative aspect-[16/10] overflow-hidden bg-bg-alt p-1.5 md:p-2">
						{showcaseProjects.map((project, index) => (
							<div key={project.slug} className="hero-showcase-slide absolute inset-1.5 md:inset-2" style={{ animationDelay: `${index * 4}s` }}>
								<Image
									src={project.screenshots.desktop}
									alt=""
									fill
									priority={index === 0}
									loading={index === 0 ? undefined : "lazy"}
									fetchPriority={index === 0 ? "high" : "low"}
									decoding={index === 0 ? "sync" : "async"}
									sizes="(min-width: 1024px) min(620px, 44vw), (min-width: 768px) min(620px, 48vw), min(620px, 90vw)"
									className="rounded-lg object-contain object-top"
								/>
								<div className="absolute left-3 top-3 rounded-md bg-ink px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-bg">{project.industry}</div>
							</div>
						))}
					</div>
				</div>

				<div className="absolute -bottom-5 right-2 w-[26%] min-w-[102px] max-w-[148px] md:-bottom-6 md:-right-4">
					<div className="rounded-[1.5rem] border border-ink-raised bg-ink-deep p-1.5 shadow-card-hover">
						<div className="relative aspect-[9/19] overflow-hidden rounded-[1.05rem] bg-white p-1">
							<span className="absolute left-1/2 top-1.5 z-20 h-1 w-8 -translate-x-1/2 rounded-full bg-ink/40" />
							{showcaseProjects.map((project, index) => (
								<div key={project.slug} className="hero-showcase-slide absolute inset-1" style={{ animationDelay: `${index * 4}s` }}>
									<Image
										src={project.screenshots.mobile}
										alt=""
										fill
										priority={index === 0}
										loading={index === 0 ? undefined : "lazy"}
										fetchPriority={index === 0 ? "high" : "low"}
										decoding={index === 0 ? "sync" : "async"}
										sizes="148px"
										className="rounded-[0.85rem] object-contain object-top"
									/>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className={cn("absolute bottom-4 left-4 hidden items-center gap-1.5 rounded-full bg-ink/80 px-3 py-2 backdrop-blur md:flex")}>
					{showcaseProjects.map((project, index) => (
						<span key={project.slug} className="hero-showcase-dot h-1.5 w-5 rounded-full" style={{ animationDelay: `${index * 4}s` }} />
					))}
				</div>
			</div>
		</div>
	);
}
