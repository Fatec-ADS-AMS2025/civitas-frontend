"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useNavigationProgressStore } from "@/hooks/useNavigationProgress";

export default function NavigationFeedback() {
  const pathname = usePathname();
  const status = useNavigationProgressStore((state) => state.status);
  const progress = useNavigationProgressStore((state) => state.progress);
  const start = useNavigationProgressStore((state) => state.start);
  const done = useNavigationProgressStore((state) => state.done);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    done();
  }, [pathname, done]);

  useEffect(() => {
    const handlePopState = () => {
      start();
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      try {
        const nextUrl = new URL(anchor.href, window.location.origin);
        const currentUrl = new URL(window.location.href);

        if (nextUrl.origin !== currentUrl.origin) {
          return;
        }

        if (`${nextUrl.pathname}${nextUrl.search}` === `${currentUrl.pathname}${currentUrl.search}`) {
          return;
        }

        start();
      } catch {
        start();
      }
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [start]);

  const isActive = status !== "idle";
  const safeProgress = Math.min(Math.max(progress, 0.02), 1);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[10050] h-[10px] overflow-hidden">
      <div className={`absolute inset-0 transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0"}`}>
        <div
          className={`relative h-full origin-left rounded-sm bg-primary-1 ${
            status === "finishing" ? "duration-180 opacity-0" : "duration-200 opacity-100"
          }`}
          style={{ transform: `scaleX(${safeProgress})` }}
        >
          <span className="route-progress-bar__sheen absolute inset-y-0 right-0 w-24 rounded-sm bg-primary-2" />
        </div>
      </div>
    </div>
  );
}
