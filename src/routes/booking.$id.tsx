import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, CalendarX, SearchX } from "lucide-react";
import { useState } from "react";
import { Card, EmptyState, LoadingCards, SiteHeader, StatusPill } from "@/components/site";
import { fmtDate, fmtPrice, fmtTime, useStore } from "@/lib/store";

export const Route = createFileRoute("/booking/$id")({
  head: () => ({
    meta: [
      { title: "Your booking — Seabright Dental" },
      { name: "description", content: "View, cancel or reschedule your appointment." },
      { property: "og:title", content: "Your booking — Seabright Dental" },
      { property: "og:description", content: "View, cancel or reschedule your appointment." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const { id } = Route.useParams();
  const { state, updateBooking } = useStore();
  const [asking, setAsking] = useState(false);
  const b = state?.bookings.find((x) => x.id === id);
  const service = state?.services.find((s) => s.id === b?.serviceId);
  const dentist = state?.dentists.find((d) => d.id === b?.dentistId);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-8">
        {!state ? (
          <LoadingCards count={2} />
        ) : !b ? (
          <EmptyState icon={<SearchX className="size-5" />} title="Booking not found" text="This booking may have been made on another device." action={<Link to="/book" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Book a new visit</Link>} />
        ) : (
          <>
            <div className="text-center">
              <span className={`mx-auto grid size-16 place-items-center rounded-full ${b.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-primary text-primary-foreground"}`}>
                {b.status === "cancelled" ? <CalendarX className="size-7" /> : <CalendarCheck className="size-7" />}
              </span>
              <h1 className="mt-4 font-display text-3xl font-semibold">{b.status === "cancelled" ? "Booking cancelled" : "You're booked in!"}</h1>
              <p className="mt-1 text-muted-foreground">
                {b.status === "cancelled" ? "We hope to see you another time." : `A confirmation has been sent to ${b.email} (demo — no email sent).`}
              </p>
            </div>
            <Card className="mt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reference {b.id}</span>
                <StatusPill status={b.status} />
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Service", `${service?.name} · ${fmtPrice(service?.price ?? 0)}`],
                  ["Dentist", dentist?.name],
                  ["Date", fmtDate(b.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })],
                  ["Time", `${fmtTime(b.time)} (${service?.duration} min)`],
                  ["Patient", `${b.name} · ${b.phone}`],
                  ["Where", "12 Harbour Lane, Seabright"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            {b.status === "confirmed" && (
              asking ? (
                <Card className="mt-4 border-destructive/30">
                  <p className="font-semibold">Cancel this appointment?</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => { updateBooking(b.id, { status: "cancelled" }); setAsking(false); }} className="flex-1 rounded-full bg-destructive py-3 text-sm font-semibold text-destructive-foreground">Yes, cancel</button>
                    <button onClick={() => setAsking(false)} className="flex-1 rounded-full border py-3 text-sm font-semibold">Keep it</button>
                  </div>
                </Card>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link to="/book" search={{ reschedule: b.id }} className="rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground">Reschedule</Link>
                  <button onClick={() => setAsking(true)} className="rounded-full border bg-card py-3 text-sm font-semibold text-destructive">Cancel</button>
                </div>
              )
            )}
            {b.status === "cancelled" && (
              <Link to="/book" className="mt-4 block rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground">Book again</Link>
            )}
          </>
        )}
      </main>
    </>
  );
}
