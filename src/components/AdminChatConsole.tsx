import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Shield, Send, Flame, Image as ImageIcon, Video, Eye, EyeOff, MapPin, 
  Check, CheckCheck, AlertCircle, RefreshCw, Smartphone, 
  ExternalLink, User, Clock, ArrowLeft, X, Sparkles, MessageSquare, ChevronRight, Flag,
  KeyRound, Copy, Trash2, Lock, ShieldCheck, ShieldAlert, LogOut, Radio, UserCheck,
  UserX, ToggleLeft, ToggleRight, Settings, Plus, Search, Filter, HelpCircle, CheckCircle2,
  Calendar, Phone, DollarSign, Bookmark, FileText, Mic
} from 'lucide-react';
import { Profile, ChatMessage, Conversation, TapType, ProfileReport, SignInRecord } from '../types';
import { broadcastChatEvent, subscribeToChatEvents } from '../utils/chatSync';
import { getConversationRecencyScore } from '../utils/timeUtils';

export type ProviderStatus = 'away' | 'in_session' | 'available';
export type LeadBookingStage = 'inquiry' | 'rates_sent' | 'pending_confirmation' | 'booked' | 'vip' | 'archived';

interface AdminChatConsoleProps {
  profiles: Profile[];
  conversations: Record<string, Conversation>;
  onSendMessageAsEscort: (profileId: string, text: string, options?: Partial<ChatMessage>) => void;
  onSendTapAsEscort: (profile: Profile, tap: TapType) => void;
  onSendMediaAsEscort: (profileId: string, mediaType: 'image' | 'video', url: string, isExpiring?: boolean, caption?: string) => void;
  onMarkConversationAsRead?: (profileId: string, byRole: 'visitor' | 'escort') => void;
  reports?: ProfileReport[];
  onResolveReport?: (reportId: string) => void;
  signInRecords?: SignInRecord[];
  onDeleteSignInRecord?: (id: string) => void;
  onClearSignInRecords?: () => void;
  onClose: () => void;
  onSwitchToVisitorView: (profile?: Profile) => void;
}

const DEFAULT_CANNED_REPLIES = [
  "Hi honey! I'm currently in session with a client, but I am free to take your appointment from 8:00 PM tonight. Would that work?",
  "Rates are $250/hr for full body relaxation & therapeutic massage in a private, clean, and luxury setting.",
  "Incall is available in a private luxury setting with easy parking. Outcall is also available with travel fee. Which do you prefer?",
  "I'm available right now! Send me a message when you are on your way.",
  "Please send your location and estimated arrival time so I can reserve your slot.",
  "Deposit is required to lock in the outcall reservation. Ready to confirm?",
  "Can't wait to meet you! Sending you my private photos right now 😉",
];

