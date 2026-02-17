"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type ClientSummary = {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  todayCompletion: number;
  lastActivity: string | Date | null;
};

type TrainerDashboardProps = {
  trainerName: string;
  initialClients: ClientSummary[];
};

export function TrainerDashboard({ trainerName, initialClients }: TrainerDashboardProps) {
  const router = useRouter();
  const clients = initialClients;

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
  };

  const formatDate = (value: string | Date | null) => {
    if (!value) return "N/A";
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-10 md:space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Trainer</p>
          <h1 className="text-3xl md:text-4xl font-bold">Welcome back, {trainerName}.</h1>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
        >
          Logout
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Clients</h2>
          <span className="text-sm text-white/60">{clients.length} total</span>
        </div>

        <div className="grid gap-4">
          {clients.length === 0 ? (
            <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-8 text-center">
              <p className="text-sm text-white/60">No clients assigned yet.</p>
            </div>
          ) : (
            clients.map((client) => (
              <div
                key={client.id}
                className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-5 shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Client</p>
                  <h3 className="text-lg font-semibold">{client.name}</h3>
                  <p className="text-sm text-white/50">@{client.username}</p>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-white/60">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-white/50 font-medium">Today</p>
                    <p className="text-base text-white">{client.todayCompletion}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-white/50 font-medium">Last activity</p>
                    <p className="text-base text-white">{formatDate(client.lastActivity)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/trainer/messages/${client.id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                  >
                    Messages
                  </Link>
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
