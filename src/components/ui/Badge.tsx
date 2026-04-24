import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

interface BadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string; dot: string }
> = {
  PAID: {
    label: "Paid",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    dot: "bg-amber-400",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
    dot: "bg-red-400",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
    dot: "bg-gray-400",
  },
};

export function StatusBadge({ status, className }: BadgeProps) {
  const config = statusConfig[status] ?? statusConfig.PENDING;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
