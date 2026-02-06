"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { HQActivityGraph } from "@/components/admin/HQActivityGraph";

type ClientSummary = {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  todayCompletion: number;
  lastActivity: string | Date | null;
};

type TrainerSummary = {
  id: string;
  username: string;
  joinedDate: string;
};

type HQDashboardProps = {
  initialClients: ClientSummary[];
  initialTrainerCount: number;
  initialTrainers: TrainerSummary[];
};

export function HQDashboard({ initialClients, initialTrainerCount, initialTrainers }: HQDashboardProps) {
  const router = useRouter();
  const clients = initialClients;
  const trainers = initialTrainers;
  const [trainerCount, setTrainerCount] = useState(initialTrainerCount);

  const [clientForm, setClientForm] = useState({
    name: "",
    username: "",
    passcode: "",
    email: "",
  });

  const [trainerForm, setTrainerForm] = useState({
    username: "",
    passcode: "",
  });

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<"client" | "trainer">("client");
  const [viewTab, setViewTab] = useState<"clients" | "trainers">("clients");

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to create client.");
      }

      setClientForm({ name: "", username: "", passcode: "", email: "" });
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/hq/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trainerForm),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to create trainer.");
      }

      setTrainerForm({ username: "", passcode: "" });
      setTrainerCount(trainerCount + 1);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/hq/logout", { method: "POST" });
    router.push("/hq/login");
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

  const handleDeleteTrainer = async (trainerId: string) => {
    const confirmed = window.confirm("Delete this trainer? This cannot be undone.");
    if (!confirmed) return;
    setError(null);
    setDeletingId(trainerId);
    try {
      const res = await fetch(`/api/hq/trainers/${trainerId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to delete trainer.");
      }
      setTrainerCount(trainerCount - 1);
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
          <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Headquarters</p>
          <h1 className="text-3xl md:text-4xl font-bold">System Control</h1>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
        >
          Logout
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-8 shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] text-center">
          <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Total Clients</p>
          <p className="text-5xl font-bold mt-3">{clients.length}</p>
        </div>
        <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-8 shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] text-center">
          <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Total Trainers</p>
          <p className="text-5xl font-bold mt-3">{trainerCount}</p>
        </div>
      </div>

      {/* Activity Graph */}
      <HQActivityGraph trainerCount={trainerCount} clientCount={clients.length} />

      {/* Form Tabs - Improved Toggle */}
      <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-8 shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-6">
        {/* Enhanced Tab Toggle */}
        <div className="flex gap-2 bg-white/[0.02] p-1 rounded-[12px] border border-white/10 w-fit">
          <button
            onClick={() => setActiveForm("client")}
            className={cn(
              "px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-all duration-300",
              activeForm === "client"
                ? "bg-white text-black shadow-lg"
                : "text-white/70 hover:text-white"
            )}
          >
            Create Client
          </button>
          <button
            onClick={() => setActiveForm("trainer")}
            className={cn(
              "px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-all duration-300",
              activeForm === "trainer"
                ? "bg-white text-black shadow-lg"
                : "text-white/70 hover:text-white"
            )}
          >
            Create Trainer
          </button>
        </div>

        {/* Client Form */}
        {activeForm === "client" && (
          <form onSubmit={handleCreateClient} className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Client info</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-white/80">
                  Name
                  <input
                    value={clientForm.name}
                    onChange={(e) => setClientForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full rounded-[14px] border border-white/15 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-white/40 transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] focus:ring-2 focus:ring-white/20"
                    placeholder="Client name"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Login credentials</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-white/80">
                  Username
                  <input
                    value={clientForm.username}
                    onChange={(e) => setClientForm((prev) => ({ ...prev, username: e.target.value }))}
                    required
                    className="w-full rounded-[14px] border border-white/15 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-white/40 transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] focus:ring-2 focus:ring-white/20"
                    placeholder="client123"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-white/80">
                  Passcode
                  <input
                    value={clientForm.passcode}
                    onChange={(e) => setClientForm((prev) => ({ ...prev, passcode: e.target.value }))}
                    required
                    className="w-full rounded-[14px] border border-white/15 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-white/40 transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] focus:ring-2 focus:ring-white/20"
                    placeholder="Minimum 4 chars"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Optional</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-white/80">
                  Email (optional)
                  <input
                    value={clientForm.email}
                    onChange={(e) => setClientForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-[14px] border border-white/15 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-white/40 transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] focus:ring-2 focus:ring-white/20"
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
                "inline-flex w-full items-center justify-center rounded-[14px] border border-white/20 bg-white px-4 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-white/95 hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
                loading && "hover:bg-white"
              )}
            >
              {loading ? "Creating..." : "Create Client"}
            </button>
          </form>
        )}

        {/* Trainer Form */}
        {activeForm === "trainer" && (
          <form onSubmit={handleCreateTrainer} className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Trainer credentials</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-white/80">
                  Username
                  <input
                    value={trainerForm.username}
                    onChange={(e) => setTrainerForm((prev) => ({ ...prev, username: e.target.value }))}
                    required
                    className="w-full rounded-[14px] border border-white/15 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-white/40 transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] focus:ring-2 focus:ring-white/20"
                    placeholder="trainer123"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-white/80">
                  Passcode
                  <input
                    value={trainerForm.passcode}
                    onChange={(e) => setTrainerForm((prev) => ({ ...prev, passcode: e.target.value }))}
                    required
                    className="w-full rounded-[14px] border border-white/15 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-white/40 transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] focus:ring-2 focus:ring-white/20"
                    placeholder="Minimum 4 chars"
                  />
                </label>
              </div>
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "inline-flex w-full items-center justify-center rounded-[14px] border border-white/20 bg-white px-4 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-white/95 hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
                loading && "hover:bg-white"
              )}
            >
              {loading ? "Creating..." : "Create Trainer"}
            </button>
          </form>
        )}
      </div>

      {/* View Toggle and Lists */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 bg-white/[0.02] p-1 rounded-[12px] border border-white/10">
            <button
              onClick={() => setViewTab("clients")}
              className={cn(
                "px-4 py-2 rounded-[10px] text-sm font-semibold transition-all duration-300",
                viewTab === "clients"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/70 hover:text-white"
              )}
            >
              All Clients
            </button>
            <button
              onClick={() => setViewTab("trainers")}
              className={cn(
                "px-4 py-2 rounded-[10px] text-sm font-semibold transition-all duration-300",
                viewTab === "trainers"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/70 hover:text-white"
              )}
            >
              All Trainers
            </button>
          </div>
          <span className="text-sm text-white/60">
            {viewTab === "clients" ? `${clients.length} total` : `${trainerCount} total`}
          </span>
        </div>

        <div className="grid gap-4">
          {viewTab === "clients" ? (
            // Clients View
            clients.length === 0 ? (
              <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-8 text-center">
                <p className="text-sm text-white/60">No clients created yet.</p>
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
                      href={`/hq/clients/${client.id}`}
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
              ))
            )
          ) : (
            // Trainers View
            trainers.length === 0 ? (
              <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-8 text-center">
                <p className="text-sm text-white/60">No trainers created yet.</p>
              </div>
            ) : (
              trainers.map((trainer) => (
                <div
                  key={trainer.id}
                  className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-5 shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">Trainer</p>
                    <h3 className="text-lg font-semibold">@{trainer.username}</h3>
                    <p className="text-sm text-white/50">{formatDate(trainer.joinedDate)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteTrainer(trainer.id)}
                      disabled={deletingId === trainer.id}
                      className={cn(
                        "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60",
                        deletingId === trainer.id && "hover:bg-white/[0.02]"
                      )}
                    >
                      {deletingId === trainer.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
