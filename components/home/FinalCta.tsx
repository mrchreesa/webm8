import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCta() {
  return (
    <section className="py-8 md:py-12" aria-labelledby="final-cta-title">
      <div className="container-page">
        <Reveal>
          <div className="grid min-w-0 gap-8 overflow-hidden rounded-[24px] bg-[#202326] px-6 py-9 text-[#F7F5EF] sm:px-8 md:p-10 lg:grid-cols-[minmax(0,1fr)_13.75rem_17rem] lg:items-center lg:gap-7 lg:px-12 lg:py-11">
            <div className="min-w-0">
              <h2
                id="final-cta-title"
                className="font-[family-name:var(--font-manrope)] text-[1.875rem] leading-[1.04] font-extrabold tracking-[-0.035em] text-balance sm:text-4xl lg:text-[2.75rem]"
              >
                Let’s make your business look the business.
              </h2>
              <p className="mt-4 font-[family-name:var(--font-dm-sans)] text-lg leading-relaxed font-normal text-[#F7F5EF]">
                Start with a free personalised homepage preview.
              </p>
            </div>

            <div className="min-w-0 font-[family-name:var(--font-dm-sans)] lg:text-center">
              <Link
                href="/audit"
                className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-neon px-5 py-3 text-base font-semibold tracking-tight text-[#202326] transition-all duration-200 hover:-translate-y-0.5 hover:bg-neon-soft focus-visible:!outline-[3px] focus-visible:!outline-offset-[3px] focus-visible:!outline-neon active:translate-y-0 lg:px-4"
              >
                Get my free preview
                <Icon
                  name="arrow"
                  size={17}
                  className="-rotate-45 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
                  aria-hidden
                />
              </Link>
              <p className="mt-3 text-sm leading-snug text-[#F7F5EF]/75">
                No payment. No obligation.
              </p>
            </div>

            <div className="flex min-w-0 items-center justify-center gap-2 sm:gap-4 lg:justify-end lg:gap-2">
              <Image
                src="/mascot.png"
                alt="WebM8 octopus mascot"
                width={1254}
                height={1254}
                sizes="(max-width: 639px) 104px, (max-width: 1023px) 160px, 176px"
                className="h-auto w-[6.5rem] shrink-0 sm:w-40 lg:w-44"
              />
              <div className="relative min-w-0 max-w-28 sm:max-w-36 lg:max-w-24">
                <span
                  aria-hidden="true"
                  className="absolute -top-2 -right-1 h-1 w-5 rotate-[-24deg] rounded-full bg-neon"
                />
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-3 h-1 w-3 rotate-[58deg] rounded-full bg-neon"
                />
                <p className="font-[family-name:var(--font-caveat)] text-[1.65rem] leading-[0.95] font-semibold text-[#F7F5EF] sm:text-3xl lg:text-[1.7rem]">
                  Good websites, happier days.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
