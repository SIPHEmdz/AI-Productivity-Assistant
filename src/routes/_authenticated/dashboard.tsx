import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { type Business, CATEGORIES, type Category, OPP_TYPES, type OpportunityType, oppLabel, rand, useMyBusiness, waLink } from "@/lib/network";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My business — Community Market Network" },
      { name: "description", content: "Manage your business profile, supply listings, requests and opportunities." },
      { property: "og:title", content: "My business dashboard" },
      { property: "og:description", content: "Manage your business on Community Market Network." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { business, isLoading } = useMyBusiness();
  if (isLoading) return <p className="p-10 text-muted-foreground">Loading…</p>;
  if (!business)
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-4xl font-bold">Set up your business</h1>
        <p className="mt-1 text-muted-foreground">Tell the network who you are. You can change this any time.</p>
        <div className="mt-8"><ProfileForm /></div>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">My business</p>
          <h1 className="text-4xl font-bold">{business.name}</h1>
        </div>
        <Button asChild variant="outline"><Link to="/business/$id" params={{ id: business.id }}>View public profile</Link></Button>
      </div>
      <Tabs defaultValue="requests" className="mt-8">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="requests">Supply requests</TabsTrigger>
          <TabsTrigger value="listings">My supply</TabsTrigger>
          <TabsTrigger value="opps">Opportunities</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="mt-6"><Requests business={business} /></TabsContent>
        <TabsContent value="listings" className="mt-6"><Listings business={business} /></TabsContent>
        <TabsContent value="opps" className="mt-6"><Opps business={business} /></TabsContent>
        <TabsContent value="profile" className="mt-6"><ProfileForm existing={business} /></TabsContent>
      </Tabs>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-card">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function ProfileForm({ existing }: { existing?: Business }) {
  const { user } = useMyBusiness();
  const qc = useQueryClient();
  const [f, setF] = useState({
    name: "", owner_name: "", category: "other" as Category, description: "", phone: "", whatsapp: "", area: "", hours: "", delivery: false, collection: true,
  });
  useEffect(() => {
    if (existing)
      setF({
        name: existing.name, owner_name: existing.owner_name ?? "", category: existing.category, description: existing.description ?? "",
        phone: existing.phone ?? "", whatsapp: existing.whatsapp ?? "", area: existing.area ?? "", hours: existing.hours ?? "",
        delivery: existing.delivery, collection: existing.collection,
      });
  }, [existing]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) { toast.error("Business name is required"); return; }
    const res = existing
      ? await supabase.from("businesses").update(f).eq("id", existing.id)
      : await supabase.from("businesses").insert({ ...f, owner_id: user!.id });
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(existing ? "Profile updated" : "Welcome to the network!");
    qc.invalidateQueries();
  }

  return (
    <form onSubmit={save} className="grid gap-4 rounded-2xl border bg-card p-6 shadow-card sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2"><Label>Business name *</Label><Input value={f.name} onChange={set("name")} maxLength={80} /></div>
      <div className="space-y-1.5"><Label>Owner name</Label><Input value={f.owner_name} onChange={set("owner_name")} /></div>
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v as Category })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5 sm:col-span-2"><Label>Description</Label><Textarea value={f.description} onChange={set("description")} maxLength={500} /></div>
      <div className="space-y-1.5"><Label>Phone</Label><Input value={f.phone} onChange={set("phone")} placeholder="082 123 4567" /></div>
      <div className="space-y-1.5"><Label>WhatsApp (with country code)</Label><Input value={f.whatsapp} onChange={set("whatsapp")} placeholder="27821234567" /></div>
      <div className="space-y-1.5"><Label>Area / location</Label><Input value={f.area} onChange={set("area")} placeholder="Khayelitsha, Site C" /></div>
      <div className="space-y-1.5"><Label>Operating hours</Label><Input value={f.hours} onChange={set("hours")} placeholder="07:00 – 19:00" /></div>
      <label className="flex items-center gap-3"><Switch checked={f.delivery} onCheckedChange={(v) => setF({ ...f, delivery: v })} /> Offers delivery</label>
      <label className="flex items-center gap-3"><Switch checked={f.collection} onCheckedChange={(v) => setF({ ...f, collection: v })} /> Offers collection</label>
      <Button type="submit" className="sm:col-span-2">{existing ? "Save changes" : "Create business profile"}</Button>
    </form>
  );
}

