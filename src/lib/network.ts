import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Business = Database["public"]["Tables"]["businesses"]["Row"];
export type Category = Database["public"]["Enums"]["business_category"];
export type OpportunityType = Database["public"]["Enums"]["opportunity_type"];

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "fast_food", label: "Fast Food", emoji: "🍔" },
  { value: "fruit_veg", label: "Fruit & Veg", emoji: "🥬" },
  { value: "grocery", label: "Grocery / Tuck Shop", emoji: "🛒" },
  { value: "bakery", label: "Bakery", emoji: "🍞" },
  { value: "home_food", label: "Home Food", emoji: "🍲" },
  { value: "catering", label: "Catering", emoji: "🍽️" },
  { value: "delivery", label: "Delivery", emoji: "🛵" },
  { value: "other", label: "Other", emoji: "🏪" },
];

export const OPP_TYPES: { value: OpportunityType; label: string }[] = [
  { value: "catering", label: "Catering job" },
  { value: "event_supply", label: "Event food supply" },
  { value: "bulk_produce", label: "Bulk produce needed" },
  { value: "delivery", label: "Delivery" },
  { value: "supplier", label: "Supplier wanted" },
  { value: "workers", label: "Temporary workers" },
  { value: "collaboration", label: "Collaboration" },
];

export const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.value === c)?.label ?? c;
export const categoryEmoji = (c: Category) => CATEGORIES.find((x) => x.value === c)?.emoji ?? "🏪";
export const oppLabel = (t: OpportunityType) => OPP_TYPES.find((x) => x.value === t)?.label ?? t;
export const rand = (n: number | null) =>
  n == null ? "" : `R${Number(n).toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`;
export const waLink = (num: string | null, text = "") =>
  num ? `https://wa.me/${num.replace(/\D/g, "")}?text=${encodeURIComponent(text)}` : undefined;

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return { user, loading };
}

export function useMyBusiness() {
  const { user, loading } = useUser();
  const q = useQuery({
    queryKey: ["my-business", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("businesses").select("*").eq("owner_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  return { user, userLoading: loading, business: q.data ?? null, isLoading: loading || (!!user && q.isLoading) };
}
