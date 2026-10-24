import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, SearchX } from "lucide-react";
import { Card, EmptyState, StatusPill } from "@/components/site";
import type { BookingStatus } from "@/lib/slots";
import { fmtDate, fmtPrice, fmtTime, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/bookings/$id")({
  head: () => ({ meta: [{ title: "Booking detail — Seabright Dental staff" }, { name: "description", content: "Booking detail and status." }] }),
  component: Detail,
});

const statuses: BookingStatus[] = ["confirmed", "completed", "cancelled"];

function Detail() {
  const { id } = Route.useParams();
  const { state, updateBooking } = useStore();
  if (!state) return null;
  const b = state.bookings.find((x) => x.id === id);
  if (!b) return <EmptyState icon={<SearchX className="size-5" />} title="Booking not found" text="It may have been removed when sample data was reset." />;
  const s = state.services.find((x) => x.id === b.serviceId);
  const d = state.dentists.find((x) => x.id === b.dentistId);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link to="/admin/calendar" className="flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="size-4" /> Calendar</Link>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">{b.name}</h1>
        <StatusPill status={b.status} />
      </div>
      <Card>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-muted-foreground">Date</dt><dd className="font-medium">{fmtDate(b.date, { weekday: "short", day: "numeric", month: "long" })}</dd></div>
          <div><dt className="text-muted-foreground">Time</dt><dd className="font-medium">{fmtTime(b.time)} · {s?.duration} min</dd></div>
          <div><dt className="text-muted-foreground">Service</dt><dd className="font-medium">{s?.name}</dd></div>
          <div><dt className="text-muted-foreground">Price</dt><dd className="font-medium">{fmtPrice(s?.price ?? 0)}</dd></div>
          <div className="col-span-2"><dt className="text-muted-foreground">Dentist</dt><dd className="font-medium">{d?.name}</dd></div>
        </dl>
        <div className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm sm:flex-row sm:gap-6">
          <a href={`tel:${b.phone}`} className="flex items-center gap-2 text-primary"><Phone className="size-4" />{b.phone}</a>
          <a href={`mailto:${b.email}`} className="flex items-center gap-2 text-primary"><Mail className="size-4" />{b.email}</a>
        </div>
      </Card>
      <Card>
        <p className="mb-3 text-sm font-semibold">Status</p>
        <div className="grid grid-cols-3 gap-2">
          {statuses.map((st) => (
            <button key={st} onClick={() => updateBooking(b.id, { status: st })} className={cn("rounded-full border py-2.5 text-sm font-medium capitalize", b.status === st ? "border-primary bg-primary text-primary-foreground" : "bg-card")}>{st}</button>
          ))}
        </div>
        <label className="mt-4 block text-sm font-semibold" htmlFor="notes">Notes</label>
        <textarea id="notes" value={b.notes ?? ""} onChange={(e) => updateBooking(b.id, { notes: e.target.value })} placeholder="Internal notes…" className="mt-2 min-h-24 w-full rounded-2xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
      </Card>
    </div>
  );
}
