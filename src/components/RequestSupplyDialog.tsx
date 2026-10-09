import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { rand, useMyBusiness } from "@/lib/network";

type Listing = { id: string; title: string; unit: string; price: number; min_order: number; business_id: string };

export function RequestSupplyDialog({ listing }: { listing: Listing }) {
  const { user, business } = useMyBusiness();
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(listing.min_order);
  const [msg, setMsg] = useState("");
  const qc = useQueryClient();

  if (!user) return <Button asChild size="sm"><Link to="/auth">Request Supply</Link></Button>;
  if (!business) return <Button asChild size="sm" variant="outline"><Link to="/dashboard">Set up business first</Link></Button>;
  if (business.id === listing.business_id) return <span className="text-xs text-muted-foreground">Your listing</span>;

  async function send() {
    if (qty < listing.min_order) { toast.error(`Minimum order is ${listing.min_order}`); return; }
    const { error } = await supabase.from("supply_requests").insert({ listing_id: listing.id, buyer_business_id: business!.id, quantity: qty, message: msg || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Request sent to supplier");
    qc.invalidateQueries({ queryKey: ["requests"] });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">Request Supply</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{listing.title}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Quantity ({listing.unit}) — min {listing.min_order}</Label>
            <Input type="number" min={listing.min_order} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          </div>
          <p className="text-sm">Estimated total: <strong>{rand(qty * Number(listing.price))}</strong> · paid on collection</p>
          <div className="space-y-1.5">
            <Label>Message (optional)</Label>
            <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="When do you need it?" />
          </div>
          <Button className="w-full" onClick={send}>Send request</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
