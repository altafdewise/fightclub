"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { Lock, User, AlertCircle } from "lucide-react";

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
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white/90">
          <User className="w-4 h-4 text-white/60" />
          Username
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full rounded-[14px] border border-white/15 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-white/40 transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] focus:ring-2 focus:ring-white/20"
          placeholder="Enter your username"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white/90">
          <Lock className="w-4 h-4 text-white/60" />
          Passcode
        </label>
        <input
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          type="password"
          required
          className="w-full rounded-[14px] border border-white/15 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-white/40 transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] focus:ring-2 focus:ring-white/20"
          placeholder="Enter your passcode"
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-[12px] bg-red-500/10 border border-red-500/20 p-3.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full rounded-[14px] border border-white/20 bg-white px-4 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-white/95 hover:border-white/40 active:scale-95",
          loading && "opacity-70 cursor-not-allowed hover:bg-white"
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