function Listings({ business }: { business: Business }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["listings", business.id, "mine"],
    queryFn: async () => (await supabase.from("supply_listings").select("*").eq("business_id", business.id).order("created_at", { ascending: false })).data ?? [],
  });
  const [f, setF] = useState({ title: "", unit: "", price: "", min_order: "1", description: "" });
  const refresh = () => qc.invalidateQueries({ queryKey: ["listings"] });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!f.title || !f.unit || !f.price) { toast.error("Title, unit and price are required"); return; }
    const { error } = await supabase.from("supply_listings").insert({
      business_id: business.id, title: f.title, unit: f.unit, price: Number(f.price), min_order: Number(f.min_order) || 1, description: f.description || null,
    });
    if (error) { toast.error(error.message); return; }
    setF({ title: "", unit: "", price: "", min_order: "1", description: "" });
    toast.success("Listing added to the Supply Market");
    refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Panel title="Add a supply listing">
        <form onSubmit={add} className="space-y-3">
          <Input placeholder="e.g. Tomatoes — Bulk Supply" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="Unit (10kg bag)" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} />
            <Input placeholder="Price R" type="number" min="0" step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
            <Input placeholder="Min qty" type="number" min="1" value={f.min_order} onChange={(e) => setF({ ...f, min_order: e.target.value })} />
          </div>
          <Textarea placeholder="Details (optional)" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <Button type="submit" className="w-full">Add listing</Button>
        </form>
      </Panel>
      <Panel title="Your listings">
        {data?.length === 0 && <p className="text-sm text-muted-foreground">No listings yet.</p>}
        <div className="divide-y">
          {data?.map((l) => (
            <div key={l.id} className="flex items-center gap-3 py-3">
              <div className="flex-1">
                <div className="font-medium">{l.title}</div>
                <div className="text-sm text-muted-foreground">{rand(l.price)} / {l.unit} · min {l.min_order}</div>
              </div>
              <Switch
                checked={l.available}
                onCheckedChange={async (v) => { await supabase.from("supply_listings").update({ available: v }).eq("id", l.id); refresh(); }}
                aria-label="Available"
              />
              <Button size="icon" variant="ghost" onClick={async () => { await supabase.from("supply_listings").delete().eq("id", l.id); refresh(); }} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

const statusStyle: Record<string, string> = {
  pending: "bg-accent text-accent-foreground",
  accepted: "bg-success text-success-foreground",
  declined: "bg-muted text-muted-foreground",
};

function Requests({ business }: { business: Business }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["requests", business.id],
    queryFn: async () =>
      (await supabase
        .from("supply_requests")
        .select("*, supply_listings(title, unit, price, business_id, businesses(name, whatsapp)), buyer:businesses!supply_requests_buyer_business_id_fkey(id, name, whatsapp)")
        .order("created_at", { ascending: false })).data ?? [],
  });
  const incoming = data?.filter((r) => r.supply_listings?.business_id === business.id) ?? [];
  const outgoing = data?.filter((r) => r.buyer_business_id === business.id) ?? [];

  async function setStatus(id: string, status: "accepted" | "declined") {
    const { error } = await supabase.from("supply_requests").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["requests"] });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Incoming — businesses buying from you">
        {incoming.length === 0 && <p className="text-sm text-muted-foreground">No requests yet. Add supply listings to get started.</p>}
        <div className="space-y-3">
          {incoming.map((r) => (
            <div key={r.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{r.quantity} × {r.supply_listings?.title}</div>
                  <div className="text-sm text-muted-foreground">from {r.buyer?.name} · {rand(r.quantity * Number(r.supply_listings?.price ?? 0))}</div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[r.status]}`}>{r.status}</span>
              </div>
              {r.message && <p className="mt-2 text-sm italic">"{r.message}"</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {r.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => setStatus(r.id, "accepted")}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "declined")}>Decline</Button>
                  </>
                )}
                {r.buyer?.whatsapp && (
                  <Button asChild size="sm" variant="ghost">
                    <a href={waLink(r.buyer.whatsapp, `Hi ${r.buyer.name}, about your order for ${r.supply_listings?.title}…`)} target="_blank" rel="noreferrer">WhatsApp buyer</a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Outgoing — stock you requested">
        {outgoing.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing yet. <Link to="/supply" className="text-primary underline">Browse the Supply Market</Link>.</p>
        )}
        <div className="space-y-3">
          {outgoing.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-2 rounded-xl border p-4">
              <div>
                <div className="font-semibold">{r.quantity} × {r.supply_listings?.title}</div>
                <div className="text-sm text-muted-foreground">from {r.supply_listings?.businesses?.name}</div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[r.status]}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Opps({ business }: { business: Business }) {
  const qc = useQueryClient();
  const { data: mine } = useQuery({
    queryKey: ["opportunities", business.id],
    queryFn: async () =>
      (await supabase
        .from("opportunities")
        .select("*, opportunity_applications(id, message, status, businesses(id, name, whatsapp))")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })).data ?? [],
  });
  const [f, setF] = useState({ type: "collaboration" as OpportunityType, title: "", description: "", budget: "", event_date: "", location: "" });

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!f.title.trim()) { toast.error("Add a title"); return; }
    const { error } = await supabase.from("opportunities").insert({
      business_id: business.id, type: f.type, title: f.title, description: f.description || null,
      budget: f.budget ? Number(f.budget) : null, event_date: f.event_date || null, location: f.location || null,
    });
    if (error) { toast.error(error.message); return; }
    setF({ type: "collaboration", title: "", description: "", budget: "", event_date: "", location: "" });
    toast.success("Posted to the Opportunity Board");
    qc.invalidateQueries({ queryKey: ["opportunities"] });
  }

  async function setApp(id: string, status: "accepted" | "declined") {
    await supabase.from("opportunity_applications").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["opportunities", business.id] });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Panel title="Post an opportunity">
        <form onSubmit={post} className="space-y-3">
          <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v as OpportunityType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{OPP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="e.g. Need 100 lunch meals for an event" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <Textarea placeholder="Details" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Budget R (optional)" type="number" value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} />
            <Input type="date" value={f.event_date} onChange={(e) => setF({ ...f, event_date: e.target.value })} />
          </div>
          <Input placeholder="Location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
          <Button type="submit" className="w-full">Post opportunity</Button>
        </form>
      </Panel>
      <Panel title="Your posts & applicants">
        {mine?.length === 0 && <p className="text-sm text-muted-foreground">You haven't posted anything yet.</p>}
        <div className="space-y-4">
          {mine?.map((o) => (
            <div key={o.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-muted-foreground">{oppLabel(o.type)}</div>
                  <div className="font-semibold">{o.title}</div>
                </div>
                <label className="flex items-center gap-2 text-xs">
                  {o.open ? "Open" : "Closed"}
                  <Switch checked={o.open} onCheckedChange={async (v) => { await supabase.from("opportunities").update({ open: v }).eq("id", o.id); qc.invalidateQueries({ queryKey: ["opportunities"] }); }} />
                </label>
              </div>
              <div className="mt-3 space-y-2">
                {o.opportunity_applications.length === 0 && <p className="text-sm text-muted-foreground">No applicants yet.</p>}
                {o.opportunity_applications.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-muted p-3 text-sm">
                    <div className="flex-1">
                      <strong>{a.businesses?.name}</strong>
                      {a.message && <span className="text-muted-foreground"> — {a.message}</span>}
                    </div>
                    {a.status === "pending" ? (
                      <>
                        <Button size="sm" onClick={() => setApp(a.id, "accepted")}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => setApp(a.id, "declined")}>Decline</Button>
                      </>
                    ) : (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[a.status]}`}>{a.status}</span>
                    )}
                    {a.businesses?.whatsapp && (
                      <Button asChild size="sm" variant="ghost"><a href={waLink(a.businesses.whatsapp)} target="_blank" rel="noreferrer">WhatsApp</a></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
