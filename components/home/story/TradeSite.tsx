import { cn } from "@/lib/cn";
import { initialOf, type Trade } from "@/lib/trades";
import { ChevronRightIcon, PhoneIcon } from "./icons";
import { StatusBar } from "./StatusBar";
import { TradeIcon } from "./TradeIcon";
import styles from "./story.module.css";

/** The example site, built from the trade and the visitor's business name. */
export function TradeSite({ trade, name }: { trade: Trade; name: string }) {
  return (
    <div data-slot="site" data-story="site" className={cn(styles.slot, styles.site)}>
      <StatusBar time="9:41" className={styles.siteStatus} />
      <div className={styles.siteScroll}>
        <div className={styles.siteNav}>
          <span className={styles.siteLogo}>
            <i className={styles.mark}>{initialOf(name)}</i>
            <b>{name}</b>
          </span>
          <span className={styles.burger}><i /><i /><i /></span>
        </div>
        <div className={styles.siteHero}>
          <TradeIcon trade={trade.key} className={styles.siteHeroIcon} strokeWidth={1.2} />
          <span className={styles.pill}><i>★★★★★</i>Rated 4.9 locally</span>
          <p className={styles.siteHeadline}>{trade.site.headline}</p>
          <p className={styles.siteSub}>{trade.site.sub}</p>
          <span className={styles.siteCta}>
            {trade.site.cta}
            <i data-story="tap-2" className={styles.tap} style={{ left: "50%", top: "50%" }} />
          </span>
          <span className={styles.siteCall}>Call {trade.site.phone}</span>
        </div>
        <div className={styles.services}>
          <p className={styles.servicesTitle}>Services</p>
          {trade.site.services.map((service) => (
            <div key={service} className={styles.serviceRow}>
              <span className={styles.serviceIcon}><TradeIcon trade={trade.key} strokeWidth={2} /></span>
              {service}
              <ChevronRightIcon className={styles.chev} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.callBar}>
        <PhoneIcon />
        Call now
      </div>
    </div>
  );
}
