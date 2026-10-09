import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, MapPin, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { oppLabel, rand, useMyBusiness, waLink } from "@/lib/network";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunity Board — Community Market Network" },
      { name: "description", content: "Catering jobs, bulk orders, supplier requests and collaborations posted by local businesses." },
      { property: "og:title", content: "Community Opportunity Board" },
      { property: "og:description", content: "Find catering jobs, bulk orders and partnerships near you." },
    ],
  }),
  component: OppsPage,
});

function OppsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () =>
      (await supabase.from("opportunities").select("*, businesses(id, name, whatsapp)").eq("open", true).order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Opportunity Board</h1>
          <p className="mt-1 text-muted-foreground">Work that's bigger than one stall. Apply, team up, grow together.</p>
        </div>
        <Button asChild variant="secondary"><Link to="/dashboard">Post an opportunity</Link></Button>
      </div>
      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {data?.map((o) => (
          <article key={o.id} className="rounded-2xl border bg-card p-6 shadow-card">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">{oppLabel(o.type)}</span>
            <h2 className="mt-3 text-xl font-bold">{o.title}</h2>
            {o.description && <p className="mt-1 text-muted-foreground">{o.description}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {o.budget != null && <span className="flex items-center gap-1"><Wallet className="h-4 w-4" /> {rand(o.budget)}</span>}
              {o.event_date && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(o.event_date).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}</span>}
              {o.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {o.location}</span>}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <ApplyButton oppId={o.id} posterId={o.business_id} />
              {o.businesses?.whatsapp && (
                <Button asChild variant="outline" size="sm">
                  <a href={waLink(o.businesses.whatsapp, `Hi, I saw "${o.title}" on Community Market.`)} target="_blank" rel="noreferrer">Contact organiser</a>
                </Button>
              )}
              {o.businesses && (
                <Link to="/business/$id" params={{ id: o.businesses.id }} className="ml-auto text-sm text-secondary hover:underline">by {o.businesses.name}</Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ApplyButton({ oppId, posterId }: { oppId: string; posterId: string }) {
  const { user, business } = useMyBusiness();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const qc = useQueryClient();
  if (!user) return <Button asChild size="sm"><Link to="/auth">Apply</Link></Button>;
  if (!business) return <Button asChild size="sm" variant="outline"><Link to="/dashboard">Set up business to apply</Link></Button>;
  if (business.id === posterId) return <span className="text-xs text-muted-foreground">Your post</span>;

  async function apply() {
    const { error } = await supabase.from("opportunity_applications").insert({ opportunity_id: oppId, applicant_business_id: business!.id, message: msg || null });
    if (error) return toast.error(error.code === "23505" ? "You've already applied" : error.message);
    toast.success("Application sent");
    qc.invalidateQueries({ queryKey: ["applications"] });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">Apply</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Apply as {business.name}</DialogTitle></DialogHeader>
        <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Tell them what you can offer…" />
        <Button onClick={apply}>Send application</Button>
      </DialogContent>
    </Dialog>
  );
}
