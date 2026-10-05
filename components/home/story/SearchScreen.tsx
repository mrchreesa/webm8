import { cn } from "@/lib/cn";
import { searchSuggestions, type Trade } from "@/lib/trades";
import { SearchIcon, TrendIcon } from "./icons";
import { StatusBar } from "./StatusBar";
import { TradeIcon } from "./TradeIcon";
import styles from "./story.module.css";

export function SearchScreen({ trade, name }: { trade: Trade; name: string }) {
  return (
    <div data-slot="search" data-story="search" className={cn(styles.slot, styles.searchScreen)}>
      <StatusBar time="9:41" />
      <div className={styles.searchBar}>
        <SearchIcon />
        <span data-story="query" className={styles.query} />
        <i className={styles.caret} />
      </div>
      <div className={styles.tabs}>
        <span>All</span>
        <span>Maps</span>
        <span>Images</span>
        <span>News</span>
      </div>
      <div className={styles.suggest}>
        <p className={styles.suggestTitle}>Searched near you today</p>
        {searchSuggestions(trade).map((query, index) => (
          <span key={query} className={styles.suggestItem} data-current={index === 0 ? "" : undefined}>
            <TrendIcon />
            {query}
          </span>
        ))}
      </div>
      <div className={styles.map}>
        <svg viewBox="0 0 300 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="300" height="140" fill="#e8ede4" />
          <path d="M0 96 C 80 80, 160 120, 300 86" stroke="#a9cdf0" strokeWidth="12" fill="none" />
          <rect x="190" y="14" width="70" height="40" rx="6" fill="#cfe6c3" />
          <g stroke="#fff" strokeWidth="6" fill="none">
            <path d="M0 40 H300" />
            <path d="M60 0 V140" />
            <path d="M150 0 C 140 60, 170 90, 160 140" />
            <path d="M0 120 L300 30" />
          </g>
        </svg>
        <span className={styles.mapPin} data-top="" style={{ left: "38%", top: "52%" }}><b>1</b></span>
        <span className={styles.mapPin} style={{ left: "72%", top: "70%" }}><b>2</b></span>
        <span className={styles.mapPin} style={{ left: "18%", top: "34%" }}><b>3</b></span>
      </div>
      <div className={styles.results}>
        <div data-story="top-result" className={cn(styles.result, styles.resultTop)}>
          <span className={styles.thumb}><TradeIcon trade={trade.key} strokeWidth={1.6} /></span>
          <b>{name}</b>
          <span className={styles.meta}><i>★★★★★</i> 4.9 ({trade.reviewCount}) {trade.category}</span>
          <div className={styles.actions}>
            <span>Website</span>
            <span>Directions</span>
            <span>Call</span>
          </div>
          <i data-story="tap-1" className={styles.tap} style={{ left: "16%", top: "78%" }} />
        </div>
        {trade.competitors.map((competitor) => (
          <div key={competitor.name} className={styles.result}>
            <b>{competitor.name}</b>
            <span className={styles.meta}><i>★★★★</i> {competitor.rating}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
