"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [start]);

  const isActive = status !== "idle";
  const safeProgress = Math.min(Math.max(progress, 0.02), 1);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[10050] h-[3px] overflow-hidden"
    >
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`relative h-full origin-left rounded-r-full bg-[linear-gradient(90deg,#0D6A74_0%,#58AFAE_55%,#FFD121_100%)] shadow-[0_0_18px_rgba(88,175,174,0.45)] transition-[transform,opacity] ${
            status === "finishing" ? "duration-180 opacity-0" : "duration-200 opacity-100"
          }`}
          style={{ transform: `scaleX(${safeProgress})` }}
        >
          <span className="route-progress-bar__sheen absolute inset-y-0 right-0 w-24 rounded-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_45%,rgba(255,255,255,0.92)_100%)]" />
        </div>
      </div>
    </div>
  );
}
