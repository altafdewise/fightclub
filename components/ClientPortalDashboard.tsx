'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Check, Shield, AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ClientPortalDashboard() {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showUndertaking, setShowUndertaking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking user agreement status from DB/LocalStorage
    const checkAgreement = () => {
      const agreed = localStorage.getItem('brutal_client_undertaking');
      if (agreed) {
        setHasAgreed(true);
      }
      setIsLoading(false);
    };
    checkAgreement();
  }, []);

  const handleAgreementComplete = () => {
    localStorage.setItem('brutal_client_undertaking', 'true');
    setHasAgreed(true);
    setShowUndertaking(false);
  };

  if (isLoading) return null;

  return (
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-[var(--gold)] selection:text-black">
      {/* Dashboard Content - Always rendered, but styled differently based on lock state */}
      <div
        className={cn(
          "transition-all duration-700 ease-in-out",
          !hasAgreed && "filter blur-md opacity-40 pointer-events-none select-none h-screen overflow-hidden scale-[0.98]"
        )}
      >
        <DashboardStub />
      </div>

      {/* Locked State Overlay */}
      {!hasAgreed && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
          
          {/* CTA Card - Top Priority */}
          <div className="absolute top-6 sm:top-10 w-full max-w-md px-4">
            <div className="glass border border-[var(--gold)]/30 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_0_40px_-10px_rgba(201,168,106,0.15)]">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="space-y-4 w-full">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Client Undertaking</h3>
                    <p className="text-sm text-muted mt-1">Before continuing, please review and agree to the training undertaking.</p>
                  </div>
                  <button
                    onClick={() => setShowUndertaking(true)}
                    className="w-full py-3 rounded-lg bg-[var(--gold)] text-black font-bold text-sm hover:bg-[#d4b36a] transition-colors shadow-lg shadow-[var(--gold)]/10"
                  >
                    Review & Agree
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Center Lock Indicator */}
          <div className="flex flex-col items-center gap-6 text-center mt-20">
            <div className="p-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
              <Lock className="w-10 h-10 text-[var(--gold)] opacity-80" />
            </div>
            <p className="text-white/60 font-medium tracking-wide text-sm uppercase">
              Complete the undertaking to access your client portal
            </p>
          </div>
        </div>
      )}

      {/* Undertaking Modal */}
      {showUndertaking && (
        <UndertakingModal onClose={() => setShowUndertaking(false)} onAgree={handleAgreementComplete} />
      )}
    </div>
  );
}

