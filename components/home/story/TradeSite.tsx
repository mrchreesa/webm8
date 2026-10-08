import Image from "next/image";
import type { AnimationEventHandler, CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { projects } from "@/lib/site";
import { drawnSiteOf, initialOf, isPortfolioSite, ratingOf, type DrawnSite, type Trade } from "@/lib/trades";
import { CheckIcon, ChevronRightIcon, PhoneIcon } from "./icons";
import { lookStyle, looks, type SiteLook } from "./looks";
import { StatusBar } from "./StatusBar";
import { TradeIcon } from "./TradeIcon";
import site from "./site.module.css";
import styles from "./story.module.css";

/** The site's main button. StoryHero taps it at the end of the site step. */
function MainButton({ label }: { label: string }) {
  return (
    <span className={site.cta}>
      {label}
      <i data-story="tap-2" className={styles.tap} style={{ left: "50%", top: "50%" }} />
    </span>
  );
}

const Stars = () => <i className={site.stars}>★★★★★</i>;

function Hero({ trade, copy, look }: { trade: Trade; copy: DrawnSite; look: SiteLook }) {
  const { layout, Art } = look;
  const { headline, badge, sub, cta, phone } = copy;

  if (layout === "poster") {
    return (
      <div className={site.hero}>
        <div className={site.art}><Art /></div>
        <span className={site.badge}>{badge}</span>
        <p className={site.headline}>{headline}</p>
        <p className={site.sub}>{sub}</p>
        <MainButton label={cta} />
        <span className={site.call}>Call {phone}</span>
      </div>
    );
  }

  if (layout === "editorial") {
    return (
      <div className={site.hero}>
        <div className={site.archWrap}>
          <div className={site.arch}><Art /></div>
          <span className={site.sign}>{badge}</span>
        </div>
        <p className={site.headline}>{headline}</p>
        <p className={site.sub}>{sub}</p>
        <MainButton label={cta} />
        <span className={site.rating}><Stars /> {ratingOf(trade)} from {trade.reviewCount} reviews</span>
      </div>
    );
  }

  if (layout === "soft") {
    return (
      <div className={site.hero}>
        <p className={site.headline}>{headline}</p>
        <p className={site.sub}>{sub}</p>
        <div className={site.actions}>
          <MainButton label={cta} />
          <span className={site.rating}><Stars /><br />{ratingOf(trade)} ({trade.reviewCount})</span>
        </div>
        <div className={site.discWrap}>
          <div className={site.disc}><Art /></div>
          <span className={site.sticker}>{badge}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={site.hero}>
      <div className={site.artCard}>
        <Art />
        <span className={site.badge}><i className={site.live} />{badge}</span>
      </div>
      <p className={site.headline}>{headline}</p>
      <p className={site.sub}>{sub}</p>
      <MainButton label={cta} />
      <div className={site.trust}>
        <span><CheckIcon />Licensed</span>
        <span><CheckIcon />Insured</span>
        <span><Stars /> {ratingOf(trade)}</span>
      </div>
    </div>
  );
}

type DrawnTradeSiteProps = {
  trade: Trade;
  copy: DrawnSite;
  look: SiteLook;
  /** Another business's name in place of the example's (the /free-demo/ sketch). */
  name?: string;
  className?: string;
  onAnimationEnd?: AnimationEventHandler<HTMLDivElement>;
};

/** A site drawn for the trade: header, hero, services and a review. */
function DrawnTradeSite({ trade, copy, look, name = trade.exampleName, className, onAnimationEnd }: DrawnTradeSiteProps) {
  return (
    <div
      data-slot="site"
      data-story="site"
      data-trade={trade.key}
      data-font={look.font}
      className={cn(site.site, site[look.layout], className)}
      style={lookStyle(look)}
      onAnimationEnd={onAnimationEnd}
    >
      <div className={site.top}>
        <StatusBar time="9:41" />
        <div className={site.nav}>
          <span className={site.logo}>
            <i className={site.mark}>{initialOf(name)}</i>
            <b>{name}</b>
          </span>
          <span className={site.burger}><i /><i /><i /></span>
        </div>
      </div>
      <div className={site.scroll}>
        <Hero trade={trade} copy={copy} look={look} />
        <div className={site.services}>
          {copy.services.map((service) => (
            <div key={service} className={site.row}>
              <span className={site.rowIcon}><TradeIcon trade={trade.key} strokeWidth={2} /></span>
              {service}
              <ChevronRightIcon className={site.chev} />
            </div>
          ))}
        </div>
        <figure className={site.review}>
          <Stars />
          <blockquote>{copy.review.quote}</blockquote>
          <figcaption>{copy.review.name}</figcaption>
        </figure>
      </div>
      <div className={site.callBar}>
        <PhoneIcon />
        Call now
      </div>
    </div>
  );
}

/** The phone capture is 390 CSS px wide, the full width of the screen. */
const cqi = (px: number) => `${(px / 3.9).toFixed(2)}cqi`;

/** Dark text on a light page top, light text on a dark one. */
function inkOn(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  const brightness = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return brightness > 150 ? "#0b0b0b" : "#ffffff";
}

/** A real site WebM8 built, scrolled and tapped like a drawn one. */
function PortfolioTradeSite({ trade, slug }: { trade: Trade; slug: string }) {
  const shot = projects.find((project) => project.slug === slug)?.screenshots.phone;
  if (!shot) return null;
  const image = <Image src={shot.src} width={shot.width} height={shot.height} sizes="(min-width: 960px) 290px, 240px" alt="" className={site.shot} />;
  return (
    <div
      data-slot="site"
      data-story="site"
      data-trade={trade.key}
      className={cn(styles.slot, site.site, site.work)}
      style={{ "--g": shot.top, "--g-ink": inkOn(shot.top), "--travel": cqi(shot.scroll) } as CSSProperties}
    >
      <div className={site.top}>
        <StatusBar time="9:41" />
        {/* The site's header: the top of the same capture, held still. */}
        {shot.header ? <div className={site.pinned} style={{ height: cqi(shot.header) }}>{image}</div> : null}
      </div>
      <div className={site.scroll} style={shot.header ? { marginTop: `-${cqi(shot.header)}` } : undefined}>
        {image}
        <i data-story="tap-2" className={styles.tap} style={{ left: cqi(shot.button.x), top: cqi(shot.button.y) }} />
      </div>
    </div>
  );
}

/** The trade's site: a real one WebM8 built where there is one, otherwise one drawn for it. */
export function TradeSite({ trade }: { trade: Trade }) {
  if (isPortfolioSite(trade.site)) return <PortfolioTradeSite trade={trade} slug={trade.site.project} />;
  return <DrawnTradeSite trade={trade} copy={trade.site} look={looks[trade.key]} className={styles.slot} />;
}

/** The trade's drawn site with the visitor's business on it: the sketch beside the /free-demo/ form. */
export function SketchSite({ trade, ...props }: { trade: Trade } & Pick<DrawnTradeSiteProps, "name" | "className" | "onAnimationEnd">) {
  return <DrawnTradeSite trade={trade} copy={drawnSiteOf(trade)} look={looks[trade.key]} {...props} />;
}
