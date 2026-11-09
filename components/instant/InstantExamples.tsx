import { DemoWall } from "@/components/demo/DemoWall";
import { Icon } from "@/components/ui/Icon";
import styles from "./instant.module.css";

const localBusinessDemos = ["stitch-house", "fcg-painting", "aesthetic-nacre", "dps-gasworks", "waffles-bubbles", "removals", "boniface-salon", "all-things-new"];

export function InstantExamples() {
  return (
    <section className={`${styles.examples} surface-dark`} aria-labelledby="instant-examples-title">
      <div className={`container-page ${styles.examplesHeading}`}>
        <div><p className={styles.eyebrow}>A little inspiration</p><h2 id="instant-examples-title">Made for businesses<br />like yours.</h2></div>
        <div><p>Trades, restaurants, clinics and local services. Explore our demo designs and find a style you like.</p><a href="#instant-signup" className={styles.examplesLink}>Start with your details<Icon name="arrow" size={16} className="-rotate-90" aria-hidden /></a></div>
      </div>
      <DemoWall variant="showcase" projectSlugs={localBusinessDemos} />
    </section>
  );
}
