import { LinkButton } from "@/components/ui/Button";
import { AmbientBlobs } from "@/components/ui/AmbientBlobs";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <section data-analytics-section="Page not found" className="relative overflow-hidden py-32 md:py-40">
      <AmbientBlobs variant="light" />
      <div className="container-page text-center">
        <p className="animate-rise font-mono text-sm font-bold uppercase tracking-[0.2em] text-link">
          404
        </p>
        <h1
          className="animate-rise mt-4 text-4xl font-bold tracking-tight text-ink md:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          Page not found
        </h1>
        <p
          className="animate-rise mx-auto mt-5 max-w-xl text-lg text-muted"
          style={{ animationDelay: "160ms" }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div
          className="animate-rise mt-8 flex flex-wrap justify-center gap-3"
          style={{ animationDelay: "240ms" }}
        >
          <LinkButton data-analytics-id="Go home" href="/" size="lg">
            Back to home
            <Icon name="arrow" size={18} />
          </LinkButton>
          <LinkButton data-analytics-id="Contact WebM8" href="/contact" size="lg" variant="ghost">
            Contact us
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
