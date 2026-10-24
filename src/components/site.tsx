import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookingStatus } from "@/lib/slots";
import { cn } from "@/lib/utils";

export function DemoBanner() {
  return (
    <div className="bg-secondary text-secondary-foreground text-xs sm:text-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center">
        <Sparkles className="size-3.5 shrink-0" />
        <span>
          <strong className="font-semibold">Demo with sample data</strong> · bookings are saved only in this browser
        </span>
      </div>
    </div>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid size-9 place-items-center rounded-2xl bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 8 .4 2.7 1 5.5 2.5 5.5S9.5 17 12 17s3 4 4.5 4 2.1-2.8 2.5-5.5c.5-3.5 2-5 2-8C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold">Seabright Dental</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <Link
          to="/book"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
        >
          Book now
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>Seabright Dental · 12 Harbour Lane (fictional clinic)</span>
        <Link to="/admin" className="underline-offset-4 hover:underline">
          Staff area
        </Link>
      </div>
    </footer>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-3xl border bg-card p-5 shadow-soft", className)}>{children}</div>;
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.replace("Dr. ", "").split(" ").map((p) => p[0]).join("").slice(0, 2);
  return (
    <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl bg-accent font-display text-lg font-semibold text-accent-foreground", className)}>
      {initials}
    </span>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed bg-muted/50 px-6 py-10 text-center">
      <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground">{icon}</span>
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-3xl" />
      ))}
    </div>
  );
}

const statusStyle: Record<BookingStatus, string> = {
  confirmed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-success/15 text-success",
};
export function StatusPill({ status }: { status: BookingStatus }) {
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", statusStyle[status])}>{status}</span>;
}
