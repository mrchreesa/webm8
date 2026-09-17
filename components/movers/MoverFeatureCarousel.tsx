import Image from "next/image";
import { whatYouGet } from "@/lib/site";

const features = whatYouGet.flatMap((group) => group.features);

export function MoverFeatureCarousel() {
  return (
    <section
      aria-labelledby="mover-features-heading"
      className="relative z-10 mt-auto bg-gradient-to-b from-transparent via-ink-deep/25 to-ink-deep/60 pb-6 pt-7"
    >
      <h2 id="mover-features-heading" className="sr-only">
        Website features
      </h2>

      <div className="mover-feature-marquee overflow-hidden">
        <div className="mover-feature-track flex w-max">
          <FeatureList />
          <FeatureList duplicate />
        </div>
      </div>
    </section>
  );
}

function FeatureList({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      className="flex shrink-0 gap-3 pr-3"
      aria-hidden={duplicate || undefined}
    >
      {features.map((feature) => (
        <li
          key={feature}
          className="group relative flex h-[88px] w-[280px] shrink-0 items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/[0.12] via-ink-raised/25 to-ink-deep/50 px-5 py-4 shadow-[0_14px_36px_-24px_rgb(0_0_0_/_0.85),inset_0_1px_0_rgb(255_255_255_/_0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:from-white/[0.16] hover:via-ink-raised/35 hover:shadow-[0_18px_42px_-22px_rgb(0_0_0_/_0.9),inset_0_1px_0_rgb(255_255_255_/_0.12)] sm:w-[320px]"
        >
          <span
            aria-hidden="true"
            className="absolute -right-8 -top-12 h-28 w-28 rounded-full bg-[#5a8cff]/15 blur-2xl transition-transform duration-500 group-hover:scale-125"
          />
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center transition-transform duration-300 group-hover:rotate-[-3deg] group-hover:scale-105">
            <Image
              src="/checklist.png"
              alt=""
              width={42}
              height={42}
              className="h-[42px] w-[42px] object-contain drop-shadow-[0_0_10px_rgb(82_133_255_/_0.4)]"
            />
          </span>
          <span className="relative min-w-0 font-sans text-base font-semibold leading-[1.3] tracking-[-0.02em] text-[#eef6ff]">
            {feature}
          </span>
        </li>
      ))}
    </ul>
  );
}
