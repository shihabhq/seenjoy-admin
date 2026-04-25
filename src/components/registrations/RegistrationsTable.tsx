"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Order, OrderStatus } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate, formatCurrency, exportToCSV } from "@/lib/utils";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  ChevronsUpDown,
} from "lucide-react";

const PAGE_SIZE = 15;

const STATUS_OPTIONS: { value: "" | OrderStatus; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

interface RegistrationsTableProps {
  orders: Order[];
}

export function RegistrationsTable({ orders }: RegistrationsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof Order>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [whatsappState, setWhatsappState] = useState<Record<string, boolean>>({});
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  function isWhatsappAdded(order: Order): boolean {
    return order.id in whatsappState ? whatsappState[order.id] : order.whatsappAdded;
  }

  async function toggleWhatsapp(e: React.MouseEvent, order: Order) {
    e.stopPropagation();
    if (toggling[order.id]) return;

    const next = !isWhatsappAdded(order);
    setWhatsappState((s) => ({ ...s, [order.id]: next }));
    setToggling((s) => ({ ...s, [order.id]: true }));

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappAdded: next }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      // revert on failure
      setWhatsappState((s) => ({ ...s, [order.id]: !next }));
    } finally {
      setToggling((s) => ({ ...s, [order.id]: false }));
    }
  }

  const filtered = useMemo(() => {
    let result = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          (o.transactionId?.toLowerCase().includes(q) ?? false)
      );
    }

    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter);
    }

    result.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (av == null) av = "";
      if (bv == null) bv = "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [orders, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function toggleSort(key: keyof Order) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  function handleExport() {
    const data = filtered.map((o) => ({
      ID: o.id,
      Name: o.name,
      Email: o.email,
      Phone: o.phone,
      Course: o.courseName,
      Amount: o.amount,
      Currency: o.currency,
      Status: o.status,
      "Transaction ID": o.transactionId ?? "",
      "Payment Method": o.paymentMethod ?? "",
      "Email Sent": o.emailSent ? "Yes" : "No",
      "WhatsApp Added": o.whatsappAdded ? "Yes" : "No",
      "Registration Date": formatDate(o.createdAt),
    }));
    exportToCSV(data, `seenjoy-registrations-${new Date().toISOString().slice(0, 10)}`);
  }

  const SortHeader = ({
    label,
    field,
  }: {
    label: string;
    field: keyof Order;
  }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider hover:text-[#F0F0F5] transition-colors"
    >
      {label}
      <ChevronsUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, phone, transaction ID…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as "" | OrderStatus);
            setPage(1);
          }}
          className="h-10 px-3 bg-[#111118] border border-[#1E1E2A] text-[#F0F0F5] text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20b2aa]/40 focus:border-[#20b2aa] transition-all cursor-pointer min-w-[148px]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          size="md"
          onClick={handleExport}
          className="gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats bar */}
      <div className="text-xs text-[#6B7280]">
        Showing {pageOrders.length} of {filtered.length} results
        {statusFilter && ` · Filtered by: ${statusFilter}`}
        {search && ` · Search: "${search}"`}
      </div>

      {/* Table */}
      <div className="bg-[#111118] border border-[#1E1E2A] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1E2A]">
                <th className="text-left px-4 py-3 w-8">
                  <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">#</span>
                </th>
                <th className="text-left px-4 py-3">
                  <SortHeader label="Name" field="name" />
                </th>
                <th className="text-left px-4 py-3 hidden md:table-cell">
                  <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Contact</span>
                </th>
                <th className="text-left px-4 py-3">
                  <SortHeader label="Status" field="status" />
                </th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">
                  <SortHeader label="Amount" field="amount" />
                </th>
                <th className="text-left px-4 py-3 hidden xl:table-cell">
                  <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                    Payment
                  </span>
                </th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">
                  <SortHeader label="Date" field="createdAt" />
                </th>
                <th className="text-left px-4 py-3">
                  <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Whatsapp</span>
                </th>
                <th className="w-8 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {pageOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-[#6B7280]">
                    No registrations found
                  </td>
                </tr>
              ) : (
                pageOrders.map((order, idx) => (
                  <>
                    <tr
                      key={order.id}
                      onClick={() =>
                        setExpandedRow(
                          expandedRow === order.id ? null : order.id
                        )
                      }
                      className={`border-b border-[#1A1A24] transition-colors cursor-pointer ${
                        order.status === "PAID" && isWhatsappAdded(order)
                          ? "bg-emerald-950/40 hover:bg-emerald-950/60"
                          : "hover:bg-[#1A1A24]/60"
                      }`}
                    >
                      <td className="px-4 py-3.5 text-xs text-[#6B7280]">
                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-medium text-[#F0F0F5]">
                          {order.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                            <Mail className="w-3 h-3 shrink-0" />
                            {order.email}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                            <Phone className="w-3 h-3 shrink-0" />
                            {order.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-sm font-medium text-[#F0F0F5]">
                          {formatCurrency(order.amount, order.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden xl:table-cell">
                        <div className="flex flex-col gap-0.5">
                          {order.paymentMethod && (
                            <span className="text-xs text-[#9CA3AF]">
                              {order.paymentMethod}
                            </span>
                          )}
                          {order.emailSent && (
                            <span className="text-xs text-emerald-500">
                              Email sent
                            </span>
                          )}
                          {!order.emailSent && (
                            <span className="text-xs text-[#6B7280]">
                              No email
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-[#9CA3AF]">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        {order.status === "PAID" ? (
                          toggling[order.id] ? (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 animate-spin text-[#20b2aa]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                              <span className="text-xs text-[#6B7280]">Saving…</span>
                            </div>
                          ) : (
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isWhatsappAdded(order)}
                                disabled={toggling[order.id]}
                                onChange={() => {}}
                                onClick={(e) => toggleWhatsapp(e, order)}
                                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer disabled:opacity-50"
                              />
                              <span className={`text-xs ${isWhatsappAdded(order) ? "text-emerald-400" : "text-[#6B7280]"}`}>
                                {isWhatsappAdded(order) ? "Added" : "Pending"}
                              </span>
                            </label>
                          )
                        ) : (
                          <span className="text-xs text-[#3A3A4A]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[#6B7280]">
                        <ChevronLeft
                          className={`w-4 h-4 transition-transform ${
                            expandedRow === order.id ? "-rotate-90" : "rotate-180"
                          }`}
                        />
                      </td>
                    </tr>
                    {expandedRow === order.id && (
                      <tr key={`${order.id}-expanded`} className="bg-[#0D0D14]">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-[#6B7280] mb-1">Order ID</p>
                              <p className="text-[#F0F0F5] font-mono">{order.id}</p>
                            </div>
                            <div>
                              <p className="text-[#6B7280] mb-1">Transaction ID</p>
                              <p className="text-[#F0F0F5] font-mono">
                                {order.transactionId ?? "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#6B7280] mb-1">Course</p>
                              <p className="text-[#F0F0F5]">{order.courseName}</p>
                            </div>
                            <div>
                              <p className="text-[#6B7280] mb-1">Payment Method</p>
                              <p className="text-[#F0F0F5]">
                                {order.paymentMethod ?? "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#6B7280] mb-1">Email</p>
                              <p className="text-[#F0F0F5]">{order.email}</p>
                            </div>
                            <div>
                              <p className="text-[#6B7280] mb-1">Phone</p>
                              <p className="text-[#F0F0F5]">{order.phone}</p>
                            </div>
                            <div>
                              <p className="text-[#6B7280] mb-1">Confirmation Email</p>
                              <p
                                className={
                                  order.emailSent
                                    ? "text-emerald-400"
                                    : "text-[#6B7280]"
                                }
                              >
                                {order.emailSent ? "Sent" : "Not sent"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#6B7280] mb-1">Last Updated</p>
                              <p className="text-[#F0F0F5]">
                                {formatDate(order.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E1E2A]">
            <span className="text-xs text-[#6B7280]">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-md text-[#9CA3AF] hover:text-[#F0F0F5] hover:bg-[#1A1A24] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#20b2aa] text-white"
                        : "text-[#9CA3AF] hover:text-[#F0F0F5] hover:bg-[#1A1A24]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-md text-[#9CA3AF] hover:text-[#F0F0F5] hover:bg-[#1A1A24] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
