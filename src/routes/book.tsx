import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarX, Check, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Avatar, Card, EmptyState, LoadingCards, Logo } from "@/components/site";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, getSlots, isoDate } from "@/lib/slots";
import { fmtDate, fmtPrice, fmtTime, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): { reschedule?: string | undefined } => ({ reschedule: typeof s["reschedule"] === "string" ? s["reschedule"] : undefined }),
  head: () => ({
    meta: [
      { title: "Book an appointment — Seabright Dental" },
      { name: "description", content: "Choose a service, dentist and time that suits you." },
      { property: "og:title", content: "Book an appointment — Seabright Dental" },
      { property: "og:description", content: "Choose a service, dentist and time that suits you." },
    ],
  }),
  component: Book,
});

const STEPS = ["Service", "Dentist", "Time", "Details"];

function Book() {
  const { reschedule } = Route.useSearch();
  const { state, addBooking, updateBooking } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string>();
  const [dentistId, setDentistId] = useState<string>("any");
  const [date, setDate] = useState(() => isoDate(new Date()));
  const [time, setTime] = useState<string>();
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  const original = reschedule ? state?.bookings.find((b) => b.id === reschedule) : undefined;
  useEffect(() => {
    if (original && !prefilled) {
      setServiceId(original.serviceId);
      setDentistId(original.dentistId);
      setDate(original.date);
      setStep(2);
      setPrefilled(true);
    }
  }, [original, prefilled]);

  useEffect(() => {
    setLoadingSlots(true);
    setTime(undefined);
    const t = setTimeout(() => setLoadingSlots(false), 450);
    return () => clearTimeout(t);
  }, [date, dentistId]);

  const service = state?.services.find((s) => s.id === serviceId);
  const activeDentists = state?.dentists.filter((d) => d.active) ?? [];
  const slots = useMemo(() => {
    if (!state || !service) return [];
    const today = isoDate(new Date());
    const now = new Date().getHours() * 60 + new Date().getMinutes();
    return getSlots({
      date,
      dentistIds: dentistId === "any" ? activeDentists.map((d) => d.id) : [dentistId],
      hours: state.hours,
      bookings: state.bookings,
      services: state.services,
      duration: service.duration,
      ignoreBookingId: reschedule,
    }).map((s) => {
      const [h = 0, m = 0] = s.time.split(":").map(Number);
      return date === today && h * 60 + m <= now ? { ...s, available: false } : s;
    });
  }, [state, service, date, dentistId, reschedule]);
  const days = Array.from({ length: 14 }, (_, i) => addDays(isoDate(new Date()), i));
  const freeCount = slots.filter((s) => s.available).length;

  const nextOpenDay = () => {
    const i = days.indexOf(date);
    setDate(days[Math.min(i + 1, days.length - 1)]);
  };

  const valid = form.name.trim().length > 1 && /^[\d\s+()-]{7,}$/.test(form.phone) && /\S+@\S+\.\S+/.test(form.email);

  const confirm = () => {
    if (!service || !time) return;
    const slot = slots.find((s) => s.time === time);
    const finalDentist = dentistId === "any" ? slot?.dentistId ?? activeDentists[0].id : dentistId;
    if (original) {
      updateBooking(original.id, { date, time, dentistId: finalDentist, status: "confirmed" });
      navigate({ to: "/booking/$id", params: { id: original.id } });
    } else {
      const b = addBooking({ serviceId: service.id, dentistId: finalDentist, date, time, ...form });
      navigate({ to: "/booking/$id", params: { id: b.id } });
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Logo />
          <Link to="/" className="text-sm text-muted-foreground">Exit</Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        {original && (
          <p className="mb-4 rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
            Rescheduling {original.id} · currently {fmtDate(original.date)} at {fmtTime(original.time)}
          </p>
        )}
        <ol className="mb-6 flex gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <div className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
              <span className={cn("mt-1.5 block text-xs", i === step ? "font-semibold text-foreground" : "text-muted-foreground")}>{s}</span>
            </li>
          ))}
        </ol>
        {step > 0 && !(original && step === 2) && (
          <button onClick={() => setStep(step - 1)} className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
            <ArrowLeft className="size-4" /> Back
          </button>
        )}

        {!state ? (
          <LoadingCards count={4} />
        ) : step === 0 ? (
          <section>
            <h1 className="font-display text-2xl font-semibold">What do you need?</h1>
            {state.services.length === 0 ? (
              <div className="mt-5"><EmptyState icon={<CalendarX className="size-5" />} title="No services yet" text="Online booking isn't available right now. Please call the clinic." /></div>
            ) : (
              <div className="mt-5 space-y-3">
                {state.services.map((s) => (
                  <button key={s.id} onClick={() => { setServiceId(s.id); setStep(1); }} className={cn("w-full rounded-3xl border bg-card p-4 text-left shadow-soft transition hover:border-primary", serviceId === s.id && "border-primary ring-2 ring-primary/20")}>
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-sm font-semibold text-primary">{fmtPrice(s.price)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{s.duration} min</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : step === 1 ? (
          <section>
            <h1 className="font-display text-2xl font-semibold">Choose a dentist</h1>
            <div className="mt-5 space-y-3">
              {[{ id: "any", name: "Anyone available", title: "Most time slots to choose from", bio: "", active: true }, ...activeDentists].map((d) => (
                <button key={d.id} onClick={() => { setDentistId(d.id); setStep(2); }} className={cn("flex w-full items-center gap-4 rounded-3xl border bg-card p-4 text-left shadow-soft transition hover:border-primary", dentistId === d.id && "border-primary ring-2 ring-primary/20")}>
                  {d.id === "any" ? <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><Users className="size-5" /></span> : <Avatar name={d.name} />}
                  <div>
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-sm text-muted-foreground">{d.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : step === 2 ? (
          <section>
            <h1 className="font-display text-2xl font-semibold">Pick a date & time</h1>
            <div className="-mx-4 mt-5 flex snap-x gap-2 overflow-x-auto px-4 pb-2">
              {days.map((d) => {
                const closed = state.hours[new Date(d + "T00:00").getDay()].closed;
                return (
                  <button key={d} onClick={() => setDate(d)} className={cn("flex w-16 shrink-0 snap-start flex-col items-center rounded-2xl border bg-card py-3 transition", d === date ? "border-primary bg-primary text-primary-foreground" : closed && "opacity-50")}>
                    <span className="text-xs">{fmtDate(d, { weekday: "short" })}</span>
                    <span className="font-display text-xl font-semibold">{fmtDate(d, { day: "numeric" })}</span>
                    <span className="text-[10px]">{fmtDate(d, { month: "short" })}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-5">
              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-11 rounded-2xl" />)}
                </div>
              ) : freeCount === 0 ? (
                <EmptyState
                  icon={<CalendarX className="size-5" />}
                  title="No slots available"
                  text={slots.length === 0 ? "The clinic is closed on this day." : "Every slot is taken on this day. Try another day or dentist."}
                  action={<button onClick={nextOpenDay} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Try next day</button>}
                />
              ) : (
                <>
                  <p className="mb-3 text-sm text-muted-foreground">{freeCount} times available · {fmtDate(date, { weekday: "long", day: "numeric", month: "long" })}</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((s) => (
                      <button key={s.time} disabled={!s.available} onClick={() => setTime(s.time)} className={cn("h-11 rounded-2xl border text-sm font-medium transition", !s.available ? "cursor-not-allowed bg-muted text-muted-foreground line-through opacity-60" : time === s.time ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary")}>
                        {fmtTime(s.time)}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Crossed-out times are already booked.</p>
                </>
              )}
            </div>
          </section>
        ) : (
          <section>
            <h1 className="font-display text-2xl font-semibold">Your details</h1>
            <div className="mt-5 space-y-4">
              {(["name", "phone", "email"] as const).map((f) => (
                <div key={f} className="space-y-1.5">
                  <Label htmlFor={f} className="capitalize">{f === "name" ? "Full name" : f}</Label>
                  <Input id={f} type={f === "email" ? "email" : f === "phone" ? "tel" : "text"} autoComplete={f === "phone" ? "tel" : f} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="h-12 rounded-2xl bg-card" placeholder={f === "name" ? "Jane Smith" : f === "phone" ? "07700 900123" : "jane@example.com"} />
                </div>
              ))}
            </div>
            <Card className="mt-6 bg-secondary/50">
              <p className="text-sm font-semibold">{service?.name}</p>
              <p className="text-sm text-muted-foreground">
                {fmtDate(date, { weekday: "long", day: "numeric", month: "long" })} · {time && fmtTime(time)} · {dentistId === "any" ? "First available dentist" : activeDentists.find((d) => d.id === dentistId)?.name}
              </p>
            </Card>
          </section>
        )}
      </main>

      {state && step >= 2 && (
        <div className="fixed inset-x-0 bottom-0 border-t bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-semibold">{service?.name}</p>
              <p className="truncate text-muted-foreground">{time ? `${fmtDate(date)} · ${fmtTime(time)}` : "Choose a time"}</p>
            </div>
            {step === 2 ? (
              <button disabled={!time} onClick={() => (original ? confirm() : setStep(3))} className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-40">
                {original ? "Confirm new time" : "Continue"}
              </button>
            ) : (
              <button disabled={!valid} onClick={confirm} className="flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-40">
                <Check className="size-4" /> Confirm
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
