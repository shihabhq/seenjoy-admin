"use client";

import { useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Percent, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import type { Coupon, CouponType } from "@/types";

interface CouponManagerProps {
  initialCoupons: Coupon[];
}

export function CouponManager({ initialCoupons }: CouponManagerProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE" as CouponType,
    value: "",
    maxUses: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setCreateError(null);

    const value = parseFloat(form.value);
    if (!form.code.trim() || isNaN(value) || value <= 0) {
      setCreateError("সব তথ্য সঠিকভাবে পূরণ করুন");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setCreateError(data.error ?? "Failed to create coupon");
      setSubmitting(false);
      return;
    }

    setCoupons((prev) => [data, ...prev]);
    setForm({ code: "", type: "PERCENTAGE", value: "", maxUses: "" });
    setCreating(false);
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("এই কুপনটি মুছে ফেলবেন?")) return;

    const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function handleToggle(coupon: Coupon) {
    const res = await fetch(`/api/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });

    if (res.ok) {
      const updated = await res.json();
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? updated : c)));
    }
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#9CA3AF]">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""}</p>
        {!creating && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Coupon
          </Button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-[#111118] border border-[#1E1E2A] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#F0F0F5] mb-4">Create Coupon</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Coupon Code"
                placeholder="e.g. SAVE20"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              />
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                  Discount Type
                </label>
                <div className="flex rounded-lg border border-[#1E1E2A] overflow-hidden">
                  {(["PERCENTAGE", "AMOUNT"] as CouponType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, type: t }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
                        form.type === t
                          ? "bg-[#20b2aa]/15 text-[#20b2aa]"
                          : "bg-[#111118] text-[#9CA3AF] hover:text-[#F0F0F5]"
                      }`}
                    >
                      {t === "PERCENTAGE" ? <Percent className="w-3.5 h-3.5" /> : <DollarSign className="w-3.5 h-3.5" />}
                      {t === "PERCENTAGE" ? "Percentage" : "Fixed Amount"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={form.type === "PERCENTAGE" ? "Discount %" : "Discount Amount (BDT)"}
                type="number"
                placeholder={form.type === "PERCENTAGE" ? "e.g. 10" : "e.g. 100"}
                min="1"
                max={form.type === "PERCENTAGE" ? "100" : undefined}
                value={form.value}
                onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
              />
              <Input
                label="Max Uses (leave blank for unlimited)"
                type="number"
                placeholder="Unlimited"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
              />
            </div>

            {createError && (
              <p className="text-red-400 text-sm">{createError}</p>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" loading={submitting}>
                Create Coupon
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setCreating(false); setCreateError(null); }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Tag className="w-10 h-10 text-[#2A2A35] mb-3" />
          <p className="text-sm text-[#6B7280]">No coupons yet</p>
          <p className="text-xs text-[#4B5563] mt-1">Create your first coupon above</p>
        </div>
      ) : (
        <div className="border border-[#1E1E2A] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A1A24] bg-[#0D0D14]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Discount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">Uses</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">Created</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="border-b border-[#1A1A24]/60 last:border-0 hover:bg-[#1A1A24]/40 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-sm font-semibold text-[#20b2aa]">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-[#F0F0F5]">
                      {coupon.type === "PERCENTAGE"
                        ? `${coupon.value}%`
                        : `৳${coupon.value}`}
                    </span>
                    <span className="text-xs text-[#6B7280] ml-1.5">
                      {coupon.type === "PERCENTAGE" ? "off" : "flat"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-[#F0F0F5]">{coupon.usedCount}</span>
                    {coupon.maxUses !== null && (
                      <span className="text-xs text-[#6B7280]"> / {coupon.maxUses}</span>
                    )}
                    {coupon.maxUses === null && (
                      <span className="text-xs text-[#6B7280]"> / ∞</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#6B7280] hidden lg:table-cell">
                    {formatDate(coupon.createdAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        coupon.isActive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-[#1A1A24] text-[#6B7280]"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggle(coupon)}
                        title={coupon.isActive ? "Deactivate" : "Activate"}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#20b2aa] hover:bg-[#20b2aa]/10 transition-colors"
                      >
                        {coupon.isActive
                          ? <ToggleRight className="w-4 h-4" />
                          : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
