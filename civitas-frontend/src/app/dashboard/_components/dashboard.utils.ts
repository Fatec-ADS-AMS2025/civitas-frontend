export const DASHBOARD_HIDDEN_VALUE = "* * * * * *";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

export const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const getDaysUntilDate = (value: string): number | null => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);

  return Math.round((parsed.getTime() - today.getTime()) / 86_400_000);
};

export const getDueSoonLabel = (daysUntilDue: number | null) => {
  if (daysUntilDue === null) return "Sem vencimento";
  if (daysUntilDue < 0) return `Atrasada ha ${Math.abs(daysUntilDue)} dia(s)`;
  if (daysUntilDue === 0) return "Vence hoje";
  return `Vence em ${daysUntilDue} dia(s)`;
};
