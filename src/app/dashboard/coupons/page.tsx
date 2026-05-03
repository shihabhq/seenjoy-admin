import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { CouponManager } from "@/components/coupons/CouponManager";
import type { Coupon } from "@/types";

async function getCoupons(): Promise<Coupon[]> {
  const supabase = await createClient();

  const [couponsResult, paidOrdersResult] = await Promise.all([
    supabase.from("Coupon").select("*").order("createdAt", { ascending: false }),
    supabase.from("Order").select("couponCode").eq("status", "PAID").not("couponCode", "is", null),
  ]);

  if (couponsResult.error || !couponsResult.data) return [];

  const paidCountMap: Record<string, number> = {};
  for (const order of paidOrdersResult.data ?? []) {
    if (order.couponCode) {
      paidCountMap[order.couponCode] = (paidCountMap[order.couponCode] ?? 0) + 1;
    }
  }

  return couponsResult.data.map((coupon) => ({
    ...coupon,
    paidUsedCount: paidCountMap[coupon.code] ?? 0,
  })) as Coupon[];
}

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <>
      <Header
        title="Coupons"
        description="Create and manage discount coupon codes"
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-[#F0F0F5]">Coupon Codes</h2>
          </CardHeader>
          <CardContent>
            <CouponManager initialCoupons={coupons} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
