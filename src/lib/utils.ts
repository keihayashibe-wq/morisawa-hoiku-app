export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatTime(timeStr: string): string {
  return timeStr;
}

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  PARENT: "PARENT",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "システム管理者",
  TEACHER: "保育士",
  PARENT: "保護者",
};

export const MOOD_LABELS: Record<string, string> = {
  GOOD: "😊 良い",
  NORMAL: "😐 普通",
  BAD: "😢 悪い",
};

export const SEVERITY_COLORS: Record<string, string> = {
  INFO: "bg-blue-100 text-blue-800",
  WARNING: "bg-yellow-100 text-yellow-800",
  CRITICAL: "bg-red-100 text-red-800",
};
