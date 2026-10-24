import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, ShieldCheck, Star } from "lucide-react";
import clinic from "@/assets/clinic.jpg";
import { Avatar, Card, LoadingCards, SiteFooter, SiteHeader } from "@/components/site";
import { fmtPrice, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Seabright Dental — Gentle family dentistry" },
      { name: "description", content: "Calm, modern dental care for the whole family. See our services and dentists, then book online." },
      { property: "og:title", content: "Seabright Dental — Gentle family dentistry" },
      { property: "og:description", content: "Calm, modern dental care for the whole family. Book online in under a minute." },
    ],
  }),
  component: Home,
});

function Home() {
  const { state } = useStore();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4">
        <section className="grid gap-8 py-8 md:grid-cols-2 md:items-center md:py-16">
          <div>
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              <Star className="size-3.5" /> 4.9 from 600+ patient reviews
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Gentle dentistry, <span className="text-primary">right by the harbour.</span>
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Check-ups, whitening and care for the whole family — in a calm space where nobody rushes you.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/book" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-soft transition hover:opacity-90">
                Book appointment <ArrowRight className="size-4" />
              </Link>
              <a href="#services" className="inline-flex items-center justify-center rounded-full border bg-card px-6 py-3.5 font-semibold">
                View services
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock className="size-4" /> Open 6 days</span>
              <span className="flex items-center gap-1.5"><MapPin className="size-4" /> 12 Harbour Lane</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-4" /> Most insurers accepted</span>
            </div>
          </div>
          <img src={clinic} alt="Seabright Dental reception" width={1280} height={896} className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-soft" />
        </section>

        <section id="services" className="py-8">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Our services</h2>
          <p className="mt-1 text-muted-foreground">Clear prices, no surprises.</p>
          <div className="mt-6">
            {!state ? (
              <LoadingCards />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {state.services.map((s) => (
                  <Card key={s.id} className="flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold">{s.name}</h3>
                      <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-sm font-semibold text-secondary-foreground">{fmtPrice(s.price)}</span>
                    </div>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.description}</p>
                    <p className="mt-3 text-xs text-muted-foreground">{s.duration} min</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-8">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Meet the dentists</h2>
          <div className="mt-6">
            {!state ? (
              <LoadingCards count={2} />
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {state.dentists.filter((d) => d.active).map((d) => (
                  <Card key={d.id} className="flex gap-4">
                    <Avatar name={d.name} />
                    <div>
                      <h3 className="font-semibold">{d.name}</h3>
                      <p className="text-sm text-primary">{d.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{d.bio}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-8">
          <div className="rounded-[2rem] bg-primary px-6 py-10 text-center text-primary-foreground">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Ready when you are</h2>
            <p className="mt-2 opacity-90">Pick a time that suits you — it takes under a minute.</p>
            <Link to="/book" className="mt-6 inline-flex rounded-full bg-background px-6 py-3 font-semibold text-foreground">
              Book appointment
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
