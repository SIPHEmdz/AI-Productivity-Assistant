import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { rand } from "@/lib/network";
import { RequestSupplyDialog } from "@/components/RequestSupplyDialog";

export const Route = createFileRoute("/supply")({
  head: () => ({
    meta: [
      { title: "Business Supply Market — Community Market Network" },
      { name: "description", content: "Bulk produce, bread and stock sold business-to-business at special prices." },
      { property: "og:title", content: "Business Supply Market" },
      { property: "og:description", content: "Buy bulk stock from other businesses in your community." },
    ],
  }),
  component: SupplyPage,
});

function SupplyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: async () =>
      (await supabase.from("supply_listings").select("*, businesses(id, name)").eq("available", true).order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">Business Supply Market</h1>
      <p className="mt-1 text-muted-foreground">Wholesale and bulk stock from businesses on the network. For businesses, not ordinary customers.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {data?.map((l) => (
          <div key={l.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent"><Package className="h-5 w-5 text-accent-foreground" /></div>
              <div className="text-right">
                <div className="font-display text-2xl font-bold text-primary">{rand(l.price)}</div>
                <div className="text-xs text-muted-foreground">per {l.unit}</div>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold">{l.title}</h3>
            {l.description && <p className="mt-1 text-sm text-muted-foreground">{l.description}</p>}
            <p className="mt-2 text-sm">Minimum order: <strong>{l.min_order}</strong></p>
            <div className="mt-auto flex items-center justify-between gap-2 pt-4">
              {l.businesses && (
                <Link to="/business/$id" params={{ id: l.businesses.id }} className="truncate text-sm text-secondary hover:underline">
                  {l.businesses.name}
                </Link>
              )}
              <RequestSupplyDialog listing={l} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
