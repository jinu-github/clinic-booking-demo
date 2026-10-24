import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { CalendarDays, LayoutDashboard, LogOut, RotateCcw, Settings2 } from "lucide-react";
import { Card, LoadingCards, Logo } from "@/components/site";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Staff area — Seabright Dental" },
      { name: "description", content: "Clinic staff dashboard for bookings, calendar and settings." },
      { property: "og:title", content: "Staff area — Seabright Dental" },
      { property: "og:description", content: "Clinic staff dashboard for bookings, calendar and settings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/admin/manage", label: "Manage", icon: Settings2 },
] as const;

function AdminLayout() {
  const { state, update, reset } = useStore();
  if (!state) return <div className="mx-auto max-w-md p-6"><LoadingCards /></div>;

  if (!state.admin) {
    return (
      <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-4">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <Card className="p-6">
          <h1 className="font-display text-2xl font-semibold">Staff sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Demo only — no real authentication.</p>
          <div className="mt-5 space-y-3">
            <div className="space-y-1.5"><Label>Email</Label><Input readOnly value="reception@seabright.demo" className="h-11 rounded-2xl" /></div>
            <div className="space-y-1.5"><Label>Password</Label><Input readOnly type="password" value="demo-password" className="h-11 rounded-2xl" /></div>
          </div>
          <button onClick={() => update((s) => ({ ...s, admin: true }))} className="mt-5 w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground">
            Sign in with demo account
          </button>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2"><Logo /><span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">Staff</span></div>
          <nav className="hidden gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/admin" }} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground" activeProps={{ className: "bg-secondary text-secondary-foreground" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-1">
            <button onClick={reset} title="Reset sample data" className="grid size-9 place-items-center rounded-full border text-muted-foreground"><RotateCcw className="size-4" /></button>
            <button onClick={() => update((s) => ({ ...s, admin: false }))} title="Sign out" className="grid size-9 place-items-center rounded-full border text-muted-foreground"><LogOut className="size-4" /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6"><Outlet /></main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t bg-background md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/admin" }} className="flex flex-col items-center gap-0.5 py-2.5 text-xs text-muted-foreground" activeProps={{ className: "text-primary font-semibold" }}>
            <n.icon className="size-5" />{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
