import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./demo.module.css";

/** Step one: we ring them, with the notes we take on the call behind. */
function CallScene() {
  return (
    <div className={styles.callScene}>
      <div className={styles.notes}>
        <p className={styles.notesTitle}>Call notes</p>
        {["Your services", "Your customers", "What you want more of"].map((item) => (
          <p key={item} className={styles.notesRow}>
            <Icon name="check" size={13} />
            {item}
          </p>
        ))}
      </div>
      <div className={styles.call}>
        <span className={styles.callAvatar}>
          <i className={styles.ring} />
          <i className={styles.ring} />
          <Image src="/mascot.png" alt="" width={88} height={88} sizes="44px" />
        </span>
        <span className="min-w-0">
          <b className="block text-[0.95rem] leading-tight font-semibold text-white">WebM8</b>
          <span className="block text-xs text-muted-invert">Calling you today</span>
        </span>
        <span className={styles.callButtons}>
          <i className={styles.decline}>
            <Icon name="phone" size={14} />
          </i>
          <i className={styles.accept}>
            <Icon name="phone" size={14} />
          </i>
        </span>
      </div>
    </div>
  );
}

/** Step two: the demo, screen-shared on a short video call. */
function DemoCallScene() {
  return (
    <div className={styles.video}>
      <p className={styles.videoBar}>
        <i />
        Your demo call
      </p>
      <div className={styles.videoShare}>
        <Image
          src="/work/dps-gasworks-desktop.webp"
          alt=""
          width={1600}
          height={900}
          sizes="(min-width: 1024px) 300px, 80vw"
        />
      </div>
      <span className={styles.faces}>
        <span className={styles.faceUs}>
          <Image src="/mascot.png" alt="" width={88} height={88} sizes="42px" />
        </span>
        <span className={styles.faceYou}>You</span>
      </span>
    </div>
  );
}

/** Step three: either way is fine. */
function DecideScene() {
  return (
    <div className={styles.decide}>
      <span className={styles.fork}>
        <svg viewBox="0 0 60 100" preserveAspectRatio="none">
          <path d="M0 50C30 50 30 25 60 25M0 50C30 50 30 75 60 75" />
        </svg>
        <i />
      </span>
      <span className={styles.choices}>
        <span className={styles.choiceYes}>
          <span className={styles.choiceMark}>
            <Icon name="check" size={15} />
          </span>
          <span>
            <b>Love it</b>
            <small>We recommend a plan</small>
          </span>
        </span>
        <span className={styles.choiceNo}>
          <span className={styles.choiceMark}>
            <Icon name="close" size={14} />
          </span>
          <span>
            <b>Not for you</b>
            <small>Walk away. No chasing.</small>
          </span>
        </span>
      </span>
    </div>
  );
}

const steps: { when: string; title: string; body: string; scene: ReactNode }[] = [
  {
    when: "Today",
    title: "A quick call",
    body: "About five minutes. We learn about your business, your customers and what you want more of.",
    scene: <CallScene />,
  },
  {
    when: "Within 48 hours of our call",
    title: "Your demo",
    body: "A homepage designed for your business, with your name, services and area on it. We show it to you on a short video call.",
    scene: <DemoCallScene />,
  },
  {
    when: "Then",
    title: "You decide",
    body: "Love it? We’ll recommend a plan based on the features you need. Not for you? Walk away. We won’t chase.",
    scene: <DecideScene />,
  },
];

/**
 * What happens after a demo request (on /free-demo/ or a Meta Instant Form),
 * as a timeline on a navy band. Each step has a small scene of what it looks
 * like. When the band scrolls into view, the timeline draws from one step to
 * the next (demo.module.css).
 */
export function DemoNext() {
  return (
    <section aria-labelledby="demo-next-title" className="py-20 md:py-28">
      <div className="container-page">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
          <h2 id="demo-next-title" className="max-w-2xl text-[clamp(2.2rem,5vw,3.6rem)] leading-[1] font-bold text-ink">
            Here’s what happens next.
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-muted lg:pb-1">
            Two short calls, and nothing for you to prepare.
          </p>
        </div>

        <Reveal
          variant="fade"
          threshold={0.3}
          className="surface-dark relative mt-10 overflow-hidden rounded-[2rem] bg-night px-5 py-9 text-white sm:px-8 md:mt-14 md:py-12 lg:px-12 lg:py-14"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgb(27_74_128/0.55),transparent_70%),radial-gradient(40%_60%_at_100%_100%,rgb(43_108_252/0.22),transparent_70%)]"
          />
          <ol className={styles.next}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.nextStep} style={{ "--i": index } as CSSProperties}>
                <div className={styles.stepHead}>
                  <span className={styles.nodeBox} aria-hidden>
                    <span className={styles.node} />
                  </span>
                  <p className="leading-6 font-semibold whitespace-nowrap text-brand">{step.when}</p>
                </div>
                <div className="pl-10 lg:pl-0">
                  <div className={styles.scene} aria-hidden>
                    {step.scene}
                  </div>
                  <h3 className="mt-7 text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 max-w-sm leading-relaxed text-muted-invert">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
