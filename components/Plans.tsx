'use client';

import React, { useState } from 'react';
import { Check, Zap } from 'lucide-react';

const Plans = () => {
  const [planType, setPlanType] = useState<'3' | '6'>('3');

  const handleWhatsApp = (plan: '3' | '6') => {
    const message = plan === '3'
      ? "Hi, I'm interested in the 3-month coaching plan."
      : "Hi, I'm interested in the 6-month coaching plan.";
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    if (number) {
      window.open(`https://wa.me/${number.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-muted mb-1">Choose a coaching commitment.</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text">Pricing & Commitments</h2>
        </div>

        {/* Mobile Toggle */}
        <div className="flex justify-center mb-12 lg:hidden">
          <div className="relative inline-flex bg-black/40 border border-white/10 rounded-full p-1 backdrop-blur-md">
            {/* Sliding Indicator */}
            <div
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-white/10 border border-accent/30 shadow-[0_0_15px_-3px_var(--accentSoft)] transition-transform duration-[250ms] ease-in-out ${
                planType === '6' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />

            <button
              onClick={() => setPlanType('3')}
              className={`relative z-10 w-32 py-3 rounded-full text-sm font-medium transition-colors duration-[250ms] ${
                planType === '3' ? 'text-white' : 'text-muted hover:text-text'
              }`}
            >
              3 Months
            </button>
            <button
              onClick={() => setPlanType('6')}
              className={`relative z-10 w-32 py-3 rounded-full text-sm font-medium transition-colors duration-[250ms] ${
                planType === '6' ? 'text-white' : 'text-muted hover:text-text'
              }`}
            >
              6 Months
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* 3-Month Card */}
          <div
            className={`flex flex-col relative p-8 md:p-10 rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent backdrop-blur-xl transition-all duration-500
              shadow-[0_0_60px_-10px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]
              hover:shadow-[0_0_80px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-white/20 hover:bg-gradient-to-br hover:from-white/[0.1] hover:via-white/[0.05] group
              ${planType === '3' ? 'block' : 'hidden lg:flex'}
            `}
          >
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-text">3-Month Coaching</h3>
              <p className="text-white/60 text-sm md:text-base">Built for structure and momentum.</p>
            </div>

            <div className="mb-8">
              <button
                onClick={() => handleWhatsApp('3')}
                className="w-full py-4 rounded-xl bg-white/[0.08] border border-white/15 text-white font-semibold transition-all duration-300 hover:bg-white/[0.15] hover:border-white/30 hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.2)] group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  Request a Quote
                  <Zap className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </span>
              </button>
            </div>

            <div className="flex-grow">
              <ul className="space-y-4">
                {['Personalized training plan', 'Nutrition guidance', 'Weekly check-ins & adjustments', 'Progress tracking'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 group/item">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-accent/30 transition-colors">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-white/70 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 6-Month Card */}
          <div
            className={`flex flex-col relative p-8 md:p-10 rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent backdrop-blur-xl transition-all duration-500
              shadow-[0_0_60px_-10px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]
              hover:shadow-[0_0_80px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-white/20 hover:bg-gradient-to-br hover:from-white/[0.1] hover:via-white/[0.05] group
              ${planType === '6' ? 'block' : 'hidden lg:flex'}
            `}
          >
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-text">6-Month Coaching</h3>
              <p className="text-white/60 text-sm md:text-base">Built for long-term transformation.</p>
            </div>

            <div className="mb-8">
              <button
                onClick={() => handleWhatsApp('6')}
                className="w-full py-4 rounded-xl bg-white/[0.08] border border-white/15 text-white font-semibold transition-all duration-300 hover:bg-white/[0.15] hover:border-white/30 hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.2)] group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  Request a Quote
                  <Zap className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </span>
              </button>
            </div>

            <div className="flex-grow">
              <ul className="space-y-4">
                {['Long-term personalized training', 'Advanced nutrition strategy', 'Weekly check-ins with deeper feedback', 'Lifestyle & recovery support'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 group/item">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-accent/30 transition-colors">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-white/70 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Plans;