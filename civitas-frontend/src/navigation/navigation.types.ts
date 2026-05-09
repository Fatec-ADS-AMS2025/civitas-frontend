export type NavigationItem = {
  key: string;
  label: string;
  path: string;
  keywords: string[];
  features: string[];
  category: string;
  icon?: string;
  priority?: number;
};

export type NavigationBreadcrumb = {
  key: string;
  label: string;
  path: string;
};

export type ResolvedNavigationMeta = {
  title: string;
  breadcrumbs: NavigationBreadcrumb[];
};

export type NavigationSearchMatchType =
  | "label-prefix"
  | "label-includes"
  | "keyword-prefix"
  | "keyword-includes"
  | "feature-prefix"
  | "feature-includes";

export type NavigationSearchResult = {
  item: NavigationItem;
  matchType: NavigationSearchMatchType;
};

export type NavigationSearchGroup = {
  category: string;
  items: NavigationSearchResult[];
};
