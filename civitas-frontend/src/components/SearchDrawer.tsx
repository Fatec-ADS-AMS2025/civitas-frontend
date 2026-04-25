"use client";

import React, { useEffect } from "react";
import SearchInput from "@/components/Sidebar/SearchInput";
import SearchResults from "@/components/Sidebar/SearchResults";
import { useNavigationSearch } from "@/hooks/useNavigationSearch";

type SearchDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const {
    query,
    setQuery,
    groups,
    selectedKey,
    setSelectedKey,
    normalizedPath,
    debouncedQuery,
    handleInputKeyDown,
    navigateToPath,
  } = useNavigationSearch();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const closeAndNavigate = (path: string) => {
    navigateToPath(path);
    onClose();
  };

  return (
    <>
      <button
        type="button"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-[120] bg-[var(--search-drawer-overlay)] backdrop-blur-[1px] transition-opacity duration-200 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Painel de busca"
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-[130] flex h-screen w-full max-w-[380px] flex-col border-l border-[var(--search-drawer-border)] bg-[var(--search-drawer-bg)] shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--search-drawer-divider)] px-4 py-3">
          <h2 className="font-title text-lg font-semibold text-[var(--search-drawer-title)]">
            Buscar funcionalidade
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--search-drawer-border)] text-[var(--search-drawer-muted)] transition-colors hover:bg-[var(--search-drawer-hover-bg)]"
            aria-label="Fechar busca"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar por tela, palavra-chave..."
            autoFocus={isOpen}
          />

          <SearchResults
            groups={groups}
            query={debouncedQuery}
            selectedKey={selectedKey}
            activePath={normalizedPath}
            onSelect={closeAndNavigate}
            onHover={setSelectedKey}
          />
        </div>
      </aside>
    </>
  );
}
