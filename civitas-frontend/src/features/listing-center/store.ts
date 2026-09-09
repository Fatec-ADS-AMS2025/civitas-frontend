import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LISTING_CENTER_CONFIGS, LISTING_CENTER_REGISTRY } from "./registry";
import type { ListingPanelId, ListingPanelSelection, ListingViewMode, ListingViewState } from "./types";
import { getInitialListingViewState } from "./utils";

type ListingCenterStore = {
  mode: ListingViewMode;
  panelListingIds: ListingPanelSelection;
  views: Record<string, ListingViewState>;
  setMode: (mode: ListingViewMode) => void;
  setPanelListing: (panelId: ListingPanelId, listingId: string) => void;
  updatePanelView: (
    panelId: ListingPanelId,
    listingId: string,
    updater: (currentView: ListingViewState) => ListingViewState,
  ) => void;
  resetPanelView: (panelId: ListingPanelId, listingId: string) => void;
  ensurePanelView: (panelId: ListingPanelId, listingId: string) => void;
};

const fallbackListingId = LISTING_CENTER_CONFIGS[0]?.id ?? "central-usuarios";
const fallbackSecondaryListingId = LISTING_CENTER_CONFIGS[1]?.id ?? fallbackListingId;

export const getListingPanelViewKey = (panelId: ListingPanelId, listingId: string) => `${panelId}:${listingId}`;

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
      mode: "single",
      panelListingIds: {
        primary: fallbackListingId,
        secondary: fallbackSecondaryListingId,
      },
      views: {},
      setMode: (mode) => set({ mode }),
      setPanelListing: (panelId, listingId) => {
        get().ensurePanelView(panelId, listingId);
        set((state) => ({
          panelListingIds: {
            ...state.panelListingIds,
            [panelId]: listingId,
          },
        }));
      },
      updatePanelView: (panelId, listingId, updater) => {
        const viewKey = getListingPanelViewKey(panelId, listingId);
        const currentView = get().views[viewKey] ?? buildInitialView(listingId);
        set((state) => ({
          views: {
            ...state.views,
            [viewKey]: updater(currentView),
          },
        }));
      },
      resetPanelView: (panelId, listingId) => {
        const viewKey = getListingPanelViewKey(panelId, listingId);
        set((state) => ({
          views: {
            ...state.views,
            [viewKey]: buildInitialView(listingId),
          },
        }));
      },
      ensurePanelView: (panelId, listingId) => {
        const viewKey = getListingPanelViewKey(panelId, listingId);
        const currentView = get().views[viewKey];
        if (currentView) {
          return;
        }

        set((state) => ({
          views: {
            ...state.views,
            [viewKey]: buildInitialView(listingId),
          },
        }));
      },
    }),
    {
      name: "civitas-listing-center",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        mode: state.mode,
        panelListingIds: state.panelListingIds,
        views: state.views,
      }),
    },
  ),
);
