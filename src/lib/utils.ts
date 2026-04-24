import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Shift a UTC timestamp to Bangladesh Standard Time (UTC+6) for display. */
function toBDT(date: string | Date): Date {
  const utcMs = new Date(date).getTime();
  return new Date(utcMs + 6 * 60 * 60 * 1000);
}

export function formatDate(date: string | Date): string {
  return format(toBDT(date), "dd MMM yyyy, hh:mm a");
}

export function formatDateShort(date: string | Date): string {
  return format(toBDT(date), "dd MMM yyyy");
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(toBDT(date), { addSuffix: true });
}

export function formatCurrency(amount: number, currency = "BDT"): string {
  if (currency === "BDT") {
    return `৳${amount.toLocaleString("en-BD")}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const str = value == null ? "" : String(value);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
