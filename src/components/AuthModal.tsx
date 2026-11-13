import React, { useState } from 'react';
import { 
  X, MapPin, ShieldCheck, Eye, EyeOff, ArrowRight, 
  Check, Lock, AlertCircle, Compass, Sparkles 
} from 'lucide-react';
import { GrindrLogo } from './GrindrLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userEmail: string, locationCoords?: { lat: number; lng: number }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<'location' | 'login'>('location');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Request browser geolocation
  const handleRequestLocation = () => {
    setIsLocating(true);
    setLocationStatus('Requesting browser location...');
    setErrorMessage(null);

    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      setIsLocating(false);
      setTimeout(() => setStep('login'), 1200);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setLocationCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('Location confirmed! Loading nearby radar...');
        setTimeout(() => {
          setStep('login');
        }, 1000);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('Continuing in standard radar mode.');
        } else {
          setLocationStatus('Continuing in standard radar mode.');
        }
        setTimeout(() => {
          setStep('login');
        }, 1200);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSkipLocation = () => {
    setLocationStatus('Continuing in standard radar mode.');
    setStep('login');
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setErrorMessage('Please enter a valid password.');
      return;
    }

    setErrorMessage(null);
    onLoginSuccess(emailOrPhone, locationCoords);
  };

  const handleDemoLogin = () => {
    onLoginSuccess('alex.demo@web.app', locationCoords);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#141416] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#ffce00]/15 rounded-full blur-3xl pointer-events-none" />

        {/* ============================================================ */}
        {/* STEP 1: REQUEST LOCATION ACCESS */}
        {/* ============================================================ */}
        {step === 'location' ? (
          <div className="flex flex-col items-center text-center">
            {/* Animated Pin Icon */}
            <div className="relative my-4">
              <div className="w-20 h-20 rounded-3xl bg-[#ffce00]/15 border border-[#ffce00]/30 flex items-center justify-center text-[#ffce00] shadow-lg shadow-[#ffce00]/20">
                <MapPin className="w-10 h-10 animate-bounce" />
              </div>
              <div className="absolute inset-0 rounded-3xl border-2 border-[#ffce00]/30 animate-ping pointer-events-none" />
            </div>

            <span className="text-[11px] font-black tracking-widest uppercase text-[#ffce00] mb-1">
              STEP 1 OF 2 · RADAR SETUP
            </span>

            <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
              Allow Location Access
            </h2>

            <p className="text-neutral-300 text-sm mt-2 max-w-sm leading-relaxed">
              We need your location to show profiles, active connections, and accurate radar distance near you.
            </p>

            {locationStatus && (
              <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-neutral-200 flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#ffce00] shrink-0" />
                <span>{locationStatus}</span>
              </div>
            )}

            <div className="w-full space-y-3 mt-6">
              <button
                onClick={handleRequestLocation}
                disabled={isLocating}
                className="w-full py-3.5 bg-[#ffce00] hover:bg-[#ebd200] text-black font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#ffce00]/25 transition-transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <MapPin className="w-4 h-4 fill-black" />
                <span>{isLocating ? 'Detecting Location...' : 'Allow Location & Continue'}</span>
              </button>

              <button
                onClick={handleSkipLocation}
                className="w-full py-2.5 text-xs text-neutral-400 hover:text-white font-bold transition-colors cursor-pointer"
              >
                Skip & Use Default Location
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-4 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Private & Encrypted
              </span>
              <span>·</span>
              <span>Approximate Precision</span>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* STEP 2: APPLICATION SIGN IN FORM */
          /* ============================================================ */
          <div>
            {/* Header Lockup */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-[#ffce00] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ffce00]/20 mb-3">
                <GrindrLogo iconOnly size={28} color="#000" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Log in to Web
              </h2>
              <p className="text-neutral-400 text-xs mt-1">
                Enter your credentials to access your local gayborhood.
              </p>
            </div>

            {/* Email / Phone Toggle */}
            <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl mb-4 border border-white/5 text-xs">
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`py-2 rounded-xl font-bold transition-all ${
                  authMethod === 'email'
                    ? 'bg-[#ffce00] text-black shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`py-2 rounded-xl font-bold transition-all ${
                  authMethod === 'phone'
                    ? 'bg-[#ffce00] text-black shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Phone Number
              </button>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-300 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmitLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1.5">
                  {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input
                  type={authMethod === 'email' ? 'email' : 'tel'}
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder={authMethod === 'email' ? 'name@example.com' : '+1 (555) 000-0000'}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffce00] transition-colors"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-neutral-300 font-bold">Password</label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to registered contact.')}
                    className="text-[11px] text-[#ffce00] hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffce00] transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 bg-[#ffce00] hover:bg-[#ebd200] text-black font-black text-sm rounded-2xl shadow-xl shadow-[#ffce00]/25 transition-transform active:scale-98 cursor-pointer"
              >
                Sign In
              </button>
            </form>

            {/* Quick Demo Access */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ffce00]" />
                <span>Explore as Demo Account (Alex)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