function UndertakingModal({ onClose, onAgree }: { onClose: () => void; onAgree: () => void }) {
  const router = useRouter();
  const [checks, setChecks] = useState({
    medical: false,
    notMedical: false,
    responsibility: false,
    read: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-bold text-white">Training Undertaking</h2>
            <p className="text-sm text-muted mt-1">Please read carefully before proceeding.</p>
          </div>
          <div className="hidden sm:block p-2 rounded-full bg-white/5">
            <FileText className="w-5 h-5 text-[var(--gold)]" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 text-sm sm:text-base text-white/70 leading-relaxed">
          <section>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" /> Purpose of Training
            </h4>
            <p>The training program provided by BRUTAL is designed for physical conditioning and general fitness. It is strictly educational and coaching-based, not medical advice, diagnosis, or treatment.</p>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" /> Health Responsibility
            </h4>
            <p>You acknowledge that training involves physical exertion which carries inherent risks. You confirm that you are in good physical condition and have disclosed all known medical conditions, injuries, or impairments that might affect your ability to participate.</p>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" /> Trainer Responsibility
            </h4>
            <p>Our certified professionals will provide guidance, programming, and support to help you achieve your goals. However, results depend on individual effort, consistency, and adherence to the plan. The trainer cannot guarantee specific outcomes.</p>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" /> Client Acknowledgement
            </h4>
            <p>You agree to follow instructions to the best of your ability and to communicate any pain or discomfort immediately. You assume full responsibility for your participation in this program.</p>
          </section>
        </div>

        {/* Footer / Actions */}
        <div className="p-6 sm:p-8 border-t border-white/5 bg-white/[0.02] space-y-6">
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={cn("mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors", checks.medical ? "bg-[var(--gold)] border-[var(--gold)] text-black" : "border-white/20 group-hover:border-[var(--gold)]/50")}>
                {checks.medical && <Check className="w-3.5 h-3.5" />}
              </div>
              <input type="checkbox" className="hidden" checked={checks.medical} onChange={e => setChecks(c => ({ ...c, medical: e.target.checked }))} />
              <span className="text-sm text-white/80 select-none">I confirm I have disclosed all known medical conditions.</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={cn("mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors", checks.notMedical ? "bg-[var(--gold)] border-[var(--gold)] text-black" : "border-white/20 group-hover:border-[var(--gold)]/50")}>
                {checks.notMedical && <Check className="w-3.5 h-3.5" />}
              </div>
              <input type="checkbox" className="hidden" checked={checks.notMedical} onChange={e => setChecks(c => ({ ...c, notMedical: e.target.checked }))} />
              <span className="text-sm text-white/80 select-none">I understand this is not medical treatment.</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={cn("mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors", checks.responsibility ? "bg-[var(--gold)] border-[var(--gold)] text-black" : "border-white/20 group-hover:border-[var(--gold)]/50")}>
                {checks.responsibility && <Check className="w-3.5 h-3.5" />}
              </div>
              <input type="checkbox" className="hidden" checked={checks.responsibility} onChange={e => setChecks(c => ({ ...c, responsibility: e.target.checked }))} />
              <span className="text-sm text-white/80 select-none">I agree to proceed at my own responsibility.</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group pt-2 border-t border-white/5">
              <div className={cn("mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors", checks.read ? "bg-[var(--gold)] border-[var(--gold)] text-black" : "border-white/20 group-hover:border-[var(--gold)]/50")}>
                {checks.read && <Check className="w-3.5 h-3.5" />}
              </div>
              <input type="checkbox" className="hidden" checked={checks.read} onChange={e => setChecks(c => ({ ...c, read: e.target.checked }))} />
              <span className="text-sm font-medium text-white select-none">I have read and agree to the undertaking.</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all duration-300 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            >
              Decline
            </button>
            <button
              disabled={!allChecked}
              onClick={onAgree}
              className={cn(
                "flex-[2] py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all duration-300",
                allChecked 
                  ? "bg-[var(--gold)] text-black hover:bg-[#d4b36a] shadow-[0_0_20px_rgba(201,168,106,0.3)]" 
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              )}
            >
              Agree & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dummy Dashboard Content for the "Unlocked" state
function DashboardStub() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-muted">Welcome back, Member.</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10" />
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Daily Training */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Today&apos;s Training</h2>
            <span className="text-xs font-medium px-2 py-1 rounded bg-[var(--gold)]/10 text-[var(--gold)]">PHASE 1</span>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
                <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">
                  {i === 1 && <div className="w-3 h-3 rounded-full bg-[var(--gold)]" />}
                </div>
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-white/10 rounded" />
                  <div className="h-3 w-20 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats / Notes */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
            <h3 className="text-lg font-semibold text-white">Trainer Notes</h3>
            <div className="space-y-2">
              <div className="h-3 w-full bg-white/10 rounded" />
              <div className="h-3 w-5/6 bg-white/10 rounded" />
              <div className="h-3 w-4/6 bg-white/10 rounded" />
            </div>
          </div>
          
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
            <h3 className="text-lg font-semibold text-white">Progress</h3>
            <div className="flex items-end gap-2 h-24">
              {[40, 65, 50, 80, 60].map((h, i) => (
                <div key={i} className="flex-1 bg-white/10 rounded-t-sm hover:bg-[var(--gold)]/50 transition-colors" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
