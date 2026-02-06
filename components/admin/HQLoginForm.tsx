"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

export function HQLoginForm() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/hq/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Invalid passcode.");
      }

      router.push("/hq");
    } catch (err: any) {
      setError(err.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <label className="flex flex-col gap-2 text-sm text-white/80">
        Passcode
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          required
          className="w-full rounded-[14px] border border-white/15 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-white/40 transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] focus:ring-2 focus:ring-white/20"
          placeholder="Enter passcode"
        />
      </label>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "inline-flex w-full items-center justify-center rounded-[14px] border border-white/20 bg-white px-4 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-white/95 hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60",
          loading && "hover:bg-white"
        )}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
