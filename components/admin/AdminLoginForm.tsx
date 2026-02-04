"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, passcode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to login.");
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="flex flex-col gap-2 text-sm text-white/80">
        Username
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
          placeholder="admin"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-white/80">
        Passcode
        <input
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          type="password"
          required
          className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
          placeholder="****"
        />
      </label>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          "inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60",
          loading && "hover:bg-white"
        )}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
