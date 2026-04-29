import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { AmbientBlobs } from "@/components/ui/AmbientBlobs";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { projects } from "@/lib/site";

export function Hero() {
	return (
		<section className="relative overflow-hidden">
			<AmbientBlobs variant="light" />

			<div className="container-page relative grid gap-12 pt-10 pb-16 md:grid-cols-2 md:items-center md:gap-12 md:pt-12 md:pb-20 lg:gap-14">
				<div>
					<div className={cn("inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-muted backdrop-blur", "animate-rise")}>
						<span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
						For US local businesses
					</div>

					<h1 className="animate-rise mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-ink md:text-6xl lg:text-7xl" style={{ animationDelay: "80ms" }}>
						Websites for Local Businesses That Want More{" "}
						<span className="relative inline-block">
							<span className="relative z-10">Calls</span>
							<Underline />
						</span>
						, Bookings, and Customers.
					</h1>

					<p className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-muted md:text-xl" style={{ animationDelay: "160ms" }}>
						We build professional, conversion-focused websites for US local businesses, designed to turn visitors into real enquiries, bookings, and paying customers.
					</p>

					<div className="animate-rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
						<LinkButton href="/audit" size="lg">
							Get a Free Website Audit
							<Icon name="arrow" size={18} />
						</LinkButton>
						<LinkButton href="/pricing" size="lg" variant="ghost">
							View Pricing
							<Icon name="arrow" size={18} />
						</LinkButton>
					</div>

					<p className="animate-rise mt-6 text-sm text-muted" style={{ animationDelay: "320ms" }}>
						Built for local service businesses, contractors, restaurants, salons, cleaners, and more.
					</p>
				</div>

				<div className="animate-rise -mt-4 md:-mt-30" style={{ animationDelay: "360ms" }}>
					<HeroShowcase />
				</div>
			</div>
		</section>
	);
}

function Underline() {
	return (
		<svg className="absolute -bottom-1 left-0 h-3 w-full text-brand/50" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none" aria-hidden>
			<path d="M2 9 C 60 2, 140 2, 198 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
		</svg>
	);
}

const showcaseProjects = ["removals", "cleaning", "restaurant", "car-rental", "travel-agency"].flatMap((slug) => projects.find((project) => project.slug === slug) ?? []);

function HeroShowcase() {
	return (
		<div className="relative mx-auto w-full max-w-[640px]" aria-hidden="true">
			<div className="absolute inset-6 rounded-[2rem] bg-white/70 shadow-card ring-1 ring-ink/5" />
			<div className="relative rounded-[2rem] border border-white/80 bg-white/55 p-2 shadow-card-hover ring-1 ring-ink/10 backdrop-blur md:p-2.5">
				<div className="overflow-hidden rounded-[1.35rem] border border-border bg-white shadow-card">
					<div className="flex items-center gap-1.5 border-b border-border bg-slate-100 px-3 py-2 md:gap-2 md:px-4">
						<span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
						<span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
						<span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
						<div className="ml-2 min-w-0 flex-1">
							<div className="mx-auto h-6 max-w-xs truncate rounded-md border border-border bg-white px-3 text-center font-mono text-[10px] leading-6 text-slate-500">live website preview</div>
						</div>
					</div>

					<div className="relative aspect-[16/10] overflow-hidden bg-slate-100 p-1.5 md:p-2">
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
									sizes="(min-width: 1024px) min(640px, 44vw), (min-width: 768px) min(640px, 48vw), min(640px, 90vw)"
									className="rounded-xl object-contain object-top shadow-sm"
								/>
								<div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink shadow-card backdrop-blur">{project.industry}</div>
							</div>
						))}
					</div>
				</div>

				<div className="absolute -bottom-5 right-2 w-[28%] min-w-[108px] max-w-[158px] md:-bottom-6 md:-right-3">
					<div className="rounded-[1.75rem] border border-white/15 bg-slate-950 p-1.5 shadow-[0_24px_60px_-22px_rgb(15_23_42_/_0.72)] ring-1 ring-ink/20">
						<div className="relative aspect-[9/19] overflow-hidden rounded-[1.25rem] bg-white p-1">
							<span className="absolute left-1/2 top-1.5 z-20 h-1 w-8 -translate-x-1/2 rounded-full bg-slate-950/45" />
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
										sizes="158px"
										className="rounded-[1rem] object-contain object-top"
									/>
								</div>
							))}
						</div>
					</div>
				</div>

				<HeroSignal className="left-2 bottom-7 -translate-x-2 md:left-0 md:-translate-x-5" icon="mail" label="New enquiry" value="Website audit requested" tone="brand" />
				<HeroSignal className="right-2 top-7 translate-x-2 md:right-0 md:translate-x-4" icon="device" label="Responsive" value="Desktop + mobile" tone="accent" />

				<div className="absolute bottom-4 left-4 hidden items-center gap-1.5 rounded-full border border-white/70 bg-white/85 px-3 py-2 shadow-card backdrop-blur md:flex">
					{showcaseProjects.map((project, index) => (
						<span key={project.slug} className="hero-showcase-dot h-1.5 w-5 rounded-full bg-slate-300" style={{ animationDelay: `${index * 4}s` }} />
					))}
				</div>
			</div>
		</div>
	);
}

function HeroSignal({ className, icon, label, value, tone }: { className?: string; icon: IconName; label: string; value: string; tone: "brand" | "accent" }) {
	return (
		<div className={cn("animate-bob absolute hidden rounded-2xl border border-border bg-white px-4 py-3 shadow-card-hover sm:flex sm:items-center sm:gap-3", className)}>
			<div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", tone === "brand" ? "bg-brand/10 text-brand" : "bg-accent/10 text-accent")}>
				<Icon name={icon} size={17} />
			</div>
			<div>
				<div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
				<div className="text-sm font-bold text-ink">{value}</div>
			</div>
		</div>
	);
}
