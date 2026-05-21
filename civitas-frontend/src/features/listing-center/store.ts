import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LISTING_CENTER_CONFIGS, LISTING_CENTER_REGISTRY } from "./registry";
import type { ListingViewState } from "./types";
import { getInitialListingViewState } from "./utils";

type ListingCenterStore = {
  activeListingId: string;
  views: Record<string, ListingViewState>;
  setActiveListing: (listingId: string) => void;
  updateView: (
    listingId: string,
    updater: (currentView: ListingViewState) => ListingViewState,
  ) => void;
  resetView: (listingId: string) => void;
  ensureView: (listingId: string) => void;
};

const fallbackListingId = LISTING_CENTER_CONFIGS[0]?.id ?? "central-usuarios";

const buildInitialView = (listingId: string): ListingViewState => {
  const config = LISTING_CENTER_REGISTRY[listingId];
  if (!config) {
    return {
      selectedPresetId: undefined,
      search: "",
      filterValues: {},
      visibleColumnIds: [],
      sortColumnId: undefined,
      sortDirection: "asc",
      page: 1,
      pageSize: 10,
    };
  }

  return getInitialListingViewState(config);
};

export const useListingCenterStore = create<ListingCenterStore>()(
  persist(
    (set, get) => ({
      activeListingId: fallbackListingId,
      views: {},
      setActiveListing: (listingId) => {
        get().ensureView(listingId);
        set({ activeListingId: listingId });
      },
      updateView: (listingId, updater) => {
        const currentView = get().views[listingId] ?? buildInitialView(listingId);
        set((state) => ({
          views: {
            ...state.views,
            [listingId]: updater(currentView),
          },
        }));
      },
      resetView: (listingId) => {
        set((state) => ({
          views: {
            ...state.views,
            [listingId]: buildInitialView(listingId),
          },
        }));
      },
      ensureView: (listingId) => {
        const currentView = get().views[listingId];
        if (currentView) {
          return;
        }

        set((state) => ({
          views: {
            ...state.views,
            [listingId]: buildInitialView(listingId),
          },
        }));
      },
    }),
    {
      name: "civitas-listing-center",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        activeListingId: state.activeListingId,
        views: state.views,
      }),
    },
  ),
);
