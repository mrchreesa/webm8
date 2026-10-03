import { cn } from "@/lib/cn";
import { SignalIcon } from "./icons";
import styles from "./story.module.css";

export function StatusBar({ time, className }: { time?: string; className?: string }) {
  return (
    <div className={cn(styles.status, className)}>
      <span>{time}</span>
      <SignalIcon />
    </div>
  );
}
