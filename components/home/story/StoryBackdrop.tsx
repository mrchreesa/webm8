import styles from "./story.module.css";

const CROWD = [[182, 140], [430, 335], [702, 190], [980, 350], [1248, 150], [300, 560], [860, 572], [1120, 770], [560, 770], [1360, 580], [90, 760], [640, 440]];

/** The night-time street map behind the story; dots pulse while people search. */
export function StoryBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.glow} />
      <svg className={styles.city} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <g strokeWidth="1.2">
          <path d="M-20 140 C 300 120, 520 210, 780 180 S 1240 120, 1480 170" />
          <path d="M-20 330 C 260 300, 600 380, 900 340 S 1300 300, 1480 360" />
          <path d="M-20 560 C 320 520, 640 600, 980 560 S 1320 520, 1480 590" />
          <path d="M-20 760 C 400 720, 700 800, 1040 760 S 1360 740, 1480 790" />
          <path d="M160 -20 C 140 260, 220 520, 180 920" />
          <path d="M420 -20 C 460 300, 380 600, 440 920" />
          <path d="M700 -20 C 660 280, 740 560, 690 920" />
          <path d="M980 -20 C 1020 320, 940 620, 1000 920" />
          <path d="M1250 -20 C 1220 260, 1290 600, 1240 920" />
          <path d="M40 40 L 520 470 M 860 20 L 1420 520 M 300 900 L 820 430" strokeDasharray="2 8" />
        </g>
        <g className={styles.crowd}>
          {CROWD.map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" />
          ))}
        </g>
      </svg>
    </div>
  );
}