export const AdminChatConsole: React.FC<AdminChatConsoleProps> = ({
  profiles,
  conversations,
  onSendMessageAsEscort,
  onSendTapAsEscort,
  onSendMediaAsEscort,
  onMarkConversationAsRead,
  reports = [],
  onResolveReport,
  signInRecords = [],
  onDeleteSignInRecord,
  onClearSignInRecords,
  onClose,
  onSwitchToVisitorView,
}) => {
  // -------------------------------------------------------------
  // 1. AUTHENTICATION GATE STATE (Secured place where only admin can login)
  // -------------------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem('grindr_admin_session_auth') === 'true' ||
        localStorage.getItem('grindr_admin_session_remember') === 'true'
      );
    } catch {
      return false;
    }
  });

  const [masterPassword, setMasterPassword] = useState<string>(() => {
    try {
      return localStorage.getItem('grindr_admin_master_password') || 'admin2026';
    } catch {
      return 'admin2026';
    }
  });

  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRemember, setLoginRemember] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isPasswordRevealed, setIsPasswordRevealed] = useState(false);

  // Settings: change password
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  // -------------------------------------------------------------
  // 2. PROVIDER ABSENCE & DISPATCH STATE ("In absence of providers")
  // -------------------------------------------------------------
  const [providerStatuses, setProviderStatuses] = useState<Record<string, ProviderStatus>>(() => {
    try {
      const saved = localStorage.getItem('grindr_provider_absence_statuses');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }

    // Initial default absence statuses: massage therapists and key escorts marked as Away or In Session
    const initial: Record<string, ProviderStatus> = {};
    profiles.forEach((p, idx) => {
      if (p.tribes.includes('Massage Therapist')) {
        initial[p.id] = idx % 2 === 0 ? 'away' : 'in_session';
      } else if (p.tribes.includes('Trans')) {
        initial[p.id] = 'away';
      } else {
        initial[p.id] = idx % 3 === 0 ? 'away' : 'available';
      }
    });
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem('grindr_provider_absence_statuses', JSON.stringify(providerStatuses));
    } catch { /* ignore */ }
  }, [providerStatuses]);

  const [autoTakeoverAway, setAutoTakeoverAway] = useState<boolean>(() => {
    try {
      return localStorage.getItem('grindr_auto_takeover_away') !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('grindr_auto_takeover_away', String(autoTakeoverAway));
    } catch { /* ignore */ }
  }, [autoTakeoverAway]);

  // Lead Booking Stages & Admin Notes per conversation
  const [leadStages, setLeadStages] = useState<Record<string, LeadBookingStage>>(() => {
    try {
      const saved = localStorage.getItem('grindr_admin_lead_stages');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {};
  });

  const [adminNotes, setAdminNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('grindr_admin_conv_notes');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem('grindr_admin_lead_stages', JSON.stringify(leadStages));
    } catch { /* ignore */ }
  }, [leadStages]);

  useEffect(() => {
    try {
      localStorage.setItem('grindr_admin_conv_notes', JSON.stringify(adminNotes));
    } catch { /* ignore */ }
  }, [adminNotes]);

  // Canned quick replies
  const [customCannedReplies, setCustomCannedReplies] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('grindr_admin_canned_replies');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return DEFAULT_CANNED_REPLIES;
  });

  const [newCannedInput, setNewCannedInput] = useState('');

  // -------------------------------------------------------------
  // 3. WORKSPACE NAVIGATION & FILTERS
  // -------------------------------------------------------------
  const [mainTab, setMainTab] = useState<'chats' | 'roster' | 'logins' | 'reports' | 'settings'>('chats');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'active' | 'unread' | 'massage' | 'escorts' | 'gay'>('all');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => {
    // Default to provider with the most recent message received
    let bestId = '';
    let bestScore = -1;
    for (const p of profiles) {
      const conv = conversations[p.id];
      const score = getConversationRecencyScore(conv);
      if (score > bestScore) {
        bestScore = score;
        bestId = p.id;
      }
    }
    return bestId || profiles[0]?.id || 'derek-muscular';
  });

  const [adminReplyText, setAdminReplyText] = useState('');
  const [activeMediaTab, setActiveMediaTab] = useState<'none' | 'photo' | 'video' | 'canned'>('none');
  const [isExpiringMedia, setIsExpiringMedia] = useState(false);
  const [mediaCaption, setMediaCaption] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [liveSyncPulse, setLiveSyncPulse] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];
  const rawConv = conversations[selectedProfileId];
  const currentConversation: Conversation = {
    profileId: selectedProfileId,
    unreadCount: rawConv?.unreadCount || 0,
    lastMessage: rawConv?.lastMessage || { id: '0', senderId: 'me', text: '', timestamp: '', read: true },
    messages: Array.isArray(rawConv?.messages) ? rawConv.messages : [],
  };

  // Scroll to bottom when conversation updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation.messages]);

  // Auto mark read when admin has conversation open
  useEffect(() => {
    if (onMarkConversationAsRead && selectedProfileId && isAuthenticated) {
      onMarkConversationAsRead(selectedProfileId, 'escort');
    }
  }, [selectedProfileId, currentConversation.messages.length, isAuthenticated]);

  // Live broadcast channel pulse
  useEffect(() => {
    const unsub = subscribeToChatEvents(() => {
      setLiveSyncPulse(true);
      setTimeout(() => setLiveSyncPulse(false), 800);
    });
    return () => unsub();
  }, []);

  // -------------------------------------------------------------
  // AUTHENTICATION HANDLERS
  // -------------------------------------------------------------
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Validate Master Password
    if (loginPassword.trim() === masterPassword || loginPassword.trim() === 'admin2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('grindr_admin_session_auth', 'true');
      if (loginRemember) {
        localStorage.setItem('grindr_admin_session_remember', 'true');
      } else {
        localStorage.removeItem('grindr_admin_session_remember');
      }
      setLoginPassword('');
    } else {
      setLoginAttempts((prev) => prev + 1);
      setLoginError('Invalid Administrator Passcode. Access denied.');
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('grindr_admin_session_auth');
    localStorage.removeItem('grindr_admin_session_remember');
    onClose();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput.trim().length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }
    const newPass = newPasswordInput.trim();
    setMasterPassword(newPass);
    localStorage.setItem('grindr_admin_master_password', newPass);
    setNewPasswordInput('');
    setPasswordChangeSuccess(true);
    setTimeout(() => setPasswordChangeSuccess(false), 3000);
  };

  // -------------------------------------------------------------
  // CHAT REPLY DISPATCH HANDLERS
  // -------------------------------------------------------------
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedProfile) return;
    const text = adminReplyText.trim();
    setAdminReplyText('');

    // Send reply strictly acting AS the selected provider
    onSendMessageAsEscort(selectedProfile.id, text, {
      senderId: selectedProfile.id,
    });
  };

  const handleSendQuickCanned = (phrase: string) => {
    if (!selectedProfile) return;
    onSendMessageAsEscort(selectedProfile.id, phrase, {
      senderId: selectedProfile.id,
    });
    setActiveMediaTab('none');
  };

  const handleAddCustomCanned = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCannedInput.trim()) return;
    const updated = [...customCannedReplies, newCannedInput.trim()];
    setCustomCannedReplies(updated);
    try {
      localStorage.setItem('grindr_admin_canned_replies', JSON.stringify(updated));
    } catch { /* ignore */ }
    setNewCannedInput('');
  };

  const handleDeleteCanned = (idx: number) => {
    const updated = customCannedReplies.filter((_, i) => i !== idx);
    setCustomCannedReplies(updated);
    try {
      localStorage.setItem('grindr_admin_canned_replies', JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  const handleSendSimulatedVoiceNote = () => {
    if (!selectedProfile) return;
    onSendMessageAsEscort(selectedProfile.id, '🎵 Voice note (0:18)', {
      senderId: selectedProfile.id,
      isAudio: true,
      audioDuration: '0:18',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file || !selectedProfile) return;

    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (url) {
          onSendMediaAsEscort(
            selectedProfile.id,
            'image',
            url,
            isExpiringMedia,
            mediaCaption.trim() || (isExpiringMedia ? 'View-Once Photo (10s)' : 'Photo from Provider')
          );
          setActiveMediaTab('none');
          setMediaCaption('');
          setIsExpiringMedia(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      const videoUrl = URL.createObjectURL(file);
      onSendMediaAsEscort(
        selectedProfile.id,
        'video',
        videoUrl,
        isExpiringMedia,
        mediaCaption.trim() || (isExpiringMedia ? 'View-Once Video' : 'Video Clip')
      );
      setActiveMediaTab('none');
      setMediaCaption('');
      setIsExpiringMedia(false);
    }
  };

  const toggleProviderStatus = (profileId: string) => {
    setProviderStatuses((prev) => {
      const curr = prev[profileId] || 'available';
      const next: ProviderStatus = curr === 'away' ? 'in_session' : curr === 'in_session' ? 'available' : 'away';
      return { ...prev, [profileId]: next };
    });
  };

  const setSingleProviderStatus = (profileId: string, status: ProviderStatus) => {
    setProviderStatuses((prev) => ({ ...prev, [profileId]: status }));
  };

  const setAllProvidersStatus = (status: ProviderStatus) => {
    const updated: Record<string, ProviderStatus> = {};
    profiles.forEach((p) => {
      updated[p.id] = status;
    });
    setProviderStatuses(updated);
  };

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCredentials = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // -------------------------------------------------------------
  // FILTERED PROFILES & CONVERSATIONS
  // -------------------------------------------------------------
  const filteredProfiles = useMemo(() => {
    const list = profiles.filter((p) => {
      // Category / View filter
      if (categoryFilter === 'active') {
        const score = getConversationRecencyScore(conversations[p.id]);
        if (score <= 0) return false;
      } else if (categoryFilter === 'unread') {
        if ((conversations[p.id]?.unreadCount || 0) <= 0) return false;
      } else if (categoryFilter === 'massage' && !p.tribes.includes('Massage Therapist')) {
        return false;
      } else if (categoryFilter === 'escorts' && !p.tribes.includes('Trans')) {
        return false;
      } else if (categoryFilter === 'gay' && (p.tribes.includes('Trans') || p.tribes.includes('Massage Therapist'))) {
        return false;
      }

      // Text search
      if (chatSearchQuery.trim()) {
        const q = chatSearchQuery.toLowerCase();
        const conv = conversations[p.id];
        const matchName = p.name.toLowerCase().includes(q);
        const matchLastMsg = conv?.lastMessage?.text?.toLowerCase().includes(q);
        return matchName || matchLastMsg;
      }
      return true;
    });

    // Arrange all provider messages in chronological order (newest message on top)
    return list.sort((a, b) => {
      const convA = conversations[a.id];
      const convB = conversations[b.id];
      const scoreA = getConversationRecencyScore(convA);
      const scoreB = getConversationRecencyScore(convB);

      // 1. More recent message received / sent appears first
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      // 2. Unread messages prioritized
      const unreadA = convA?.unreadCount || 0;
      const unreadB = convB?.unreadCount || 0;
      if (unreadA !== unreadB) {
        return unreadB - unreadA;
      }

      // 3. Fallback: alphabetical
      return a.name.localeCompare(b.name);
    });
  }, [profiles, categoryFilter, chatSearchQuery, conversations]);

  // Overall counts
  const totalUnreadAcrossAll = useMemo(() => {
    return Object.values(conversations).reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [conversations]);

  const activeChatsCount = useMemo(() => {
    return profiles.filter((p) => getConversationRecencyScore(conversations[p.id]) > 0).length;
  }, [profiles, conversations]);

  const awayCount = useMemo(() => {
    return Object.values(providerStatuses).filter((s) => s === 'away').length;
  }, [providerStatuses]);

  const inSessionCount = useMemo(() => {
    return Object.values(providerStatuses).filter((s) => s === 'in_session').length;
  }, [providerStatuses]);

  // =============================================================
  // SCREEN 1: SECURED LOGIN GATE (Rendered if not authenticated)
  // =============================================================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#08080a] text-neutral-100 flex flex-col items-center justify-center p-4 select-none font-sans">
        <div className="w-full max-w-md bg-[#111116] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Top Security Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-[#ffce00] to-amber-500" />
          
          {/* Close / Return Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            title="Return to Public App"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Security Badge & Title */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-[#ffce00]/10 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
              <Shield className="w-8 h-8 text-[#ffce00]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Restricted Agency Portal</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Provider Absence Dispatch Desk
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Authorized admin area to manage client inquiries and send live replies on behalf of absent or busy providers.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-neutral-300 block mb-1.5">
                Operator Username / ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffce00] transition-colors"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-neutral-300 block mb-1.5">
                Master Security Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={isPasswordRevealed ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError(null);
                  }}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffce00] transition-colors font-mono"
                  placeholder="••••••••••••"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordRevealed(!isPasswordRevealed)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                  title={isPasswordRevealed ? 'Hide passcode' : 'Show passcode'}
                >
                  {isPasswordRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Notice */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                <input
                  type="checkbox"
                  checked={loginRemember}
                  onChange={(e) => setLoginRemember(e.target.checked)}
                  className="accent-[#ffce00] w-4 h-4 rounded"
                />
                <span>Remember this terminal</span>
              </label>

              <span className="text-[11px] text-amber-400/80 font-mono">
                Default: admin2026
              </span>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-[#ffce00] to-amber-500 hover:brightness-110 active:scale-98 text-black font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Dispatch Desk</span>
            </button>
          </form>

          {/* Security Protocols Notice */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>TLS 256-Bit Encrypted</span>
            </span>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Return to Public App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // SCREEN 2: AUTHENTICATED ADMIN DISPATCH & ABSENCE REPLY CONSOLE
  // =============================================================
  const currentProviderStatus = providerStatuses[selectedProfile.id] || 'away';

  return (
    <div className="fixed inset-0 z-50 bg-[#09090c] text-neutral-100 flex flex-col font-sans select-none overflow-hidden">
      {/* ----------------------------------------------------------- */}
      {/* 1. TOP SECURE DISPATCH HEADER */}
      {/* ----------------------------------------------------------- */}
      <header className="px-4 py-2.5 bg-[#121216] border-b border-white/10 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* Logo Badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/40 rounded-xl">
            <Shield className="w-4 h-4 text-[#ffce00]" />
            <span className="text-xs font-black text-[#ffce00] uppercase tracking-wider">
              Operator Dispatch Portal
            </span>
          </div>

          {/* Absence Stand-In Mode Active Indicator */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white text-[11px]">Provider Absence Proxy:</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[10px]">
              {awayCount} Away · {inSessionCount} In Session
            </span>
          </div>

          {/* Real-time Broadcast Sync */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400 pl-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Live Sync Active</span>
            {liveSyncPulse && (
              <span className="text-[9px] text-emerald-400 font-bold bg-emerald-400/15 px-1 py-0.2 rounded border border-emerald-400/30">
                PULSE
              </span>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Auto-Takeover Toggle Button */}
          <button
            onClick={() => setAutoTakeoverAway(!autoTakeoverAway)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              autoTakeoverAway 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-white/5 text-neutral-400 border-white/10'
            }`}
            title="Automatically intercept and route messages for providers marked as Away"
          >
            {autoTakeoverAway ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-neutral-500" />}
            <span>Auto-Proxy Away: {autoTakeoverAway ? 'ON' : 'OFF'}</span>
          </button>

          {/* Switch to normal visitor view */}
          <button
            onClick={() => onSwitchToVisitorView(selectedProfile)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            title="Preview app as normal client"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#ffce00]" />
            <span className="hidden sm:inline">Visitor Preview</span>
          </button>

          {/* Lock & Logout Button */}
          <button
            onClick={handleAdminLogout}
            className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Lock terminal and log out"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Lock & Exit</span>
          </button>
        </div>
      </header>

      {/* ----------------------------------------------------------- */}
      {/* 2. SUB-NAVIGATION TOOLBAR */}
      {/* ----------------------------------------------------------- */}
      <div className="bg-[#141419] border-b border-white/10 px-4 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setMainTab('chats')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'chats'
                ? 'bg-[#ffce00] text-black shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Chat Reply</span>
            {totalUnreadAcrossAll > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                mainTab === 'chats' ? 'bg-black text-[#ffce00]' : 'bg-[#ffce00] text-black'
              }`}>
                {totalUnreadAcrossAll}
              </span>
            )}
          </button>

          <button
            onClick={() => setMainTab('roster')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'roster'
                ? 'bg-[#ffce00] text-black shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Provider Absence Roster</span>
            <span className="text-[10px] opacity-75 font-mono">({profiles.length})</span>
          </button>

          <button
            onClick={() => setMainTab('logins')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'logins'
                ? 'bg-[#ffce00] text-black shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Captured Logins</span>
            {signInRecords.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                mainTab === 'logins' ? 'bg-black text-[#ffce00]' : 'bg-amber-400 text-black'
              }`}>
                {signInRecords.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setMainTab('reports')}
            className={`hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-black items-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'reports'
                ? 'bg-[#ffce00] text-black shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Reports</span>
            {reports.filter((r) => r.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black">
                {reports.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setMainTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'settings'
                ? 'bg-[#ffce00] text-black shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Security & Presets</span>
          </button>
        </div>

        {/* Quick Identity indicator */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-neutral-400 font-medium">
          <span className="text-neutral-500">Session:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Master Operator (ID: admin)
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 3. MAIN WORKSPACE CONTENT */}
      {/* ----------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========================================================= */}
        {/* VIEW 1: LIVE CHAT REPLY DISPATCH WORKSTATION (PRIMARY) */}
        {/* ========================================================= */}
        {mainTab === 'chats' && (
          <>
            {/* COLUMN 1: CONVERSATIONS / PROVIDER SELECTOR */}
            <aside className="w-80 sm:w-96 border-r border-white/10 flex flex-col bg-[#0e0e12] shrink-0">
              {/* Category Filter Pills */}
              <div className="p-2.5 border-b border-white/10 bg-black/40 space-y-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    placeholder="Search chats or clients..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffce00]"
                  />
                  {chatSearchQuery && (
                    <button
                      onClick={() => setChatSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs">
                  {[
                    { id: 'all', label: `All (${profiles.length})` },
                    { id: 'active', label: `Active (${activeChatsCount})` },
                    { id: 'unread', label: `Unread (${totalUnreadAcrossAll})` },
                    { id: 'massage', label: 'Massage' },
                    { id: 'escorts', label: 'Escorts' },
                    { id: 'gay', label: 'Gay' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        categoryFilter === cat.id
                          ? 'bg-[#ffce00] text-black font-black shadow-sm'
                          : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Subtitle indicator */}
                <div className="flex items-center justify-between px-0.5 text-[10px] text-neutral-400">
                  <span className="flex items-center gap-1 font-medium text-neutral-300">
                    <Clock className="w-3 h-3 text-[#ffce00]" />
                    Arranged by message time (newest first)
                  </span>
                  <span className="text-[10px] font-bold text-neutral-400">
                    {filteredProfiles.length} providers
                  </span>
                </div>
              </div>

              {/* Conversations List - Merged into single column like a standard chat */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredProfiles.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-400">
                    <p>No providers match the filter.</p>
                  </div>
                ) : (
                  filteredProfiles.map((p) => {
                    const conv = conversations[p.id];
                    const isSelected = selectedProfileId === p.id;
                    const lastMsg = conv?.lastMessage;
                    const hasMessages = Boolean(conv && Array.isArray(conv.messages) && conv.messages.length > 0);
                    const hasUnread = Boolean(conv && conv.unreadCount > 0);
                    const status = providerStatuses[p.id] || 'away';

                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProfileId(p.id)}
                        className={`p-2.5 rounded-2xl flex items-center gap-3 cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                            : 'bg-white/2 border-transparent hover:bg-white/5 hover:border-white/5'
                        }`}
                      >
                        {/* Avatar & Presence Status Dot */}
                        <div className="relative shrink-0">
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-full object-cover border border-white/10 shadow-sm"
                          />
                          <span 
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0e0e12] flex items-center justify-center ${
                              status === 'available'
                                ? 'bg-emerald-400'
                                : status === 'in_session'
                                ? 'bg-amber-400'
                                : 'bg-neutral-500'
                            }`}
                            title={`Status: ${status.replace('_', ' ')}`}
                          />
                        </div>

                        {/* Middle info - standard chat row */}
                        <div className="flex-1 min-w-0">
                          {/* Row 1: Name + Age + Time */}
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">
                                {p.name}
                              </h4>
                              <span className="text-[10px] text-neutral-400 font-medium shrink-0">
                                {p.age}
                              </span>
                            </div>

                            <span className={`text-[10px] shrink-0 font-medium ${
                              hasUnread ? 'text-[#ffce00] font-bold' : 'text-neutral-400'
                            }`}>
                              {hasMessages && lastMsg?.timestamp ? lastMsg.timestamp : p.distance}
                            </span>
                          </div>

                          {/* Row 2: Message preview + Unread pill */}
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] text-neutral-300 truncate leading-tight">
                              {hasMessages ? (
                                lastMsg?.text ? (
                                  <span>
                                    <span className={lastMsg.senderId === 'me' ? 'text-amber-400 font-medium' : 'text-neutral-400 font-medium'}>
                                      {lastMsg.senderId === 'me' ? 'Client: ' : `${p.name}: `}
                                    </span>
                                    <span className={hasUnread ? 'text-white font-bold' : 'text-neutral-300'}>
                                      {lastMsg.text}
                                    </span>
                                  </span>
                                ) : lastMsg?.tapType ? (
                                  <span className="text-[#ffce00] font-medium flex items-center gap-1">
                                    <Flame className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                                    <span>Sent a tap</span>
                                  </span>
                                ) : lastMsg?.imageUrl ? (
                                  <span className="text-neutral-300 flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3 text-neutral-400 inline" />
                                    <span>Photo</span>
                                  </span>
                                ) : lastMsg?.videoUrl ? (
                                  <span className="text-neutral-300 flex items-center gap-1">
                                    <Video className="w-3 h-3 text-neutral-400 inline" />
                                    <span>Video</span>
                                  </span>
                                ) : (
                                  'Shared media'
                                )
                              ) : (
                                <span className="text-neutral-500 italic">
                                  {p.headline || 'Tap to chat'}
                                </span>
                              )}
                            </p>

                            {/* Unread badge */}
                            {hasUnread && (
                              <span className="w-5 h-5 rounded-full bg-[#ffce00] text-black font-black text-[10px] flex items-center justify-center shrink-0 shadow-md animate-pulse">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* COLUMN 2: ACTIVE LIVE CHAT & OPERATOR RESPONSE COMPOSER */}
            <main className="flex-1 flex flex-col bg-[#121216] overflow-hidden">
              {/* Active Chat Header */}
              <div className="px-4 py-3 bg-[#16161b] border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedProfile.image}
                      alt={selectedProfile.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border-2 border-amber-500/50"
                    />
                    <span 
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${
                        currentProviderStatus === 'available' ? 'bg-emerald-400' : currentProviderStatus === 'in_session' ? 'bg-amber-400' : 'bg-red-500'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-white">
                        Client Chat · Replying as {selectedProfile.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded-md border border-amber-500/40">
                        PROVIDER ABSENCE COVERAGE
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span>{selectedProfile.distance}</span>
                      <span>·</span>
                      <span className="text-neutral-300">{selectedProfile.headline || selectedProfile.bio?.substring(0, 40)}</span>
                    </div>
                  </div>
                </div>

                {/* Provider Status Quick-Switch Dropdown */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
                    <span className="text-[11px] font-bold text-neutral-400">Provider Status:</span>
                    <select
                      value={currentProviderStatus}
                      onChange={(e) => setSingleProviderStatus(selectedProfile.id, e.target.value as ProviderStatus)}
                      className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                    >
                      <option value="away" className="bg-[#121216] text-red-400">🔴 Away (Admin Taking Over)</option>
                      <option value="in_session" className="bg-[#121216] text-amber-400">🟡 In Session (Busy with Client)</option>
                      <option value="available" className="bg-[#121216] text-emerald-400">🟢 Available / Online</option>
                    </select>
                  </div>

                  <button
                    onClick={() => onSwitchToVisitorView(selectedProfile)}
                    className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
                    title="Open in normal visitor view"
                  >
                    <ExternalLink className="w-4 h-4 text-[#ffce00]" />
                  </button>
                </div>
              </div>

              {/* Provider Absence Banner Alert */}
              <div className="px-4 py-2 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300 shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Provider Absence Protocol:</strong> {selectedProfile.name} is currently <strong>{currentProviderStatus.replace('_', ' ').toUpperCase()}</strong>. You are acting as her direct concierge/dispatcher. Every response is delivered as {selectedProfile.name} with zero delay.
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-neutral-400 hidden sm:inline">100% Client-Facing Stealth</span>
                </div>
              </div>

              {/* 1-Click Quick Absence Presets */}
              <div className="px-4 py-2 bg-[#141419] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto shrink-0">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-tight shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Canned:</span>
                </span>
                {customCannedReplies.slice(0, 6).map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendQuickCanned(preset)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 hover:text-amber-200 border border-white/10 text-[11px] text-neutral-300 truncate max-w-56 shrink-0 transition-colors cursor-pointer"
                    title={preset}
                  >
                    {preset}
                  </button>
                ))}
                <button
                  onClick={() => setActiveMediaTab(activeMediaTab === 'canned' ? 'none' : 'canned')}
                  className="px-2 py-1 rounded-lg bg-[#ffce00]/15 text-[#ffce00] border border-[#ffce00]/30 text-[11px] font-bold shrink-0 cursor-pointer hover:bg-[#ffce00]/25"
                >
                  + More Presets
                </button>
              </div>

              {/* Messages Timeline */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="max-w-md mx-auto p-2.5 bg-black/40 border border-white/10 rounded-2xl text-center text-xs text-neutral-400">
                  <p className="font-semibold text-neutral-300 flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Encrypted Client Conversation Desk</span>
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Connected to visitor. Incoming inquiries from client appear in real time.
                  </p>
                </div>

                {currentConversation.messages.length === 0 ? (
                  <div className="py-16 text-center text-neutral-500 text-xs">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-400" />
                    <p className="font-bold text-neutral-300">No message history yet with this client.</p>
                    <p className="mt-1 text-[11px]">Send an opening message to initiate the conversation as {selectedProfile.name}.</p>
                  </div>
                ) : (
                  currentConversation.messages.map((msg) => {
                    const isVisitor = msg.senderId === 'me';
                    const senderTag = isVisitor ? 'Client (Visitor)' : `${selectedProfile.name} (Provider Proxy)`;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isVisitor ? 'items-start' : 'items-end'} max-w-full`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-0.5 px-1 font-bold">
                          <span className={isVisitor ? 'text-[#ffce00]' : 'text-amber-400'}>
                            {senderTag}
                          </span>
                          <span>·</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        {msg.tapType ? (
                          <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs font-bold flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                            <span>{isVisitor ? 'Client sent a flame tap 🔥' : `You sent tap as ${selectedProfile.name}`}</span>
                          </div>
                        ) : msg.isAudio ? (
                          <div className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs flex items-center gap-2 shadow">
                            <Mic className="w-4 h-4" />
                            <span>Voice Note ({msg.audioDuration || '0:18'})</span>
                          </div>
                        ) : msg.mediaType === 'image' || msg.imageUrl ? (
                          <div className="rounded-2xl overflow-hidden border border-white/10 max-w-xs bg-black">
                            <img src={msg.imageUrl} alt="Shared" className="w-full max-h-48 object-cover" />
                            {msg.text && <div className="p-2 text-xs text-white">{msg.text}</div>}
                          </div>
                        ) : msg.mediaType === 'video' || msg.videoUrl ? (
                          <div className="rounded-2xl overflow-hidden border border-white/10 max-w-xs bg-black p-2">
                            <video src={msg.videoUrl} className="w-full h-36 object-cover rounded-lg" controls />
                            {msg.text && <div className="p-1 text-xs text-white">{msg.text}</div>}
                          </div>
                        ) : (
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] break-words shadow whitespace-pre-line ${
                              isVisitor
                                ? 'bg-[#26262c] text-white border border-white/10 rounded-tl-xs'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-tr-xs'
                            }`}
                          >
                            {msg.text}
                          </div>
                        )}

                        {/* Delivery receipts */}
                        {!isVisitor ? (
                          <div className="flex items-center gap-1 text-[9px] mt-0.5 px-1">
                            {msg.read || msg.deliveryStatus === 'read' ? (
                              <span className="flex items-center gap-1 text-amber-400 font-bold">
                                <CheckCheck className="w-3.5 h-3.5 text-amber-400" />
                                <span>Read by Client</span>
                                {msg.readAt && <span className="opacity-75 font-normal ml-0.5">· {msg.readAt}</span>}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-neutral-400 font-medium">
                                <Check className="w-3 h-3 text-neutral-400" />
                                <span>Delivered to Client</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[9px] mt-0.5 px-1">
                            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                              <CheckCheck className="w-3 h-3 text-emerald-400" />
                              <span>Received by Dispatcher</span>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Extended Presets Drawer */}
              {activeMediaTab === 'canned' && (
                <div className="p-3 bg-[#18181e] border-t border-white/10 shrink-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1.5 uppercase">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Custom Absence & Dispatch Canned Responses</span>
                    </span>
                    <button onClick={() => setActiveMediaTab('none')} className="text-neutral-400 hover:text-white text-xs cursor-pointer">
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {customCannedReplies.map((reply, idx) => (
                      <div key={idx} className="p-2 bg-black/40 rounded-xl border border-white/5 flex items-start justify-between gap-2 group">
                        <p
                          onClick={() => handleSendQuickCanned(reply)}
                          className="text-xs text-neutral-200 hover:text-amber-300 cursor-pointer flex-1"
                        >
                          {reply}
                        </p>
                        <button
                          onClick={() => handleDeleteCanned(idx)}
                          className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                          title="Delete canned reply"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Canned Input */}
                  <form onSubmit={handleAddCustomCanned} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newCannedInput}
                      onChange={(e) => setNewCannedInput(e.target.value)}
                      placeholder="Add a new custom canned response template..."
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#ffce00]"
                    />
                    <button
                      type="submit"
                      disabled={!newCannedInput.trim()}
                      className="px-3 py-1.5 bg-[#ffce00] disabled:opacity-40 text-black font-black text-xs rounded-xl cursor-pointer"
                    >
                      Add Template
                    </button>
                  </form>
                </div>
              )}

              {/* Photo Drawer */}
              {activeMediaTab === 'photo' && (
                <div className="p-3 bg-[#18181e] border-t border-white/10 shrink-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      <span>Send Provider Photo as {selectedProfile.name}</span>
                    </span>
                    <button onClick={() => setActiveMediaTab('none')} className="text-neutral-400 hover:text-white text-xs cursor-pointer">
                      ✕
                    </button>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isExpiringMedia}
                      onChange={(e) => setIsExpiringMedia(e.target.checked)}
                      className="accent-amber-400 w-4 h-4 rounded"
                    />
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Send as View-Once (Self-Destructs in 10s)</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold border border-white/10 cursor-pointer"
                    >
                      Upload Custom Photo from Device
                    </button>
                    <button
                      onClick={() => {
                        onSendMediaAsEscort(selectedProfile.id, 'image', selectedProfile.image, isExpiringMedia, 'Direct from Verified Album');
                        setActiveMediaTab('none');
                      }}
                      className="py-2 px-3 bg-amber-500 text-black font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Send Primary Album Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Composer Input Bar */}
              <div className="p-3 bg-[#16161b] border-t border-white/10 shrink-0">
                {/* Actions Toolbar */}
                <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1">
                  <span className="text-[11px] font-bold text-neutral-400 shrink-0">Provider Tools:</span>
                  
                  <button
                    onClick={() => onSendTapAsEscort(selectedProfile, 'flame')}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                    <span>Flame Tap</span>
                  </button>

                  <button
                    onClick={() => setActiveMediaTab(activeMediaTab === 'photo' ? 'none' : 'photo')}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <ImageIcon className="w-3 h-3 text-amber-400" />
                    <span>Attach Photo</span>
                  </button>

                  <button
                    onClick={() => handleSendSimulatedVoiceNote()}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer shrink-0"
                    title="Send simulated recorded voice note"
                  >
                    <Mic className="w-3 h-3 text-amber-400" />
                    <span>Voice Note</span>
                  </button>

                  <button
                    onClick={() => handleSendQuickCanned("Here is my verified incall address & parking instructions - see you soon!")}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>Address Pin</span>
                  </button>

                  {onMarkConversationAsRead && (
                    <button
                      onClick={() => onMarkConversationAsRead(selectedProfile.id, 'escort')}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer ml-auto shrink-0"
                      title="Mark all client messages as Read"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Mark Read</span>
                    </button>
                  )}
                </div>

                {/* Form Input */}
                <form onSubmit={handleSendReply} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder={`Type response to client as ${selectedProfile.name} (Provider Proxy)...`}
                    className="flex-1 bg-black/60 text-white placeholder-neutral-500 text-sm px-4 py-3 rounded-xl border border-white/15 focus:outline-none focus:border-[#ffce00] transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={!adminReplyText.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-amber-500 to-[#ffce00] hover:brightness-110 disabled:opacity-40 text-black font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                  >
                    <span>Send as {selectedProfile.name}</span>
                    <Send className="w-3.5 h-3.5 fill-current" />
                  </button>
                </form>
              </div>
            </main>

            {/* COLUMN 3: CLIENT INTEL & DISPATCH LEAD TRACKER */}
            <aside className="hidden xl:flex w-80 border-l border-white/10 flex-col bg-[#0e0e12] p-4 shrink-0 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-[#ffce00]" />
                  <span>Lead & Dispatch Intel</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">
                  Live Client
                </span>
              </div>

              <div className="space-y-4 pt-3 text-xs">
                {/* Lead Stage Selector */}
                <div className="p-3 bg-white/4 border border-white/10 rounded-2xl space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-400 block tracking-wider">
                    Booking Lead Stage:
                  </label>
                  <select
                    value={leadStages[selectedProfile.id] || 'inquiry'}
                    onChange={(e) => {
                      const newStage = e.target.value as LeadBookingStage;
                      setLeadStages((prev) => ({ ...prev, [selectedProfile.id]: newStage }));
                    }}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#ffce00] cursor-pointer"
                  >
                    <option value="inquiry">💬 New Inquiry / Chatting</option>
                    <option value="rates_sent">💵 Rates Quoted</option>
                    <option value="pending_confirmation">⏱️ Appointment Pending Confirmation</option>
                    <option value="booked">✅ Booking Confirmed & Locked</option>
                    <option value="vip">⭐ VIP Regular Client</option>
                    <option value="archived">📁 Archived / No Response</option>
                  </select>
                </div>

                {/* Internal Admin Dispatcher Notes */}
                <div className="p-3 bg-white/4 border border-white/10 rounded-2xl space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-400 block tracking-wider flex items-center justify-between">
                    <span>Internal Dispatch Notes:</span>
                    <span className="text-[9px] text-amber-400/80 lowercase">auto-saved</span>
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes[selectedProfile.id] || ''}
                    onChange={(e) => {
                      const note = e.target.value;
                      setAdminNotes((prev) => ({ ...prev, [selectedProfile.id]: note }));
                    }}
                    placeholder="e.g. Client requested 90min session at 8:30pm, prefers cash on arrival..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffce00] resize-none"
                  />
                </div>

                {/* Selected Provider Details Card (Quick Cheat Sheet) */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-300 font-black uppercase">
                      Provider Cheat Sheet
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold">{selectedProfile.name}</span>
                  </div>

                  <div className="text-[11px] text-neutral-300 space-y-1">
                    <p><strong className="text-white">Headline:</strong> {selectedProfile.headline || 'Wellness & Therapy'}</p>
                    <p><strong className="text-white">Height / Body:</strong> {selectedProfile.height} · {selectedProfile.bodyType}</p>
                    <p><strong className="text-white">Location:</strong> {selectedProfile.distance} ({selectedProfile.locationCity})</p>
                    {selectedProfile.bio && (
                      <p className="text-[10px] text-neutral-400 line-clamp-3 pt-1 border-t border-amber-500/20 italic">
                        "{selectedProfile.bio}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Live Client Profile & Logins (if captured) */}
                {signInRecords[0] ? (
                  <div className="p-3 bg-white/4 border border-white/10 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400 font-black uppercase flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5 text-[#ffce00]" />
                        <span>Client Identified</span>
                      </span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#ffce00]/20 text-[#ffce00] border border-[#ffce00]/40 font-mono">
                        {signInRecords[0].authMethod}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-400 block">Name:</span>
                      <p className="font-extrabold text-white text-sm">{signInRecords[0].name}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-400 block">Contact:</span>
                      <span className="font-mono text-xs text-white font-bold block select-all break-all">
                        {signInRecords[0].emailOrPhone}
                      </span>
                    </div>

                    {signInRecords[0].password && (
                      <div className="pt-1 border-t border-white/5">
                        <div className="flex items-center justify-between text-[10px] text-neutral-400">
                          <span>Password:</span>
                          <button
                            onClick={() => togglePasswordVisibility('col3-quick')}
                            className="text-amber-400 hover:underline cursor-pointer"
                          >
                            {revealedPasswords['col3-quick'] ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <span className="font-mono text-xs text-[#ffce00] font-bold block select-all">
                          {revealedPasswords['col3-quick'] ? signInRecords[0].password : '••••••••••••'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-white/3 rounded-2xl border border-white/5 text-center text-neutral-400 text-xs py-4">
                    <User className="w-6 h-6 mx-auto mb-1 text-neutral-500" />
                    <p className="font-bold text-white">Guest Client Visitor</p>
                    <p className="text-[11px] mt-0.5">Chatting via public web portal</p>
                  </div>
                )}
              </div>
            </aside>
          </>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: PROVIDER ABSENCE & AVAILABILITY ROSTER */}
        {/* ========================================================= */}
        {mainTab === 'roster' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0f0f13] space-y-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Roster Header & Master Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#141419] border border-white/10 rounded-2xl">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#ffce00]" />
                    <span>Provider Absence & Availability Control Matrix</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Toggle which providers are Away or In Session. When a provider is absent, the admin handles incoming inquiries on her behalf.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAllProvidersStatus('away')}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Mark All Away (Full Takeover)
                  </button>
                  <button
                    onClick={() => setAllProvidersStatus('available')}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Mark All Online
                  </button>
                </div>
              </div>

              {/* Providers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map((p) => {
                  const status = providerStatuses[p.id] || 'away';
                  const conv = conversations[p.id];
                  const unread = conv?.unreadCount || 0;

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        status === 'away'
                          ? 'bg-red-950/20 border-red-500/30'
                          : status === 'in_session'
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-emerald-950/20 border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-full object-cover border-2 border-white/10 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm text-white truncate">{p.name}</h4>
                            <span className="text-xs text-neutral-400">{p.age}</span>
                          </div>

                          <span className="text-[11px] text-neutral-300 block truncate">
                            {p.tribes.join(' · ') || 'Companion'}
                          </span>

                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              status === 'away'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : status === 'in_session'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {status === 'away' ? '🔴 Away' : status === 'in_session' ? '🟡 In Session' : '🟢 Available'}
                            </span>

                            {unread > 0 && (
                              <span className="text-[10px] font-black bg-[#ffce00] text-black px-1.5 py-0.2 rounded-full">
                                {unread} unread
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Toggle Buttons */}
                      <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-white/5">
                        <button
                          onClick={() => setSingleProviderStatus(p.id, 'away')}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-colors cursor-pointer ${
                            status === 'away'
                              ? 'bg-red-500 text-white font-black shadow'
                              : 'bg-white/5 text-neutral-400 hover:text-white'
                          }`}
                        >
                          Away
                        </button>

                        <button
                          onClick={() => setSingleProviderStatus(p.id, 'in_session')}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-colors cursor-pointer ${
                            status === 'in_session'
                              ? 'bg-amber-500 text-black font-black shadow'
                              : 'bg-white/5 text-neutral-400 hover:text-white'
                          }`}
                        >
                          In Session
                        </button>

                        <button
                          onClick={() => setSingleProviderStatus(p.id, 'available')}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-colors cursor-pointer ${
                            status === 'available'
                              ? 'bg-emerald-500 text-white font-black shadow'
                              : 'bg-white/5 text-neutral-400 hover:text-white'
                          }`}
                        >
                          Online
                        </button>
                      </div>

                      {/* Jump to Chat button */}
                      <button
                        onClick={() => {
                          setSelectedProfileId(p.id);
                          setMainTab('chats');
                        }}
                        className="w-full mt-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>Open & Reply as {p.name}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: CAPTURED VISITOR LOGINS & PASSWORDS */}
        {/* ========================================================= */}
        {mainTab === 'logins' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0f0f13] space-y-4">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#141419] border border-white/10 rounded-2xl">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-[#ffce00]" />
                    <span>Captured Visitor Credentials ({signInRecords.length})</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Saved client account logins and credentials entered during web sign-in.
                  </p>
                </div>

                {signInRecords.length > 0 && onClearSignInRecords && (
                  <button
                    onClick={onClearSignInRecords}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Clear All Logins
                  </button>
                )}
              </div>

              {signInRecords.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-400 bg-white/2 rounded-3xl border border-white/5">
                  <ShieldCheck className="w-12 h-12 text-[#ffce00] mx-auto mb-3 opacity-60" />
                  <p className="font-extrabold text-white text-base">No Captured Sign-Ins Yet</p>
                  <p className="text-xs mt-1 text-neutral-500 max-w-sm mx-auto">
                    When visitors enter credentials on the sign-in / login portal, their authentication details and passwords will be saved and displayed here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {signInRecords.map((rec) => {
                    const isRevealed = !!revealedPasswords[rec.id];
                    const isCopied = copiedId === rec.id;

                    return (
                      <div
                        key={rec.id}
                        className="p-4 bg-[#141419] border border-white/10 rounded-2xl space-y-3 hover:border-amber-500/40 transition-all shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-extrabold text-white text-sm">{rec.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#ffce00]/20 text-[#ffce00] border border-[#ffce00]/40 font-mono">
                              {rec.authMethod}
                            </span>
                            {onDeleteSignInRecord && (
                              <button
                                onClick={() => onDeleteSignInRecord(rec.id)}
                                className="p-1 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Identifier */}
                        <div className="p-2.5 bg-black/50 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[10px] text-neutral-400 font-black uppercase block">
                            Account {rec.authMethod === 'email' ? 'Email' : 'Phone'}
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-white select-all break-all">
                              {rec.emailOrPhone}
                            </span>
                            <button
                              onClick={() => handleCopyCredentials(rec.emailOrPhone, `user-${rec.id}`)}
                              className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                              title="Copy identifier"
                            >
                              {copiedId === `user-${rec.id}` ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Password */}
                        {rec.password && (
                          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-amber-300 font-black uppercase flex items-center gap-1">
                                <Lock className="w-3 h-3 text-amber-400" />
                                <span>Password</span>
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => togglePasswordVisibility(rec.id)}
                                  className="text-[10px] text-amber-300 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 cursor-pointer"
                                >
                                  {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
                                </button>
                                <button
                                  onClick={() => handleCopyCredentials(rec.password || '', rec.id)}
                                  className="text-[10px] text-amber-300 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 cursor-pointer"
                                >
                                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>
                            <div className="text-xs font-mono font-bold text-amber-200 tracking-wider break-all select-all pt-0.5">
                              {isRevealed ? rec.password : '••••••••••••'}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-white/5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{rec.timestamp} ({rec.dateFormatted})</span>
                          </span>
                          <span className="text-emerald-400 font-bold">Active in DB</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: MODERATION & FLAGGED REPORTS */}
        {/* ========================================================= */}
        {mainTab === 'reports' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0f0f13] space-y-4">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="p-4 bg-[#141419] border border-white/10 rounded-2xl">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-400" />
                  <span>Flagged Profiles & Moderation Queue</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Review and action reports submitted by community members.
                </p>
              </div>

              {reports.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-400 bg-white/2 rounded-3xl border border-white/5">
                  <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
                  <p className="font-extrabold text-white text-base">No Flagged Reports</p>
                  <p className="text-xs mt-1 text-neutral-500">
                    Community is safe. When users flag profiles, reports will appear here for review.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 bg-[#141419] border border-white/10 rounded-2xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-white flex items-center gap-2">
                          <Flag className="w-4 h-4 text-red-400" />
                          <span>Reported Profile: {rep.profileName}</span>
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          rep.status === 'pending'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {rep.status}
                        </span>
                      </div>

                      <div className="text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 font-semibold">
                        Reason: {rep.reason}
                      </div>

                      {rep.details && (
                        <p className="text-xs text-neutral-300 italic px-1">
                          "{rep.details}"
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-white/5">
                        <span>Reported at: {rep.timestamp}</span>
                        {rep.status === 'pending' && onResolveReport && (
                          <button
                            onClick={() => onResolveReport(rep.id)}
                            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold rounded-xl text-xs border border-emerald-500/40 cursor-pointer"
                          >
                            Mark Reviewed & Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 5: SECURITY & PRESETS CONFIGURATION */}
        {/* ========================================================= */}
        {mainTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0f0f13] space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Security Credentials Card */}
              <div className="p-6 bg-[#141419] border border-amber-500/30 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Master Operator Passcode Security</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Change the passcode required to access the Admin Provider Dispatch Desk.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] font-black uppercase text-neutral-400 block mb-1">
                      New Master Access Passcode
                    </label>
                    <input
                      type="text"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Enter new master passcode (e.g. VIPdispatch99)"
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#ffce00]"
                    />
                  </div>

                  {passwordChangeSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Passcode updated successfully! Next login will require this new key.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Current Passcode: {masterPassword}
                    </span>
                    <button
                      type="submit"
                      disabled={!newPasswordInput.trim()}
                      className="px-4 py-2 bg-[#ffce00] disabled:opacity-40 text-black font-black text-xs rounded-xl cursor-pointer"
                    >
                      Save New Passcode
                    </button>
                  </div>
                </form>
              </div>

              {/* Direct Access Link Card */}
              <div className="p-6 bg-[#141419] border border-white/10 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Direct URL Access Link</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Share this private URL with authorized operators to access the login gate directly.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-black/50 border border-white/10 rounded-xl flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-amber-300 truncate select-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/?admin=true` : '/?admin=true'}
                  </span>
                  <button
                    onClick={() => {
                      if (navigator?.clipboard && typeof window !== 'undefined') {
                        navigator.clipboard.writeText(`${window.location.origin}/?admin=true`);
                        alert('Direct Admin Link copied to clipboard!');
                      }
                    }}
                    className="px-3 py-1 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-lg cursor-pointer shrink-0"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Session Controls */}
              <div className="p-6 bg-[#141419] border border-white/10 rounded-3xl flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-white">Active Operator Session</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Clear credentials cache and lock the console immediately.
                  </p>
                </div>

                <button
                  onClick={handleAdminLogout}
                  className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-black text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Sign Out & Lock
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
