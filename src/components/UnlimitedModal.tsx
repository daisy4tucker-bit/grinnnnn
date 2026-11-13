import React, { useState } from 'react';
import { X, Check, Zap, EyeOff, Sparkles, Shield, Compass, RotateCcw } from 'lucide-react';
import { GrindrLogo } from './GrindrLogo';

interface UnlimitedModalProps {
  onClose: () => void;
}

export const UnlimitedModal: React.FC<UnlimitedModalProps> = ({ onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<'month' | 'annual'>('annual');
  const [activeTier, setActiveTier] = useState<'unlimited' | 'xtra'>('unlimited');
  const [isSubscribed, setIsSubscribed] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#141416] border border-[#ffce00]/30 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#ffce00]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#ffce00] text-black flex items-center justify-center font-black">
            <GrindrLogo iconOnly size={24} color="#000" />
          </div>
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-[#ffce00] block">Premium Access</span>
            <h2 className="text-2xl font-black text-white tracking-tight">Grindr Unlimited & XTRA</h2>
          </div>
        </div>

        <p className="text-neutral-400 text-sm mb-6">
          Browse without limits, wander anywhere on the globe, see who viewed your profile, and chat with complete privacy.
        </p>

        {/* Tier Selector Buttons */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl mb-6">
          <button
            onClick={() => setActiveTier('unlimited')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTier === 'unlimited'
                ? 'bg-[#ffce00] text-black shadow-lg shadow-[#ffce00]/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grindr UNLIMITED</span>
          </button>
          <button
            onClick={() => setActiveTier('xtra')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTier === 'xtra'
                ? 'bg-white text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Grindr XTRA</span>
          </button>
        </div>

        {/* Feature List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-white/3 border border-white/5 rounded-2xl flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#ffce00]/20 text-[#ffce00] flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Unlimited Profiles</h4>
              <p className="text-[11px] text-neutral-400">See all guys nearby without any 100-profile cap.</p>
            </div>
          </div>

          <div className="p-3 bg-white/3 border border-white/5 rounded-2xl flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#ffce00]/20 text-[#ffce00] flex items-center justify-center shrink-0 mt-0.5">
              <EyeOff className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Incognito Mode</h4>
              <p className="text-[11px] text-neutral-400">Browse completely invisible without appearing in the grid.</p>
            </div>
          </div>

          <div className="p-3 bg-white/3 border border-white/5 rounded-2xl flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#ffce00]/20 text-[#ffce00] flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Full Access</h4>
              <p className="text-[11px] text-neutral-400">Explore all profiles and connect across communities without limits.</p>
            </div>
          </div>

          <div className="p-3 bg-white/3 border border-white/5 rounded-2xl flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#ffce00]/20 text-[#ffce00] flex items-center justify-center shrink-0 mt-0.5">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Unsend Messages & Read Receipts</h4>
              <p className="text-[11px] text-neutral-400">Recall accidental messages and see when you are read.</p>
            </div>
          </div>
        </div>

        {/* Pricing selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            onClick={() => setSelectedPlan('annual')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'annual'
                ? 'border-[#ffce00] bg-[#ffce00]/10 ring-1 ring-[#ffce00]'
                : 'border-white/10 bg-white/3 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">12 Months</span>
              <span className="text-[10px] bg-[#ffce00] text-black font-extrabold px-1.5 py-0.5 rounded-md">SAVE 45%</span>
            </div>
            <div className="text-lg font-black text-white">$14.99 <span className="text-xs text-neutral-400 font-normal">/ mo</span></div>
            <div className="text-[11px] text-neutral-400">Billed annually</div>
          </div>

          <div
            onClick={() => setSelectedPlan('month')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'month'
                ? 'border-[#ffce00] bg-[#ffce00]/10 ring-1 ring-[#ffce00]'
                : 'border-white/10 bg-white/3 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">1 Month</span>
            </div>
            <div className="text-lg font-black text-white">$27.99 <span className="text-xs text-neutral-400 font-normal">/ mo</span></div>
            <div className="text-[11px] text-neutral-400">Billed monthly</div>
          </div>
        </div>

        {/* CTA */}
        {isSubscribed ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center text-emerald-400 font-bold text-sm">
            ✓ Unlimited membership activated! Enjoy complete access.
          </div>
        ) : (
          <button
            onClick={() => setIsSubscribed(true)}
            className="w-full py-3.5 bg-[#ffce00] hover:bg-[#ebd200] text-black font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#ffce00]/25 transition-transform active:scale-98"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Unlock {activeTier === 'unlimited' ? 'Grindr UNLIMITED' : 'Grindr XTRA'}</span>
          </button>
        )}

        <p className="text-[10px] text-neutral-500 text-center mt-3">
          Recurring billing. Cancel anytime in account settings.
        </p>
      </div>
    </div>
  );
};
