"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  UNDERTAKING_TEXT,
  UNDERTAKING_CHECKBOXES,
  FINAL_CHECKBOX,
  createInitialCheckboxState,
  areAllCheckboxesChecked,
  UndertakingCheckboxState,
} from "@/lib/undertakingContent";

interface UndertakingAgreementProps {
  clientName: string;
  email: string;
  onSubmit: () => Promise<void>;
  isLoading?: boolean;
}

export function UndertakingAgreement({
  clientName,
  email,
  onSubmit,
  isLoading = false,
}: UndertakingAgreementProps) {
  const [checkboxes, setCheckboxes] = useState<UndertakingCheckboxState>(
    createInitialCheckboxState()
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const allChecked = areAllCheckboxesChecked(checkboxes);

  const handleCheckboxChange = (id: string) => {
    setCheckboxes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!allChecked) {
      setError("Please check all boxes before submitting.");
      return;
    }

    try {
      setError(null);
      await onSubmit();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
          <div>
            <p className="font-semibold text-white">Agreement Confirmed</p>
            <p className="text-sm text-white/60">
              Your undertaking has been accepted. PDF sent to purvik@brutal.fit.
            </p>
          </div>
        </div>
        <p className="text-sm text-white/50">
          You can now access your training portal. Welcome!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agreement Text */}
      <div className="space-y-4">
        <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-8 shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="space-y-6 max-h-96 overflow-y-auto pr-4">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">
                BRUTAL Coaching Undertaking
              </h2>
              <p className="text-xs text-white/50">
                Please read carefully before accepting.
              </p>
            </div>

            <div className="text-sm leading-relaxed text-white/70 whitespace-pre-wrap">
              {UNDERTAKING_TEXT}
            </div>
          </div>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white">
          Confirmation of Understanding
        </h3>

        <div className="space-y-3">
          {UNDERTAKING_CHECKBOXES.map((checkbox) => (
            <label
              key={checkbox.id}
              className="flex items-start gap-3 rounded-[14px] border border-white/10 bg-white/[0.03] p-4 cursor-pointer transition-colors hover:bg-white/[0.05] hover:border-white/15"
            >
              <input
                type="checkbox"
                checked={checkboxes[checkbox.id]}
                onChange={() => handleCheckboxChange(checkbox.id)}
                disabled={isLoading}
                className="w-5 h-5 rounded border-white/30 accent-white mt-0.5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <span className="text-sm text-white/80">{checkbox.label}</span>
            </label>
          ))}
        </div>

        {/* Final Agreement Checkbox */}
        <div className="rounded-[14px] border border-white/20 bg-gradient-to-r from-white/[0.05] to-white/[0.02] p-4 mt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checkboxes[FINAL_CHECKBOX.id]}
              onChange={() => handleCheckboxChange(FINAL_CHECKBOX.id)}
              disabled={isLoading}
              className="w-5 h-5 rounded border-white/30 accent-white mt-0.5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-sm font-medium text-white">
              {FINAL_CHECKBOX.label}
            </span>
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 rounded-[12px] bg-red-500/10 border border-red-500/20 p-3.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Client Info Display */}
      <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-4 space-y-2">
        <p className="text-xs uppercase tracking-[0.1em] text-white/50 font-medium">
          Your Information
        </p>
        <p className="text-sm text-white/90">{clientName}</p>
        <p className="text-sm text-white/60">{email}</p>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!allChecked || isLoading}
        className={cn(
          "w-full rounded-[14px] border border-white/20 bg-white px-4 py-3.5 text-sm font-semibold text-black transition-all duration-300",
          allChecked && !isLoading
            ? "hover:bg-white/95 hover:border-white/40 active:scale-95 cursor-pointer"
            : "opacity-60 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          "Agree & Submit"
        )}
      </button>

      {/* Helper Text */}
      <p className="text-xs text-white/50 text-center">
        You must check all boxes to proceed. This agreement cannot be changed
        after submission.
      </p>
    </div>
  );
}
