import React, { useState } from 'react';
import { 
  ArrowUpRight, Menu, X, Smartphone, Globe, MessageSquare, 
  ShieldCheck, Heart, Sparkles, Lock
} from 'lucide-react';
import { GrindrLogo } from './GrindrLogo';
import { Profile } from '../types';
import { InfoModalType } from './InfoModal';
import { ProfileCarousel } from './ProfileCarousel';

interface LandingPageProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
  onOpenWebClient: () => void;
  onOpenPrivateChat?: (profile?: Profile) => void;
  onOpenGetApp: () => void;
  onOpenUnlimited: () => void;
  onOpenInfo: (type: InfoModalType) => void;
  onOpenBackendAccess?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  profiles,
  onSelectProfile,
  onOpenWebClient,
  onOpenPrivateChat,
  onOpenGetApp,
  onOpenUnlimited,
  onOpenInfo,
  onOpenBackendAccess,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white flex flex-col lg:flex-row relative selection:bg-[#ffce00] selection:text-black">
      {/* ============================================================ */}
      {/* MOBILE TOP BAR (visible on < lg) */}
      {/* ============================================================ */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#ffce00] text-black px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <GrindrLogo height={26} color="#000000" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWebClient}
            className="px-3.5 py-1.5 bg-black text-white text-xs font-black rounded-full hover:bg-neutral-800 transition-transform active:scale-95"
          >
            Sign up / Log in with Web
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-black hover:bg-black/10 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MOBILE DRAWER OVERLAY */}
      {/* ============================================================ */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-4/5 max-w-sm h-full bg-[#ffce00] text-black p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-black/15">
                <GrindrLogo height={30} color="#000000" />
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-black hover:bg-black/10 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Items on Mobile */}
              <nav className="py-6 space-y-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWebClient();
                  }}
                  className="flex items-center gap-2.5 w-full text-left font-black text-base uppercase tracking-wider text-black"
                >
                  <span className="w-2.5 h-2.5 bg-black" />
                  <span>LOG IN WITH WEB</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenInfo('about');
                  }}
                  className="block w-full text-left font-black text-base uppercase tracking-wider text-black pl-5 hover:opacity-75"
                >
                  ABOUT
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenInfo('help');
                  }}
                  className="flex items-center justify-between w-full font-black text-base uppercase tracking-wider text-black pl-5 hover:opacity-75"
                >
                  <span>HELP</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenInfo('advertise');
                  }}
                  className="block w-full text-left font-black text-base uppercase tracking-wider text-black pl-5 hover:opacity-75"
                >
                  ADVERTISE
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenInfo('careers');
                  }}
                  className="block w-full text-left font-black text-base uppercase tracking-wider text-black pl-5 hover:opacity-75"
                >
                  CAREERS
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenInfo('equality');
                  }}
                  className="block w-full text-left font-black text-base uppercase tracking-wider text-black pl-5 hover:opacity-75"
                >
                  GRINDR FOR EQUALITY
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenInfo('blog');
                  }}
                  className="block w-full text-left font-black text-base uppercase tracking-wider text-black pl-5 hover:opacity-75"
                >
                  BLOG
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenUnlimited();
                  }}
                  className="block w-full text-left font-black text-base uppercase tracking-wider text-black pl-5 hover:opacity-75"
                >
                  UNLIMITED
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenGetApp();
                  }}
                  className="flex items-center justify-between w-full font-black text-base uppercase tracking-wider text-black pl-5 hover:opacity-75"
                >
                  <span>SHOP</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenInfo('about');
                  }}
                  className="flex items-center justify-between w-full font-black text-base uppercase tracking-wider text-black pl-5 hover:opacity-75"
                >
                  <span>INVESTORS</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-black/15 text-xs text-black/80 space-y-3">
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-black/70">
                <button onClick={() => onOpenInfo('help')}>Terms of Service</button>
                <button onClick={() => onOpenInfo('help')}>Privacy Policy</button>
                <button onClick={() => onOpenInfo('help')}>Guidelines</button>
                <button onClick={() => onOpenInfo('help')}>Contact</button>
              </div>
              <p className="text-[11px] font-bold text-black/90">©2026 Grindr LLC</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR (As seen in the screenshot) */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex w-72 xl:w-80 shrink-0 bg-[#ffce00] text-black flex-col justify-between p-8 min-h-screen sticky top-0 h-screen overflow-y-auto select-none border-r border-black/10">
        <div>
          {/* Logo */}
          <div className="mb-10">
            <GrindrLogo height={36} color="#000000" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4">
            <button
              onClick={onOpenWebClient}
              className="flex items-center gap-3 w-full text-left font-black text-sm uppercase tracking-wider text-black hover:opacity-85 transition-opacity"
            >
              <span className="w-2.5 h-2.5 bg-black shrink-0" />
              <span>SIGN UP / LOG IN WITH WEB</span>
            </button>

            <button
              onClick={() => onOpenPrivateChat ? onOpenPrivateChat() : onOpenWebClient()}
              className="flex items-center justify-between w-full font-black text-sm uppercase tracking-wider text-black pl-5.5 pr-2 hover:opacity-75 transition-opacity"
            >
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-black shrink-0" />
                <span>PRIVATE CHAT</span>
              </div>
              <span className="text-[10px] bg-black text-[#ffce00] px-1.5 py-0.5 rounded-full font-black">ACTIVE</span>
            </button>

            <button
              onClick={() => onOpenInfo('about')}
              className="block w-full text-left font-black text-sm uppercase tracking-wider text-black pl-5.5 hover:opacity-75 transition-opacity"
            >
              ABOUT
            </button>

            <button
              onClick={() => onOpenInfo('help')}
              className="flex items-center justify-between w-full font-black text-sm uppercase tracking-wider text-black pl-5.5 pr-2 hover:opacity-75 transition-opacity"
            >
              <span>HELP</span>
              <ArrowUpRight className="w-4 h-4 text-black shrink-0" />
            </button>

            <button
              onClick={() => onOpenInfo('advertise')}
              className="block w-full text-left font-black text-sm uppercase tracking-wider text-black pl-5.5 hover:opacity-75 transition-opacity"
            >
              ADVERTISE
            </button>

            <button
              onClick={() => onOpenInfo('careers')}
              className="block w-full text-left font-black text-sm uppercase tracking-wider text-black pl-5.5 hover:opacity-75 transition-opacity"
            >
              CAREERS
            </button>

            <button
              onClick={() => onOpenInfo('equality')}
              className="block w-full text-left font-black text-sm uppercase tracking-wider text-black pl-5.5 hover:opacity-75 transition-opacity"
            >
              GRINDR FOR EQUALITY
            </button>

            <button
              onClick={() => onOpenInfo('blog')}
              className="block w-full text-left font-black text-sm uppercase tracking-wider text-black pl-5.5 hover:opacity-75 transition-opacity"
            >
              BLOG
            </button>

            <button
              onClick={onOpenUnlimited}
              className="block w-full text-left font-black text-sm uppercase tracking-wider text-black pl-5.5 hover:opacity-75 transition-opacity"
            >
              UNLIMITED
            </button>

            <button
              onClick={onOpenGetApp}
              className="flex items-center justify-between w-full font-black text-sm uppercase tracking-wider text-black pl-5.5 pr-2 hover:opacity-75 transition-opacity"
            >
              <span>SHOP</span>
              <ArrowUpRight className="w-4 h-4 text-black shrink-0" />
            </button>

            <button
              onClick={() => onOpenInfo('about')}
              className="flex items-center justify-between w-full font-black text-sm uppercase tracking-wider text-black pl-5.5 pr-2 hover:opacity-75 transition-opacity"
            >
              <span>INVESTORS</span>
              <ArrowUpRight className="w-4 h-4 text-black shrink-0" />
            </button>
          </nav>
        </div>

        {/* Legal & Social in Sidebar */}
        <div className="pt-8 text-[11px] text-black/80 space-y-4">
          <div className="flex flex-col gap-1.5 font-normal text-black/75">
            <button onClick={() => onOpenInfo('help')} className="text-left hover:underline">Terms of Service</button>
            <button onClick={() => onOpenInfo('help')} className="text-left hover:underline">Privacy Policy</button>
            <button onClick={() => onOpenInfo('help')} className="text-left hover:underline">Consumer Health Data Privacy Policy</button>
            <button onClick={() => onOpenInfo('help')} className="text-left hover:underline">Patents</button>
            <button onClick={() => onOpenInfo('help')} className="text-left hover:underline">Your Privacy Choices</button>
            <button onClick={() => onOpenInfo('help')} className="text-left hover:underline">Do Not Sell or Share My Personal Information</button>
            <button onClick={() => onOpenInfo('help')} className="text-left hover:underline">Community Guidelines</button>
            <button onClick={() => onOpenInfo('help')} className="text-left hover:underline">Israel Settlement Agreement</button>
            <button onClick={() => onOpenInfo('help')} className="text-left hover:underline">Contact</button>
          </div>

          <div>
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-black block mb-2">FOLLOW US</span>
            <div className="flex items-center gap-3 text-black">
              {/* Facebook */}
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:opacity-60" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              {/* Twitter / X */}
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:opacity-60" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:opacity-60" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:opacity-60" aria-label="YouTube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              {/* TikTok */}
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:opacity-60" aria-label="TikTok">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31 0 2.59.39 3.67 1.12.92.62 1.63 1.49 2.05 2.51.57.06 1.13.19 1.67.38v3.47c-.55-.17-1.12-.27-1.7-.29v6.52c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8c.34 0 .68.02 1.01.07V9.32c-.33-.08-.67-.12-1.01-.12-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5V0h-2.2z"/></svg>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:opacity-60" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          <p className="text-[11px] font-bold text-black/90 pt-1">©2026 Grindr LLC</p>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN RIGHT SECTION (Radar & Profile Canvas) */}
      {/* ============================================================ */}
      <main className="flex-1 bg-world-dots min-h-screen flex flex-col justify-between overflow-x-hidden pt-8 lg:pt-12">
        {/* Hero Content with requested headline, copy, and carousel */}
        <div className="px-4 sm:px-8 lg:px-10 py-4 max-w-7xl mx-auto w-full">
          {/* Eye-catching Hero Information Card */}
          <div className="relative mb-4 p-5 sm:p-7 md:p-8 rounded-3xl bg-gradient-to-br from-neutral-900/90 via-[#141417]/80 to-black/60 border border-white/15 backdrop-blur-xl shadow-2xl overflow-hidden max-w-4xl">
            {/* Ambient golden glow flare */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#ffce00]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-60 h-60 bg-[#00e676]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Top Live Badge - No location */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-black tracking-wider uppercase mb-2.5 shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse shadow-sm shadow-[#00e676]" />
                <span className="text-[#ffce00]">Live Radar Active Nearby</span>
              </div>

              {/* Reduced Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight text-white leading-tight mb-2.5">
                Discover <span className="text-[#ffce00] drop-shadow-[0_4px_20px_rgba(255,206,0,0.35)]">Connections</span> Near You
              </h1>

              {/* Reduced Description */}
              <p className="text-sm sm:text-base text-neutral-200 font-medium leading-relaxed max-w-2xl mb-5 drop-shadow-sm">
                Explore profiles of experienced gay and transgender escorts nearby for{' '}
                <span className="text-white font-bold underline decoration-[#ffce00] decoration-2 underline-offset-4">
                  real life time pleasure and memorable moments
                </span>
                .
              </p>

              {/* Action Button & Trust Markers */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  onClick={onOpenWebClient}
                  className="px-9 py-3.5 bg-white hover:bg-neutral-100 text-black font-black text-sm sm:text-base rounded-full shadow-2xl shadow-[#ffce00]/30 hover:shadow-[#ffce00]/50 transition-all duration-200 hover:scale-104 active:scale-95 flex items-center justify-center gap-2 group w-fit cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-black fill-black group-hover:rotate-12 transition-transform" />
                  <span>Log in with Web</span>
                </button>

                {/* Trust markers */}
                <div className="flex items-center gap-3 text-xs text-neutral-400 font-semibold flex-wrap">
                  <span className="flex items-center gap-1 text-neutral-300">
                    <span className="text-[#00e676]">✓</span> 100% Discreet
                  </span>
                  <span className="text-neutral-600">·</span>
                  <span className="flex items-center gap-1 text-neutral-300">
                    <span className="text-[#00e676]">✓</span> Real-Time Radar
                  </span>
                  <span className="text-neutral-600">·</span>
                  <span className="flex items-center gap-1 text-neutral-300">
                    <span className="text-[#00e676]">✓</span> Verified Profiles
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Carousel directly follows */}
          <ProfileCarousel
            profiles={profiles}
            onSelectProfile={onSelectProfile}
          />
        </div>

        {/* Feature Highlights Section */}
        <section className="px-6 lg:px-12 py-12 border-t border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-black tracking-widest uppercase text-[#ffce00]">
                BUILT FOR CONNECTION
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
                Everything you need to meet, connect & belong
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white/3 border border-white/10 rounded-3xl hover:border-white/20 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#ffce00] text-black flex items-center justify-center font-black mb-4">
                  <Globe className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Distance-Based Radar</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Discover guys within meters of you. Browse with customizable distance filters, tribes, and real-time online status.
                </p>
              </div>

              <div 
                onClick={() => onOpenPrivateChat ? onOpenPrivateChat() : onOpenWebClient()}
                className="p-6 bg-white/3 border border-white/10 rounded-3xl hover:border-[#ffce00]/60 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#ffce00] text-black flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-6 h-6 text-black" />
                  </div>
                  <span className="px-2.5 py-1 bg-[#ffce00]/20 text-[#ffce00] border border-[#ffce00]/40 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Live Demo
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#ffce00] transition-colors flex items-center gap-2">
                  <span>Secure Private Chat</span>
                  <span className="text-xs font-bold text-[#ffce00] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                  Send expiring view-once photos, quick taps (🔥 Flame, 😈 Looking), video clips, voice notes, and share pins with end-to-end peace of mind.
                </p>
                <div className="flex items-center gap-2 text-xs font-black text-[#ffce00]">
                  <span>Launch Private Chat Suite</span>
                  <span>→</span>
                </div>
              </div>

              <div className="p-6 bg-white/3 border border-white/10 rounded-3xl hover:border-white/20 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#ffce00] text-black flex items-center justify-center font-black mb-4">
                  <Heart className="w-6 h-6 text-black fill-black" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Grindr for Equality</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  We leverage technology to champion LGBTQ+ rights, distribute free HIV tests, and mobilize community relief around the world.
                </p>
              </div>
            </div>

            {/* Bottom Callout Banner */}
            <div className="mt-12 p-8 bg-gradient-to-r from-[#ffce00]/20 via-black to-black border border-[#ffce00]/30 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Join millions of guys worldwide.
                </h3>
                <p className="text-neutral-300 text-sm mt-1">
                  Launch Grindr Web directly in your browser.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={onOpenWebClient}
                  className="px-8 py-3.5 bg-[#ffce00] hover:bg-[#ebd200] text-black font-black text-sm rounded-xl transition-all shadow-lg shadow-[#ffce00]/20 active:scale-95"
                >
                  Open Grindr Web
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Quiet Footer */}
        <footer className="px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>© 2026 Grindr LLC. Grindr is a registered trademark of Grindr LLC.</p>
          {onOpenBackendAccess && (
            <button
              onClick={onOpenBackendAccess}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5"
              title="Secure login gate for agency operators to respond in absence of providers"
            >
              <span>🔒 Admin Dispatch Desk (Secured)</span>
            </button>
          )}
        </footer>
      </main>
    </div>
  );
};
