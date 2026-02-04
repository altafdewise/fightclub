"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

type ClientSummary = {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  todayCompletion: number;
  lastActivity: string | Date | null;
};

type AdminDashboardProps = {
  adminName: string;
  initialClients: ClientSummary[];
};

export function AdminDashboard({ adminName, initialClients }: AdminDashboardProps) {
  const router = useRouter();
  const clients = initialClients;
  const [form, setForm] = useState({
    name: "",
    username: "",
    passcode: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to create client.");
      }

      setForm({ name: "", username: "", passcode: "", email: "" });
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleDelete = async (clientId: string) => {
    const confirmed = window.confirm("Delete this client? This removes all data for the client.");
    if (!confirmed) return;
    setError(null);
    setDeletingId(clientId);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to delete client.");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setDeletingId(null);
    }
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
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Admin</p>
          <h1 className="text-3xl md:text-4xl font-semibold">Welcome back, {adminName}.</h1>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
        >
          Logout
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm space-y-6">
        <h2 className="text-xl font-semibold">Create client</h2>

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Client info</p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-white/80">
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
                  placeholder="Client name"
                />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Login credentials</p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-white/80">
                Username
                <input
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  required
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
                  placeholder="client123"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-white/80">
                Passcode
                <input
                  value={form.passcode}
                  onChange={(e) => setForm((prev) => ({ ...prev, passcode: e.target.value }))}
                  required
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
                  placeholder="Minimum 4 chars"
                />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Optional notes</p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-white/80">
                Email (optional)
                <input
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
                  placeholder="client@email.com"
                />
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
              loading && "hover:bg-white"
            )}
          >
            {loading ? "Creating..." : "Create Client"}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Clients</h2>
          <span className="text-sm text-white/60">{clients.length} total</span>
        </div>

        <div className="grid gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Client</p>
                <h3 className="text-lg font-semibold">{client.name}</h3>
                <p className="text-sm text-white/50">@{client.username}</p>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-white/60">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-white/50">Today</p>
                  <p className="text-base text-white">{client.todayCompletion}%</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-white/50">Last activity</p>
                  <p className="text-base text-white">{formatDate(client.lastActivity)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/clients/${client.id}`}
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  Manage
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(client.id)}
                  disabled={deletingId === client.id}
                  className={cn(
                    "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60",
                    deletingId === client.id && "hover:bg-white/[0.02]"
                  )}
                >
                  {deletingId === client.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
