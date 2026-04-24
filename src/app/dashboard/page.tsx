import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Order, DashboardStats } from "@/types";

async function getDashboardData(): Promise<{
  stats: DashboardStats;
  recentOrders: Order[];
}> {
  const supabase = await createClient();

  // NOTE: Table name is "Order" as per Prisma default (model Order → table "Order")
  const { data: orders, error } = await supabase
    .from("Order")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error || !orders) {
    return {
      stats: { total: 0, paid: 0, pending: 0, failed: 0, cancelled: 0, revenue: 0 },
      recentOrders: [],
    };
  }

  const stats: DashboardStats = {
    total: orders.length,
    paid: orders.filter((o) => o.status === "PAID").length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    failed: orders.filter((o) => o.status === "FAILED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    revenue: orders
      .filter((o) => o.status === "PAID")
      .reduce((sum, o) => sum + (o.amount ?? 0), 0),
  };

  return {
    stats,
    recentOrders: (orders as Order[]).slice(0, 8),
  };
}

export default async function DashboardPage() {
  const { stats, recentOrders } = await getDashboardData();

  return (
    <>
      <Header
        title="Dashboard"
        description="Overview of registrations and revenue"
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Stats */}
        <StatsGrid stats={stats} />

        {/* Recent Registrations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#F0F0F5]">
                Recent Registrations
              </h2>
              <a
                href="/dashboard/registrations"
                className="text-xs text-[#20b2aa] hover:text-[#1a9a93] transition-colors"
              >
                View all →
              </a>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#6B7280]">
                No registrations yet
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1A1A24]">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#1A1A24]/60 last:border-0 hover:bg-[#1A1A24]/40 transition-colors"
                    >
                      <td className="px-6 py-3.5 text-sm font-medium text-[#F0F0F5]">
                        {order.name}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-[#9CA3AF] hidden sm:table-cell">
                        {order.email}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3.5 text-sm text-[#F0F0F5] hidden md:table-cell">
                        {formatCurrency(order.amount, order.currency)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#6B7280] hidden lg:table-cell">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Revenue breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-[#F0F0F5]">
                Status Breakdown
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    label: "Paid",
                    count: stats.paid,
                    total: stats.total,
                    color: "bg-emerald-400",
                  },
                  {
                    label: "Pending",
                    count: stats.pending,
                    total: stats.total,
                    color: "bg-amber-400",
                  },
                  {
                    label: "Failed",
                    count: stats.failed,
                    total: stats.total,
                    color: "bg-red-400",
                  },
                  {
                    label: "Cancelled",
                    count: stats.cancelled,
                    total: stats.total,
                    color: "bg-gray-500",
                  },
                ].map((item) => {
                  const pct =
                    stats.total > 0
                      ? Math.round((item.count / stats.total) * 100)
                      : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[#9CA3AF]">{item.label}</span>
                        <span className="text-[#F0F0F5] font-medium">
                          {item.count}{" "}
                          <span className="text-[#6B7280]">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#1A1A24] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-[#F0F0F5]">
                Revenue Summary
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-[#1A1A24]">
                  <span className="text-sm text-[#9CA3AF]">Total Revenue</span>
                  <span className="text-sm font-bold text-[#20b2aa]">
                    {formatCurrency(stats.revenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#1A1A24]">
                  <span className="text-sm text-[#9CA3AF]">Paid Orders</span>
                  <span className="text-sm font-medium text-[#F0F0F5]">
                    {stats.paid}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#1A1A24]">
                  <span className="text-sm text-[#9CA3AF]">
                    Avg. Order Value
                  </span>
                  <span className="text-sm font-medium text-[#F0F0F5]">
                    {stats.paid > 0
                      ? formatCurrency(Math.round(stats.revenue / stats.paid))
                      : "৳0"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-[#9CA3AF]">
                    Potential (if all paid)
                  </span>
                  <span className="text-sm font-medium text-[#6B7280]">
                    {stats.pending > 0
                      ? formatCurrency(stats.pending * 999)
                      : "৳0"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
