import { cn } from "@/lib/cn";
import { initialOf, type Trade } from "@/lib/trades";
import { CheckIcon, ChevronRightIcon, PhoneIcon } from "./icons";
import { lookStyle, looks } from "./looks";
import { StatusBar } from "./StatusBar";
import { TradeIcon } from "./TradeIcon";
import site from "./site.module.css";
import styles from "./story.module.css";

/** The site's main button. StoryHero taps it at the end of the site step. */
function MainButton({ trade }: { trade: Trade }) {
  return (
    <span className={site.cta}>
      {trade.site.cta}
      <i data-story="tap-2" className={styles.tap} style={{ left: "50%", top: "50%" }} />
    </span>
  );
}

const Stars = () => <i className={site.stars}>★★★★★</i>;

function Hero({ trade }: { trade: Trade }) {
  const { layout, Art } = looks[trade.key];
  const { headline, badge, sub, phone } = trade.site;

  if (layout === "poster") {
    return (
      <div className={site.hero}>
        <div className={site.art}><Art /></div>
        <span className={site.badge}>{badge}</span>
        <p className={site.headline}>{headline}</p>
        <p className={site.sub}>{sub}</p>
        <MainButton trade={trade} />
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
        <MainButton trade={trade} />
        <span className={site.rating}><Stars /> 4.9 from {trade.reviewCount} reviews</span>
      </div>
    );
  }

  if (layout === "soft") {
    return (
      <div className={site.hero}>
        <p className={site.headline}>{headline}</p>
        <p className={site.sub}>{sub}</p>
        <div className={site.actions}>
          <MainButton trade={trade} />
          <span className={site.rating}><Stars /><br />4.9 ({trade.reviewCount})</span>
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
      <MainButton trade={trade} />
      <div className={site.trust}>
        <span><CheckIcon />Licensed</span>
        <span><CheckIcon />Insured</span>
        <span><Stars /> 4.9</span>
      </div>
    </div>
  );
}

/** The example site, built from the trade and the visitor's business name. */
export function TradeSite({ trade, name }: { trade: Trade; name: string }) {
  const look = looks[trade.key];
  return (
    <div
      data-slot="site"
      data-story="site"
      data-trade={trade.key}
      data-font={look.font}
      className={cn(styles.slot, site.site, site[look.layout])}
      style={lookStyle(look)}
    >
      <StatusBar time="9:41" className={site.status} />
      <div className={site.scroll}>
        <div className={site.nav}>
          <span className={site.logo}>
            <i className={site.mark}>{initialOf(name)}</i>
            <b>{name}</b>
          </span>
          <span className={site.burger}><i /><i /><i /></span>
        </div>
        <Hero trade={trade} />
        <div className={site.services}>
          {trade.site.services.map((service) => (
            <div key={service} className={site.row}>
              <span className={site.rowIcon}><TradeIcon trade={trade.key} strokeWidth={2} /></span>
              {service}
              <ChevronRightIcon className={site.chev} />
            </div>
          ))}
        </div>
      </div>
      <div className={site.callBar}>
        <PhoneIcon />
        Call now
      </div>
    </div>
  );
}
