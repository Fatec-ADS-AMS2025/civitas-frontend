import type React from "react";

export type InfoTone =
  | "default"
  | "teal"
  | "amber"
  | "slate"
  | "coral"
  | "success"
  | "danger";

export type InfoListItem = {
  label: string;
  value: React.ReactNode;
  icon?: string;
  helper?: React.ReactNode;
  tone?: InfoTone;
};

export type InfoListProps = {
  items: InfoListItem[];
  columns?: 1 | 2 | 3 | 4;
  compact?: boolean;
  className?: string;
};

export type InfoCardProps = {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: string;
  tone?: InfoTone;
  primaryItems?: InfoListItem[];
  secondaryItems?: InfoListItem[];
  relationshipItems?: InfoListItem[];
  footerItems?: InfoListItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export type RelationshipCardProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: string;
  items?: InfoListItem[];
  action?: React.ReactNode;
  className?: string;
};

export type RelatedItemsSectionProps = {
  title: string;
  description?: string;
  items: RelationshipCardProps[];
  emptyMessage?: string;
  columns?: 1 | 2 | 3;
  className?: string;
};
