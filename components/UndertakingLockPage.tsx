"use client";

import { useTransition } from "react";
import { UndertakingAgreement } from "./UndertakingAgreement";

interface Client {
  id: string;
  name: string;
  email?: string | null;
}

interface UndertakingLockPageProps {
  client: Client;
}

export function UndertakingLockPage({ client }: UndertakingLockPageProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          const response = await fetch("/api/portal/undertaking/submit", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              checkboxes: {
                medicalNotTreatment: true,
                disclosedHealthInfo: true,
                trainerNodiagnose: true,
                acceptResponsibility: true,
                informOfChanges: true,
                finalAgreement: true,
              },
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            const errorMsg =
              data.error || data.message || "Failed to submit undertaking";
            console.error("API Error:", errorMsg);
            throw new Error(errorMsg);
          }

          // Redirect to portal on success (will reload and show dashboard)
          window.location.href = "/portal";
          resolve();
        } catch (error: any) {
          console.error("Undertaking submission error:", error);
          reject(error);
        }
      });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Blurred Background */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-40" />

      {/* Content Container */}
      <div className="relative z-50 w-full max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">
              Welcome to BRUTAL
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Before you start
            </h1>
            <p className="text-sm text-white/60">
              Please review and accept the undertaking below to access your training
              portal.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-10 shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <UndertakingAgreement
              clientName={client.name}
              email={client.email || ""}
              onSubmit={handleSubmit}
              isLoading={isPending}
            />
          </div>

          {/* Footer Note */}
          <p className="text-xs text-white/40 text-center max-w-md mx-auto">
            This is a required agreement for all BRUTAL clients. Your safety and
            understanding are our priority.
          </p>
        </div>
      </div>
    </div>
  );
}
