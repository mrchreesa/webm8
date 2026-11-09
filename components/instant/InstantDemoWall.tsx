"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import demo from "@/components/demo/demo.module.css";

// Use the wall's own responsive geometry so downloading the gallery never
// shifts the form or footer. Keep its images out of the initial document.
function WallSpace() {
  return <div className={`${demo.wallScene} ${demo.wallShowcase}`} aria-hidden="true" />;
}

const DemoWall = dynamic(() => import("@/components/demo/DemoWall").then(module => module.DemoWall), { loading: WallSpace });

export function InstantDemoWall({ projectSlugs }: { projectSlugs: readonly string[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!container.current) return;
    if (!("IntersectionObserver" in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "320px 0px" });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={container}>{visible ? <DemoWall variant="showcase" projectSlugs={projectSlugs} /> : <WallSpace />}</div>;
}
