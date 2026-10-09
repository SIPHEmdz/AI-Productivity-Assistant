import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { type Business, categoryEmoji, categoryLabel } from "@/lib/network";

export function BusinessCard({ b }: { b: Business }) {
  return (
    <Link
      to="/business/$id"
      params={{ id: b.id }}
      className="group flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-2xl">
          {categoryEmoji(b.category)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 truncate text-lg font-semibold group-hover:text-primary">
            {b.name}
            {b.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-secondary" aria-label="Verified" />}
          </h3>
          <p className="text-sm text-muted-foreground">{categoryLabel(b.category)}</p>
        </div>
      </div>
      {b.description && <p className="line-clamp-2 text-sm text-muted-foreground">{b.description}</p>}
      <div className="mt-auto flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {b.area || "Local"}
        </span>
        {Number(b.rating) > 0 ? (
          <span className="flex items-center gap-1 font-medium">
            <Star className="h-4 w-4 fill-sun text-sun" /> {Number(b.rating).toFixed(1)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">New</span>
        )}
      </div>
    </Link>
  );
}
