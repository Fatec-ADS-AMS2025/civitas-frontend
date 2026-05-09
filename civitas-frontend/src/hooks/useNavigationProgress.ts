"use client";

import {
  startTransition,
  useCallback,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { create } from "zustand";

type ProgressStatus = "idle" | "pending" | "visible" | "finishing";

type NavigateOptions = {
  scroll?: boolean;
};

type NavigationProgressState = {
  status: ProgressStatus;
  progress: number;
  start: () => void;
  done: () => void;
  reset: () => void;
};

const SHOW_DELAY_MS = 100;
const MIN_VISIBLE_MS = 220;
const FADE_OUT_MS = 180;
const TRICKLE_INTERVAL_MS = 160;
const MAX_PROGRESS = 0.92;

let showTimer: ReturnType<typeof setTimeout> | null = null;
let finishDelayTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let trickleTimer: ReturnType<typeof setInterval> | null = null;
let visibleAt = 0;

const clearShowTimer = () => {
  if (showTimer !== null) {
    clearTimeout(showTimer);
    showTimer = null;
  }
};

const clearFinishDelayTimer = () => {
  if (finishDelayTimer !== null) {
    clearTimeout(finishDelayTimer);
    finishDelayTimer = null;
  }
};

const clearHideTimer = () => {
  if (hideTimer !== null) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
};

const clearTrickleTimer = () => {
  if (trickleTimer !== null) {
    clearInterval(trickleTimer);
    trickleTimer = null;
  }
};

const clearAllTimers = () => {
  clearShowTimer();
  clearFinishDelayTimer();
  clearHideTimer();
  clearTrickleTimer();
};

const stripHash = (value: string) => value.split("#")[0];

const isNavigableHref = (href?: string): href is string => {
  if (!href) return false;
  return !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:");
};

const normalizeHref = (href: string) => {
  if (!isNavigableHref(href)) {
    return href;
  }

  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(href, base);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
};

const startTrickle = (
  set: (partial: Partial<NavigationProgressState>) => void,
  get: () => NavigationProgressState
) => {
  clearTrickleTimer();

  trickleTimer = setInterval(() => {
    const { status, progress } = get();

    if (status !== "visible" || progress >= MAX_PROGRESS) {
      return;
    }

    const remaining = MAX_PROGRESS - progress;
    const increment = Math.max(0.018, remaining * (0.2 + Math.random() * 0.16));

    set({
      progress: Math.min(MAX_PROGRESS, progress + increment),
    });
  }, TRICKLE_INTERVAL_MS);
};

export const useNavigationProgressStore = create<NavigationProgressState>((set, get) => ({
  status: "idle",
  progress: 0,
  start: () => {
    clearFinishDelayTimer();
    clearHideTimer();

    const current = get();

    if (current.status === "visible" || current.status === "finishing") {
      set({
        status: "visible",
        progress: Math.min(Math.max(current.progress, 0.18), MAX_PROGRESS),
      });
      startTrickle(set, get);
      return;
    }

    if (current.status === "pending") {
      return;
    }

    set({ status: "pending", progress: 0 });

    clearShowTimer();
    showTimer = setTimeout(() => {
      if (get().status !== "pending") {
        return;
      }

      visibleAt = Date.now();
      set({ status: "visible", progress: 0.08 });
      startTrickle(set, get);
    }, SHOW_DELAY_MS);
  },
  done: () => {
    clearShowTimer();

    const { status } = get();

    if (status === "idle") {
      return;
    }

    if (status === "pending") {
      clearAllTimers();
      visibleAt = 0;
      set({ status: "idle", progress: 0 });
      return;
    }

    const finish = () => {
      clearFinishDelayTimer();
      clearTrickleTimer();

      set({ status: "finishing", progress: 1 });

      clearHideTimer();
      hideTimer = setTimeout(() => {
        visibleAt = 0;
        set({ status: "idle", progress: 0 });
        hideTimer = null;
      }, FADE_OUT_MS);
    };

    const elapsed = visibleAt ? Date.now() - visibleAt : MIN_VISIBLE_MS;
    const waitTime = Math.max(0, MIN_VISIBLE_MS - elapsed);

    clearFinishDelayTimer();
    finishDelayTimer = setTimeout(finish, waitTime);
  },
  reset: () => {
    clearAllTimers();
    visibleAt = 0;
    set({ status: "idle", progress: 0 });
  },
}));

export function useAppNavigation() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const start = useNavigationProgressStore((state) => state.start);

  const shouldAnimate = useCallback(
    (href?: string) => {
      if (!isNavigableHref(href)) {
        return false;
      }

      const normalizedTarget = stripHash(normalizeHref(href));
      return normalizedTarget !== stripHash(pathname);
    },
    [pathname]
  );

  const startNavigation = useCallback(
    (href?: string) => {
      if (!shouldAnimate(href)) {
        return false;
      }

      start();
      return true;
    },
    [shouldAnimate, start]
  );

  const push = useCallback(
    (href: string, options?: NavigateOptions) => {
      startNavigation(href);

      startTransition(() => {
        router.push(href, options);
      });
    },
    [router, startNavigation]
  );

  const replace = useCallback(
    (href: string, options?: NavigateOptions) => {
      startNavigation(href);

      startTransition(() => {
        router.replace(href, options);
      });
    },
    [router, startNavigation]
  );

  const back = useCallback(() => {
    start();

    startTransition(() => {
      router.back();
    });
  }, [router, start]);

  const forward = useCallback(() => {
    start();

    startTransition(() => {
      router.forward();
    });
  }, [router, start]);

  const handleLinkClick = useCallback(
    (href: string) => (event: ReactMouseEvent<HTMLElement>) => {
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

      startNavigation(href);
    },
    [startNavigation]
  );

  return {
    push,
    replace,
    back,
    forward,
    refresh: router.refresh,
    prefetch: router.prefetch,
    startNavigation,
    handleLinkClick,
  };
}
