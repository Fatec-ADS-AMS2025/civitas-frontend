import { normalizeDateInput } from "@/global/formPayload";

const isCalendarDate = (value: string): boolean => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export const normalizeValidDateInput = (value: unknown): string | undefined => {
  const normalizedDate = normalizeDateInput(value);
  if (!normalizedDate || !isCalendarDate(normalizedDate)) {
    return undefined;
  }

  return normalizedDate;
};

export const parseDateTimestamp = (value?: string): number => {
  const normalizedDate = normalizeValidDateInput(value);
  if (!normalizedDate) return Number.NaN;

  const [year, month, day] = normalizedDate.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
};

export const formatDate = (value?: string): string => {
  const timestamp = parseDateTimestamp(value);

  if (Number.isNaN(timestamp)) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR").format(new Date(timestamp));
};
