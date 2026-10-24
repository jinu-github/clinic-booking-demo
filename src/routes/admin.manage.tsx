import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Avatar, Card } from "@/components/site";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/manage")({
  head: () => ({ meta: [{ title: "Manage — Seabright Dental staff" }, { name: "description", content: "Services, dentists and working hours." }] }),
  component: Manage,
});

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const tabs = ["Services", "Dentists", "Hours"] as const;
const field = "h-10 rounded-xl bg-background";

function Manage() {
  const { state, update } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Services");
  if (!state) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="font-display text-3xl font-semibold">Manage clinic</h1>
      <div className="flex rounded-full border bg-card p-1">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("flex-1 rounded-full py-2 text-sm font-medium", tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{t}</button>
        ))}
      </div>

      {tab === "Services" && (
        <div className="space-y-3">
          {state.services.map((s, i) => {
            const set = (patch: Partial<typeof s>) => update((st) => ({ ...st, services: st.services.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
            return (
              <Card key={s.id} className="space-y-2 p-4">
                <div className="flex gap-2">
                  <Input className={field} value={s.name} onChange={(e) => set({ name: e.target.value })} />
                  <button onClick={() => update((st) => ({ ...st, services: st.services.filter((x) => x.id !== s.id) }))} className="grid size-10 shrink-0 place-items-center rounded-xl border text-destructive" aria-label="Delete service"><Trash2 className="size-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-muted-foreground">Price ($)<Input className={field} type="number" min={0} value={s.price} onChange={(e) => set({ price: Number(e.target.value) })} /></label>
                  <label className="text-xs text-muted-foreground">Duration (min)<Input className={field} type="number" step={15} min={15} value={s.duration} onChange={(e) => set({ duration: Number(e.target.value) })} /></label>
                </div>
              </Card>
            );
          })}
          <button onClick={() => update((st) => ({ ...st, services: [...st.services, { id: `svc-${Date.now()}`, name: "New service", duration: 30, price: 50, description: "Describe this service." }] }))} className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed py-4 text-sm font-medium text-primary"><Plus className="size-4" /> Add service</button>
        </div>
      )}

      {tab === "Dentists" && (
        <div className="space-y-3">
          {state.dentists.map((d, i) => {
            const set = (patch: Partial<typeof d>) => update((st) => ({ ...st, dentists: st.dentists.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
            return (
              <Card key={d.id} className="flex items-start gap-3 p-4">
                <Avatar name={d.name} />
                <div className="min-w-0 flex-1 space-y-2">
                  <Input className={field} value={d.name} onChange={(e) => set({ name: e.target.value })} />
                  <Input className={field} value={d.title} onChange={(e) => set({ title: e.target.value })} />
                  <label className="flex items-center gap-2 text-sm text-muted-foreground"><Switch checked={d.active} onCheckedChange={(v) => set({ active: v })} /> Taking bookings</label>
                </div>
                <button onClick={() => update((st) => ({ ...st, dentists: st.dentists.filter((x) => x.id !== d.id) }))} className="grid size-10 shrink-0 place-items-center rounded-xl border text-destructive" aria-label="Remove dentist"><Trash2 className="size-4" /></button>
              </Card>
            );
          })}
          <button onClick={() => update((st) => ({ ...st, dentists: [...st.dentists, { id: `den-${Date.now()}`, name: "Dr. New Dentist", title: "General Dentist", bio: "", active: true }] }))} className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed py-4 text-sm font-medium text-primary"><Plus className="size-4" /> Add dentist</button>
        </div>
      )}

      {tab === "Hours" && (
        <Card className="divide-y p-0">
          {[1, 2, 3, 4, 5, 6, 0].map((i) => {
            const h = state.hours[i]!;
            const set = (patch: Partial<typeof h>) => update((st) => ({ ...st, hours: st.hours.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
            return (
              <div key={i} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="w-24 font-medium">{DAYS[i]}</span>
                <Switch checked={!h.closed} onCheckedChange={(v) => set({ closed: !v })} />
                {h.closed ? (
                  <span className="text-sm text-muted-foreground">Closed</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input type="time" className={cn(field, "w-28")} value={h.open} onChange={(e) => set({ open: e.target.value })} />
                    <span className="text-muted-foreground">–</span>
                    <Input type="time" className={cn(field, "w-28")} value={h.close} onChange={(e) => set({ close: e.target.value })} />
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
