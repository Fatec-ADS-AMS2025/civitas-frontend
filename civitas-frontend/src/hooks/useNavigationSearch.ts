"use client";

import React, { useDeferredValue, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppNavigation } from "@/hooks/useNavigationProgress";
import { NAVIGATION_CATALOG } from "@/navigation/navigation.data";
import { searchNavigation } from "@/navigation/navigation.search";

const normalizePath = (path: string): string => {
  const trimmed = path.trim();
  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  return withoutTrailingSlash || "/";
};

export const useNavigationSearch = () => {
  const { push } = useAppNavigation();
  const pathname = usePathname() || "/dashboard";
  const [query, setQuery] = useState("");
  const debouncedQuery = useDeferredValue(query);

  const groups = useMemo(() => {
    return searchNavigation(NAVIGATION_CATALOG, debouncedQuery);
  }, [debouncedQuery]);

  const flattenedResults = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups],
  );

  const normalizedPath = normalizePath(pathname);
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const effectiveSelectedKey = useMemo(() => {
    if (flattenedResults.length === 0) {
      return undefined;
    }

    const activeItem = flattenedResults.find(
      (entry) => normalizePath(entry.item.path) === normalizedPath,
    );

    if (activeItem) {
      return activeItem.item.key;
    }

    const hasSelectedItem = flattenedResults.some(
      (entry) => entry.item.key === selectedKey,
    );

    return hasSelectedItem ? selectedKey : flattenedResults[0].item.key;
  }, [flattenedResults, normalizedPath, selectedKey]);

  const navigateToPath = (path: string) => {
    push(path);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (flattenedResults.length === 0) {
      return;
    }

    const currentIndex = Math.max(
      0,
      flattenedResults.findIndex((entry) => entry.item.key === effectiveSelectedKey),
    );

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % flattenedResults.length;
      setSelectedKey(flattenedResults[nextIndex].item.key);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex =
        (currentIndex - 1 + flattenedResults.length) % flattenedResults.length;
      setSelectedKey(flattenedResults[nextIndex].item.key);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selectedItem = flattenedResults.find(
        (entry) => entry.item.key === effectiveSelectedKey,
      );

      if (selectedItem) {
        navigateToPath(selectedItem.item.path);
      }
      return;
    }

    if (event.key === "Escape") {
      setQuery("");
    }
  };

  return {
    query,
    setQuery,
    groups,
    selectedKey: effectiveSelectedKey,
    setSelectedKey,
    normalizedPath,
    debouncedQuery,
    handleInputKeyDown,
    navigateToPath,
  };
};
