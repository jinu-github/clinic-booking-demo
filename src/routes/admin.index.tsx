import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, CalendarRange, CircleDollarSign, Inbox } from "lucide-react";
import { Card, EmptyState, StatusPill } from "@/components/site";
import { addDays, isoDate, parseIso } from "@/lib/slots";
import { fmtPrice, fmtTime, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Seabright Dental staff" }, { name: "description", content: "Today's bookings at a glance." }] }),
  component: Dashboard,
});

export function weekStart(iso: string) {
  const d = parseIso(iso).getDay();
  return addDays(iso, -((d + 6) % 7));
}

function Dashboard() {
  const { state } = useStore();
  if (!state) return null;
  const today = isoDate(new Date());
  const ws = weekStart(today);
  const we = addDays(ws, 6);
  const active = state.bookings.filter((b) => b.status !== "cancelled");
  const todays = state.bookings.filter((b) => b.date === today).sort((a, b) => a.time.localeCompare(b.time));
  const week = active.filter((b) => b.date >= ws && b.date <= we);
  const revenue = week.reduce((sum, b) => sum + (state.services.find((s) => s.id === b.serviceId)?.price ?? 0), 0);
  const popular = state.services
    .map((s) => ({ s, n: active.filter((b) => b.serviceId === s.id).length }))
    .sort((a, b) => b.n - a.n);
  const max = Math.max(1, ...popular.map((p) => p.n));

  const stats = [
    { label: "Today", value: todays.filter((b) => b.status !== "cancelled").length, icon: CalendarCheck },
    { label: "This week", value: week.length, icon: CalendarRange },
    { label: "Week value", value: fmtPrice(revenue), icon: CircleDollarSign },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Good morning</h1>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className="size-5 text-primary" />
            <p className="mt-3 font-display text-2xl font-semibold sm:text-3xl">{s.value}</p>
            <p className="text-xs text-muted-foreground sm:text-sm">{s.label}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Today's appointments</h2>
            <Link to="/admin/calendar" className="text-sm text-primary">Calendar</Link>
          </div>
          {todays.length === 0 ? (
            <EmptyState icon={<Inbox className="size-5" />} title="Nothing booked today" text="Enjoy the quiet — or check the week ahead." />
          ) : (
            <ul className="divide-y">
              {todays.map((b) => (
                <li key={b.id}>
                  <Link to="/admin/bookings/$id" params={{ id: b.id }} className="flex items-center gap-3 py-3">
                    <span className="w-16 text-sm font-semibold">{fmtTime(b.time)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{b.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{state.services.find((s) => s.id === b.serviceId)?.name} · {state.dentists.find((d) => d.id === b.dentistId)?.name}</span>
                    </span>
                    <StatusPill status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Popular services</h2>
          <ul className="space-y-3">
            {popular.map(({ s, n }) => (
              <li key={s.id}>
                <div className="flex justify-between text-sm"><span>{s.name}</span><span className="text-muted-foreground">{n}</span></div>
                <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${(n / max) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
