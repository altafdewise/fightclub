"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  getPhoneCountryOption,
  phoneCountryCodeOptions,
  type PhoneCountryKey,
} from "@/lib/pricing";

type PricingCountryCodeSelectProps = {
  value: PhoneCountryKey;
  onChange: (value: PhoneCountryKey) => void;
  invalid?: boolean;
};

type PanelPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export function PricingCountryCodeSelect({
  value,
  onChange,
  invalid = false,
}: PricingCountryCodeSelectProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);

  const selectedOption = getPhoneCountryOption(value);

  const closeDropdown = () => {
    setIsOpen(false);
    setQuery("");
  };

  const filteredOptions = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return phoneCountryCodeOptions;
    return phoneCountryCodeOptions.filter((option) =>
      `${option.label} ${option.searchText} ${option.dialCode}`.toLowerCase().includes(search)
    );
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const desiredWidth = Math.max(rect.width, 320);
      const width = Math.min(desiredWidth, window.innerWidth - 24);
      const left = Math.min(rect.left, window.innerWidth - width - 12);
      const bottomSpace = window.innerHeight - rect.bottom - 12;
      const topSpace = rect.top - 12;
      const openAbove = bottomSpace < 260 && topSpace > bottomSpace;
      const maxHeight = Math.max(180, Math.min(360, openAbove ? topSpace : bottomSpace));
      const top = openAbove ? Math.max(12, rect.top - maxHeight - 8) : rect.bottom + 8;

      setPanelPosition({ top, left, width, maxHeight });
    };

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      closeDropdown();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown();
        triggerRef.current?.focus();
      }
    };

    updatePosition();
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [isOpen]);

  const handleSelect = (nextValue: PhoneCountryKey) => {
    onChange(nextValue);
    closeDropdown();
    triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (isOpen) {
            closeDropdown();
            return;
          }
          setQuery("");
          setIsOpen(true);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "flex h-full w-full min-w-0 items-center justify-between gap-2 rounded-l-[14px] rounded-r-[10px] px-3 py-3.5 text-left text-sm text-white transition",
          "bg-transparent",
          invalid ? "text-red-200" : "text-white",
          isOpen ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"
        )}
      >
        <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-none">
          <span className="truncate">{selectedOption.label}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-white/55 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && panelPosition
        ? createPortal(
            <div
              ref={panelRef}
              className="fixed z-[140] overflow-hidden rounded-[20px] border border-white/12 bg-[rgba(10,12,15,0.96)] shadow-[0_20px_60px_rgba(0,0,0,0.45),0_0_30px_rgba(201,168,106,0.08)] backdrop-blur-2xl"
              style={{
                top: `${panelPosition.top}px`,
                left: `${panelPosition.left}px`,
                width: `${panelPosition.width}px`,
              }}
            >
              <div className="border-b border-white/8 p-3">
                <div className="flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <Search className="h-4 w-4 text-white/35" />
                  <input
                    ref={searchInputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search country or code"
                    className="w-full border-0 bg-transparent p-0 text-sm text-white placeholder:text-white/35 focus:border-0 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <div className="overflow-y-auto p-2" style={{ maxHeight: `${panelPosition.maxHeight}px` }}>
                {filteredOptions.map((option) => {
                  const isSelected = option.key === value;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleSelect(option.key)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-3 text-left transition",
                        isSelected
                          ? "border border-[rgba(201,168,106,0.24)] bg-[rgba(201,168,106,0.08)]"
                          : "border border-transparent hover:bg-white/[0.05]"
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                        {option.label}
                      </span>
                      <span className="flex items-center gap-2">
                        <Check className={cn("h-4 w-4 text-[var(--gold)]", isSelected ? "opacity-100" : "opacity-0")} />
                      </span>
                    </button>
                  );
                })}

                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-white/45">No matching country codes.</div>
                ) : null}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
