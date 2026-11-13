import React, { useState } from 'react';
import { X, Smartphone, QrCode, ArrowRight, Check, Apple } from 'lucide-react';
import { GrindrLogo } from './GrindrLogo';

interface GetAppModalProps {
  onClose: () => void;
  onOpenWeb: () => void;
}

export const GetAppModal: React.FC<GetAppModalProps> = ({ onClose, onOpenWeb }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setPhoneNumber('');
    }, 4000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#161618] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-[#ffce00] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ffce00]/20 mb-4">
            <GrindrLogo iconOnly size={36} color="#000" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Get Grindr on Mobile
          </h2>
          <p className="text-neutral-400 text-sm mt-1.5 max-w-xs">
            Connect with millions of guys around you anywhere, anytime.
          </p>

          {/* QR Code display */}
          <div className="my-6 p-4 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center">
            {/* SVG Simulated QR code */}
            <div className="w-36 h-36 bg-black relative p-2 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                <rect x="0" y="0" width="30" height="30" rx="4" />
                <rect x="5" y="5" width="20" height="20" rx="2" fill="black" />
                <rect x="10" y="10" width="10" height="10" rx="1" fill="white" />

                <rect x="70" y="0" width="30" height="30" rx="4" />
                <rect x="75" y="5" width="20" height="20" rx="2" fill="black" />
                <rect x="80" y="10" width="10" height="10" rx="1" fill="white" />

                <rect x="0" y="70" width="30" height="30" rx="4" />
                <rect x="5" y="75" width="20" height="20" rx="2" fill="black" />
                <rect x="10" y="80" width="10" height="10" rx="1" fill="white" />

                <rect x="36" y="10" width="10" height="20" />
                <rect x="42" y="36" width="16" height="16" />
                <rect x="10" y="42" width="20" height="10" />
                <rect x="70" y="42" width="20" height="15" />
                <rect x="40" y="70" width="20" height="12" />
                <rect x="70" y="70" width="12" height="20" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-9 h-9 bg-[#ffce00] rounded-lg flex items-center justify-center border-2 border-black shadow">
                  <GrindrLogo iconOnly size={20} color="#000" />
                </div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-neutral-800 mt-2">
              Scan with your phone's camera
            </span>
          </div>

          {/* App Store Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-white/8 hover:bg-white/12 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-xs transition-colors"
            >
              <Apple className="w-5 h-5 fill-current" />
              <div className="text-left">
                <span className="block text-[9px] uppercase tracking-wider text-neutral-400">Download on</span>
                <span>App Store</span>
              </div>
            </a>

            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-white/8 hover:bg-white/12 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-xs transition-colors"
            >
              <Smartphone className="w-5 h-5" />
              <div className="text-left">
                <span className="block text-[9px] uppercase tracking-wider text-neutral-400">Get it on</span>
                <span>Google Play</span>
              </div>
            </a>
          </div>

          {/* Or text link */}
          <form onSubmit={handleSubmit} className="w-full mt-4">
            <div className="flex gap-2">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter mobile phone number"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffce00]"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
              >
                Text Me Link
              </button>
            </div>
            {isSent && (
              <p className="text-emerald-400 text-xs mt-2 flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" /> Download link sent via SMS!
              </p>
            )}
          </form>

          {/* Web fallback prompt */}
          <div className="mt-6 pt-4 border-t border-white/10 w-full flex items-center justify-between text-xs text-neutral-400">
            <span>Prefer using your desktop browser?</span>
            <button
              onClick={() => {
                onClose();
                onOpenWeb();
              }}
              className="text-[#ffce00] hover:underline font-bold flex items-center gap-1"
            >
              Launch Web <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
