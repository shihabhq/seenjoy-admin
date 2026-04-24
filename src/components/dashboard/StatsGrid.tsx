import { cn, formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  BanknoteIcon,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accentClass: string;
  bgClass: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accentClass,
  bgClass,
}: StatCardProps) {
  return (
    <div className="bg-[#111118] border border-[#1E1E2A] rounded-xl p-5 flex items-start gap-4 hover:border-[#2A2A3A] transition-colors">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", bgClass)}>
        <span className={accentClass}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[#9CA3AF] text-xs font-medium uppercase tracking-wide">
          {title}
        </p>
        <p className="text-2xl font-bold text-[#F0F0F5] mt-0.5 leading-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-[#6B7280] mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  const conversionRate =
    stats.total > 0
      ? ((stats.paid / stats.total) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
      <StatCard
        title="Total Registrations"
        value={stats.total}
        subtitle={`${conversionRate}% conversion rate`}
        icon={<Users className="w-5 h-5" />}
        accentClass="text-[#20b2aa]"
        bgClass="bg-[#20b2aa]/10"
      />
      <StatCard
        title="Paid Orders"
        value={stats.paid}
        subtitle="Successful payments"
        icon={<CheckCircle className="w-5 h-5" />}
        accentClass="text-emerald-400"
        bgClass="bg-emerald-500/10"
      />
      <StatCard
        title="Total Revenue"
        value={formatCurrency(stats.revenue)}
        subtitle="From paid orders"
        icon={<BanknoteIcon className="w-5 h-5" />}
        accentClass="text-[#20b2aa]"
        bgClass="bg-[#20b2aa]/10"
      />
      <StatCard
        title="Pending"
        value={stats.pending}
        subtitle="Awaiting payment"
        icon={<Clock className="w-5 h-5" />}
        accentClass="text-amber-400"
        bgClass="bg-amber-500/10"
      />
      <StatCard
        title="Failed / Cancelled"
        value={stats.failed + stats.cancelled}
        subtitle={`${stats.failed} failed · ${stats.cancelled} cancelled`}
        icon={<XCircle className="w-5 h-5" />}
        accentClass="text-red-400"
        bgClass="bg-red-500/10"
      />
    </div>
  );
}
