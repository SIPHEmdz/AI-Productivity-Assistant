import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Clock, MapPin, MessageCircle, Phone, Share2, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { categoryEmoji, categoryLabel, rand, useMyBusiness, waLink } from "@/lib/network";
import { RequestSupplyDialog } from "@/components/RequestSupplyDialog";

export const Route = createFileRoute("/business/$id")({
  head: () => ({
    meta: [
      { title: "Business profile — Community Market Network" },
      { name: "description", content: "View this local business, its supply listings and how to get in touch." },
      { property: "og:title", content: "Local business on Community Market Network" },
      { property: "og:description", content: "Support local — view this business profile." },
    ],
  }),
  component: BusinessPage,
});

function BusinessPage() {
  const { id } = Route.useParams();
  const { business: mine } = useMyBusiness();
  const qc = useQueryClient();

  const { data: b, isLoading } = useQuery({
    queryKey: ["business", id],
    queryFn: async () => (await supabase.from("businesses").select("*").eq("id", id).maybeSingle()).data,
  });
  const { data: listings } = useQuery({
    queryKey: ["listings", id],
    queryFn: async () => (await supabase.from("supply_listings").select("*").eq("business_id", id).eq("available", true)).data ?? [],
  });
  const { data: followers } = useQuery({
    queryKey: ["follows", id],
    queryFn: async () => (await supabase.from("follows").select("follower_business_id").eq("followed_business_id", id)).data ?? [],
  });

  if (isLoading) return <p className="p-10 text-muted-foreground">Loading…</p>;
  if (!b) return <p className="p-10">Business not found.</p>;

  const following = !!mine && followers?.some((f) => f.follower_business_id === mine.id);

  async function toggleFollow() {
    if (!mine) { toast.error("Set up your business first to follow others"); return; }
    const res = following
      ? await supabase.from("follows").delete().eq("follower_business_id", mine.id).eq("followed_business_id", id)
      : await supabase.from("follows").insert({ follower_business_id: mine.id, followed_business_id: id });
    if (res.error) { toast.error(res.error.message); return; }
    qc.invalidateQueries({ queryKey: ["follows", id] });
  }

  async function recommend() {
    const url = window.location.href;
    const text = `Support local! Check out ${b!.name} on Community Market: ${url}`;
    if (navigator.share) await navigator.share({ title: b!.name, text, url }).catch(() => {});
    else {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied — share it with a customer");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-3xl border bg-card p-8 shadow-card">
        <div className="flex flex-wrap items-start gap-5">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-accent text-4xl">{categoryEmoji(b.category)}</div>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              {b.name} {b.verified && <BadgeCheck className="h-6 w-6 text-secondary" />}
            </h1>
            <p className="text-muted-foreground">{categoryLabel(b.category)}{b.owner_name && ` · run by ${b.owner_name}`}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {Number(b.rating) > 0 && <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-sun text-sun" /> {Number(b.rating).toFixed(1)}</span>}
              {b.area && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {b.area}</span>}
              {b.hours && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {b.hours}</span>}
              {b.delivery && <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Delivers</span>}
              <span>{followers?.length ?? 0} followers</span>
            </div>
          </div>
        </div>
        {b.description && <p className="mt-6 text-lg">{b.description}</p>}
        <div className="mt-6 flex flex-wrap gap-2">
          {b.whatsapp && (
            <Button asChild className="bg-success text-success-foreground hover:bg-success/90">
              <a href={waLink(b.whatsapp, "Hi, I found you on Community Market.")} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
            </Button>
          )}
          {b.phone && <Button asChild variant="outline"><a href={`tel:${b.phone}`}><Phone className="h-4 w-4" /> Call</a></Button>}
          {mine?.id !== b.id && (
            <Button variant={following ? "secondary" : "outline"} onClick={toggleFollow}>{following ? "Following" : "Follow"}</Button>
          )}
          <Button variant="ghost" onClick={recommend}><Share2 className="h-4 w-4" /> Recommend</Button>
        </div>
      </div>

      {listings && listings.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Supply for businesses</h2>
          <div className="mt-4 divide-y rounded-2xl border bg-card">
            {listings.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex-1">
                  <div className="font-semibold">{l.title}</div>
                  <div className="text-sm text-muted-foreground">{rand(l.price)} per {l.unit} · min {l.min_order}</div>
                </div>
                <RequestSupplyDialog listing={l} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
