import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BusinessCard } from "@/components/BusinessCard";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, type Category } from "@/lib/network";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Business Network — Community Market Network" },
      { name: "description", content: "Discover fast-food vendors, fruit sellers, bakeries and tuck shops in your community." },
      { property: "og:title", content: "Local Business Network" },
      { property: "og:description", content: "Discover and connect with small businesses in your community." },
    ],
  }),
  component: NetworkPage,
});

function NetworkPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const { data, isLoading } = useQuery({
    queryKey: ["businesses", "all"],
    queryFn: async () => (await supabase.from("businesses").select("*").order("created_at")).data ?? [],
  });
  const list = (data ?? []).filter(
    (b) =>
      (cat === "all" || b.category === cat) &&
      (q === "" || `${b.name} ${b.description} ${b.area}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">Local Business Network</h1>
      <p className="mt-1 text-muted-foreground">Find vendors to buy from, refer customers to, and work with.</p>
      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-11 pl-9" placeholder="Search by name, product or area…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {[{ value: "all" as const, label: "All", emoji: "✨" }, ...CATEGORIES].map((c) => (
          <button
            key={c.value}
            onClick={() => setCat(c.value)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              cat === c.value ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {!isLoading && list.length === 0 && <p className="text-muted-foreground">No businesses match yet.</p>}
        {list.map((b) => <BusinessCard key={b.id} b={b} />)}
      </div>
    </div>
  );
}
