import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { RegistrationsTable } from "@/components/registrations/RegistrationsTable";
import type { Order } from "@/types";

async function getOrders(): Promise<Order[]> {
  const supabase = await createClient();

  // NOTE: Table name "Order" matches the Prisma model name
  const { data, error } = await supabase
    .from("Order")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error || !data) return [];
  return data as Order[];
}

export default async function RegistrationsPage() {
  const orders = await getOrders();

  return (
    <>
      <Header
        title="Registrations"
        description={`${orders.length} total registrations`}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <RegistrationsTable orders={orders} />
      </main>
    </>
  );
}
