"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/hq", label: "Dashboard" },
  { href: "/hq/leads", label: "Leads" },
];

export function HQNavigation() {
  const pathname = usePathname();

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.15em] text-white/45 font-medium">HQ Navigation</p>
      <div className="inline-flex flex-wrap gap-2 rounded-[14px] border border-white/10 bg-white/[0.02] p-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                isActive
                  ? "bg-white text-black shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
