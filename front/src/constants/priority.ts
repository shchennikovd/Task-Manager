export type Priority = "low" | "medium" | "high";

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

export const priorityColors: Record<Priority, string> = {
  low: "text-green-500",
  medium: "text-yellow-500",
  high: "text-red-500",
};