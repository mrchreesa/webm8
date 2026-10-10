"use client";

import { analyticsName } from "@/lib/analyticsNames";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/site";
import styles from "./demo.module.css";

/**
 * A demo from the deck, live, in a dialog that nearly fills the screen. Esc,
 * the close button or a click outside closes it. A site that refuses to load
 * inside another page (`blocksFraming`) shows its screenshot and a link out.
 */
export function DemoSiteModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !project) return;
    if (!dialog.open) dialog.showModal();
    // showModal focuses the first link; the close button is the better start.
    dialog.querySelector<HTMLElement>("[data-dialog-close]")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      if (dialog.open) dialog.close();
    };
  }, [project]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      // The dialog itself is only hit outside its content: on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className={cn(
        styles.dialog,
        "surface-dark m-auto h-[calc(100dvh-1rem)] max-h-none w-[calc(100vw-1rem)] max-w-[1600px] overflow-hidden rounded-2xl bg-night p-0 text-white shadow-[0_40px_120px_-20px_rgb(0_0_0/0.8)] sm:h-[calc(100dvh-3rem)] sm:w-[calc(100vw-3rem)]",
        "backdrop:bg-night/80 backdrop:backdrop-blur-sm",
      )}
    >
      {project ? <SitePreview key={project.slug} project={project} titleId={titleId} onClose={() => dialogRef.current?.close()} /> : null}
    </dialog>
  );
}

function SitePreview({ project, titleId, onClose }: { project: Project; titleId: string; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const { siteUrl } = project;
  const host = siteUrl ? new URL(siteUrl).hostname : null;
  const live = siteUrl && !project.blocksFraming;

  return (
    <div data-analytics-section="Demo preview" className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 py-2 pr-2 pl-4 sm:py-2.5 sm:pr-2.5 sm:pl-5">
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="truncate text-sm font-semibold sm:text-base">
            {project.name}
          </h2>
          <p className="truncate font-mono text-[0.68rem] tracking-[0.04em] text-muted-invert">
            Real demo{host ? ` · ${host}` : null}
          </p>
        </div>
        {siteUrl ? (
          <a data-analytics-id={analyticsName(`Open ${project.name} in new tab`)}
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${project.name} in a new tab`}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-semibold text-white ring-1 ring-white/15 ring-inset transition-colors hover:bg-white/10 sm:px-4"
          >
            <span className="hidden sm:inline">Open in new tab</span>
            <Icon name="external" size={16} aria-hidden />
          </a>
        ) : null}
        <button data-analytics-id={analyticsName(`Close ${project.name} preview`)}
          type="button"
          onClick={onClose}
          data-dialog-close
          aria-label="Close"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white ring-1 ring-white/15 ring-inset transition-colors hover:bg-white/10"
        >
          <Icon name="close" size={18} aria-hidden />
        </button>
      </div>

      <div className="relative flex-1 bg-white">
        {live ? (
          <>
            <iframe
              src={siteUrl}
              title={`${project.name}, a demo website`}
              onLoad={() => setLoaded(true)}
              className="absolute inset-0 h-full w-full border-0"
            />
            {loaded ? null : (
              <div className="absolute inset-0 grid place-items-center bg-night">
                <p className="flex items-center gap-3 text-sm text-muted-invert">
                  <span aria-hidden className={cn(styles.spinner, "h-5 w-5 rounded-full border-2 border-white/20 border-t-brand")} />
                  Loading {project.name}…
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-night">
            <Image
              src={project.screenshots.desktop}
              alt={`${project.name}, a demo website for a ${project.industry.toLowerCase()} business`}
              fill
              sizes="100vw"
              className="hidden object-cover object-top sm:block"
            />
            <Image
              src={project.screenshots.mobile}
              alt={`${project.name}, a demo website for a ${project.industry.toLowerCase()} business`}
              fill
              sizes="100vw"
              className="object-cover object-top sm:hidden"
            />
            {siteUrl ? (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night via-night/90 to-transparent px-5 pt-28 pb-8 text-center">
                <p className="text-lg font-semibold">This site opens in its own tab.</p>
                <a data-analytics-id={analyticsName(`Open ${project.name} live site`)}
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-brand-ink transition-colors hover:bg-brand-hover"
                >
                  Open {project.name}
                  <Icon name="external" size={16} aria-hidden />
                </a>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
