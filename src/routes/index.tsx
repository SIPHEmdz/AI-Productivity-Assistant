import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Handshake, Megaphone, Truck } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { BusinessCard } from "@/components/BusinessCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Community Market Network — Small businesses growing together" },
      { name: "description", content: "Connect with local vendors, buy stock from each other and share opportunities in your community." },
      { property: "og:title", content: "Community Market Network" },
      { property: "og:description", content: "A digital community market where small businesses help each other grow." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Handshake, title: "Business Network", text: "Find, follow and recommend vendors in your area.", to: "/network" as const },
  { icon: Truck, title: "Supply Market", text: "Buy tomatoes, rolls and stock from businesses near you.", to: "/supply" as const },
  { icon: Megaphone, title: "Opportunity Board", text: "Catering jobs, bulk orders and partnerships to share.", to: "/opportunities" as const },
];

function Index() {
  const { data: businesses } = useQuery({
    queryKey: ["businesses", "featured"],
    queryFn: async () => (await supabase.from("businesses").select("*").order("rating", { ascending: false }).limit(3)).data ?? [],
  });

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="Vendors chatting at a township street market" width={1600} height={1008} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-fade" />
        <div className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-32 text-primary-foreground">
          <span className="mb-4 w-fit rounded-full bg-sun px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
            Community Market Network
          </span>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.02] md:text-7xl">
            One small business does not have to grow alone.
          </h1>
          <p className="mt-5 max-w-xl text-lg opacity-90">
            The fruit seller supplies the kota shop. The bakery supplies the caterer. Join a network of local vendors who buy from, refer and work with each other.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="shadow-lift">
              <Link to="/auth">List your business — free</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/network">Explore the network</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 md:grid-cols-3">
        {features.map((f) => (
          <Link key={f.to} to={f.to} className="group rounded-2xl border bg-card p-6 shadow-card transition hover:shadow-lift">
            <f.icon className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-xl font-bold">{f.title}</h2>
            <p className="mt-1 text-muted-foreground">{f.text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      <section className="pattern-dots border-y py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-3xl font-bold">Businesses on the network</h2>
            <Link to="/network" className="text-sm font-semibold text-primary">See all →</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {businesses?.map((b) => <BusinessCard key={b.id} b={b} />)}
          </div>
        </div>
      </section>
    </>
  );
}
