import React, { useState, useMemo } from 'react';
import { 
  Grid, MessageSquare, Star, User, Sparkles, 
  SlidersHorizontal, Search, ArrowLeft, Volume2, 
  Flame, Check, Bell, Shield, LogOut, ChevronRight, Lock,
  Video, Image as ImageIcon, Plus, ChevronDown, Heart, Clock
} from 'lucide-react';
import { GrindrLogo } from './GrindrLogo';
import { Profile, ChatMessage, Conversation, FilterState, TapType } from '../types';
import { ChatView } from './ChatView';
import { MyProfileData } from './MyProfileModal';
import { getConversationRecencyScore } from '../utils/timeUtils';

interface GrindrWebClientProps {
  profiles: Profile[];
  conversations: Record<string, Conversation>;
  filters: FilterState;
  myProfile: MyProfileData;
  activeProfile: Profile | null;
  activeChatProfile: Profile | null;
  isTyping?: Record<string, boolean>;
  initialTab?: WebTab;
  onSelectProfile: (profile: Profile) => void;
  onOpenChat: (profile: Profile) => void;
  onCloseChat: () => void;
  onSendMessage: (profileId: string, text: string, options?: Partial<ChatMessage>) => void;
  onSendTap: (profile: Profile, tap: TapType, asPartner?: boolean) => void;
  onSendExpiringPhoto: (profileId: string, asPartner?: boolean) => void;
  onSendLocation: (profileId: string, asPartner?: boolean) => void;
  onExpireMessage?: (messageId: string) => void;
  onToggleFavorite: (profileId: string) => void;
  onOpenFilters: () => void;
  onOpenUnlimited: () => void;
  onOpenMyProfile: () => void;
  onExitToLanding: () => void;
  onOpenBackendAccess?: () => void;
  onMarkConversationAsRead?: (profileId: string, byRole: 'visitor' | 'escort') => void;
}

export type WebTab = 'grid' | 'messages' | 'favorites' | 'profile';

export const GrindrWebClient: React.FC<GrindrWebClientProps> = ({
  profiles,
  conversations,
  filters,
  myProfile,
  activeProfile,
  activeChatProfile,
  isTyping,
  initialTab,
  onSelectProfile,
  onOpenChat,
  onCloseChat,
  onSendMessage,
  onSendTap,
  onSendExpiringPhoto,
  onSendLocation,
  onExpireMessage,
  onToggleFavorite,
  onOpenFilters,
  onOpenUnlimited,
  onOpenMyProfile,
  onExitToLanding,
  onOpenBackendAccess,
  onMarkConversationAsRead,
}) => {
  const [activeTab, setActiveTab] = useState<WebTab>(initialTab || 'grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatPicker, setShowNewChatPicker] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    gay: false,
    trans: false,
    massage: false,
  });

  const toggleSection = (key: 'gay' | 'trans' | 'massage') => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Calculate unread message count
  const totalUnread = Object.values(conversations).reduce(
    (acc, curr) => acc + (curr.unreadCount || 0),
    0
  );

  // Merge all providers into a unified conversation list arranged normally like a chat
  const allMergedChats = useMemo(() => {
    return [...profiles].sort((a, b) => {
      const convA = conversations[a.id];
      const convB = conversations[b.id];
      const scoreA = getConversationRecencyScore(convA);
      const scoreB = getConversationRecencyScore(convB);
      if (scoreA !== scoreB) return scoreB - scoreA;
      const unreadA = convA?.unreadCount || 0;
      const unreadB = convB?.unreadCount || 0;
      if (unreadA !== unreadB) return unreadB - unreadA;
      return a.name.localeCompare(b.name);
    });
  }, [profiles, conversations]);

  // Filter profiles based on current filters and search, ensuring no repeated profile name or image
  const seenNames = new Set<string>();
  const seenImages = new Set<string>();

  const visibleProfiles = profiles.filter((p) => {
    if (activeTab === 'favorites' && !p.isFavorite) return false;
    if (filters.onlineOnly && !p.isOnline) return false;
    if (p.age > filters.maxAge || p.age < filters.minAge) return false;

    if (filters.selectedTribes.length > 0) {
      const hasTribe = p.tribes.some((t) => filters.selectedTribes.includes(t));
      if (!hasTribe) return false;
    }

    if (filters.selectedLookingFor.length > 0) {
      const hasLooking = p.lookingFor.some((l) => filters.selectedLookingFor.includes(l));
      if (!hasLooking) return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(query);
      const matchBio = p.bio.toLowerCase().includes(query);
      const matchTribe = p.tribes.some((t) => t.toLowerCase().includes(query));
      if (!matchName && !matchBio && !matchTribe) return false;
    }

    const nameKey = p.name.trim().toLowerCase();
    if (seenNames.has(nameKey) || seenImages.has(p.image)) {
      return false;
    }
    seenNames.add(nameKey);
    seenImages.add(p.image);

    return true;
  });

  return (
    <div className="flex h-screen w-screen bg-[#0d0d0f] text-white overflow-hidden select-none">
      {/* ============================================================ */}
      {/* DESKTOP APP RAIL (LEFT) */}
      {/* ============================================================ */}
      <aside className="hidden md:flex flex-col items-center justify-between w-18 lg:w-20 bg-[#141416] border-r border-white/10 py-5 shrink-0 z-20">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo mask button */}
          <button
            onClick={() => setActiveTab('grid')}
            className="w-12 h-12 rounded-2xl bg-[#ffce00] flex items-center justify-center shadow-lg shadow-[#ffce00]/20 transition-transform active:scale-95 group"
            title="Grindr Radar Grid"
          >
            <GrindrLogo iconOnly size={28} color="#000" />
          </button>

          {/* Navigation items */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            <button
              onClick={() => setActiveTab('grid')}
              className={`w-full py-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'grid'
                  ? 'bg-white/10 text-[#ffce00]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Nearby Radar"
            >
              <Grid className="w-5 h-5" />
              <span className="text-[10px] font-bold">Nearby</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full py-3 rounded-2xl flex flex-col items-center gap-1 relative transition-all ${
                activeTab === 'messages'
                  ? 'bg-white/10 text-[#ffce00]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Secure Private Chat"
            >
              <div className="relative">
                <MessageSquare className="w-5 h-5" />
                <span className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 border border-white/20">
                  <Lock className="w-2.5 h-2.5 text-[#ffce00]" />
                </span>
                {totalUnread > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#ffce00] text-black font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-extrabold tracking-tight">Private Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`w-full py-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'favorites'
                  ? 'bg-white/10 text-[#ffce00]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Favorites"
            >
              <Star className="w-5 h-5" />
              <span className="text-[10px] font-bold">Starred</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full py-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'profile'
                  ? 'bg-white/10 text-[#ffce00]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="My Profile"
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-bold">Profile</span>
            </button>
          </nav>
        </div>

        {/* Bottom utility icons */}
        <div className="flex flex-col items-center gap-2.5 w-full px-2">
          {onOpenBackendAccess && (
            <button
              onClick={onOpenBackendAccess}
              className="w-10 h-10 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 flex flex-col items-center justify-center shadow transition-all active:scale-95 cursor-pointer"
              title="Backend Access (Admin Operator Console)"
            >
              <Shield className="w-4 h-4" />
              <span className="text-[8px] font-black uppercase tracking-tighter">Desk</span>
            </button>
          )}

          <button
            onClick={onOpenUnlimited}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ffce00] to-amber-300 text-black flex items-center justify-center shadow transition-transform active:scale-95"
            title="Grindr Unlimited"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          <button
            onClick={onExitToLanding}
            className="w-10 h-10 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
            title="Return to Landing Page"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN CONTENT / APP BODY */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top App Bar */}
        <header className="px-4 sm:px-6 py-3 bg-[#141416] border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitToLanding}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Back to Landing page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Landing</span>
            </button>

            {/* Live Radar status */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs">
              <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
              <span className="font-extrabold text-white">Live Radar</span>
            </div>
          </div>

          {/* Search & Filter tools */}
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search profiles or tribes..."
                className="w-full bg-black/40 text-xs text-white placeholder-neutral-500 pl-9 pr-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffce00]"
              />
            </div>

            <button
              onClick={onOpenFilters}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                filters.onlineOnly || filters.selectedTribes.length > 0 || filters.selectedLookingFor.length > 0
                  ? 'bg-[#ffce00] text-black border-[#ffce00]'
                  : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
              }`}
              title="Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            <button
              onClick={onOpenUnlimited}
              className="px-3 py-2 bg-[#ffce00]/20 hover:bg-[#ffce00]/30 text-[#ffce00] border border-[#ffce00]/40 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">UNLIMITED</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Area (Split Dual-Pane or Single View) */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* ============================================================ */}
          {/* TAB 1: RADAR GRID OR FAVORITES */}
          {/* ============================================================ */}
          {(activeTab === 'grid' || activeTab === 'favorites') && (
            <div className="flex-1 flex overflow-hidden">
              {/* Profile Grid Scroll Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5">
                {/* Status Bar */}
                <div className="flex items-center justify-between mb-4 px-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00e676]" />
                    <span className="text-neutral-300 font-bold">
                      {visibleProfiles.length} guys nearby
                    </span>
                  </div>

                  {myProfile.incognito && (
                    <span className="px-2 py-0.5 bg-amber-950/40 border border-amber-500/30 text-amber-400 font-bold text-[10px] rounded-md">
                      👻 Ghost Mode Active
                    </span>
                  )}
                </div>

                {/* Profiles Grid */}
                {visibleProfiles.length === 0 ? (
                  <div className="text-center py-20 bg-white/3 rounded-3xl border border-white/5 p-8">
                    <p className="text-neutral-400 text-sm">No profiles match your current filter settings.</p>
                    <button
                      onClick={onOpenFilters}
                      className="mt-3 px-4 py-2 bg-[#ffce00] text-black font-bold text-xs rounded-xl"
                    >
                      Adjust Filters
                    </button>
                  </div>
                ) : (
                  <div className="w-full space-y-4 pb-6">
                    {/* Gay Section */}
                    {(() => {
                      const gayProfiles = profiles
                        .filter(p => !p.tribes.includes('Trans') && !p.tribes.includes('Massage Therapist'))
                        .filter((p, index, self) => index === self.findIndex((t) => t.id === p.id));
                      const isExpanded = !!openSections.gay;
                      return (
                        <div className="w-full bg-[#141417]/90 border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all">
                          <button
                            type="button"
                            onClick={() => toggleSection('gay')}
                            className="w-full px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer group"
                            aria-expanded={isExpanded}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#ffce00]/15 text-[#ffce00] flex items-center justify-center shrink-0">
                                <Flame className="w-5 h-5 fill-[#ffce00]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
                                    Gay Profiles
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-[#ffce00]/20 text-[#ffce00] text-[10px] font-black">
                                    {gayProfiles.length}
                                  </span>
                                </div>
                                <p className="text-[11px] text-neutral-400 font-medium">
                                  {isExpanded ? 'Click to collapse section' : 'Click to drop down and view profiles'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-neutral-400 group-hover:text-white transition-colors hidden sm:inline">
                                {isExpanded ? 'Collapse' : 'Expand'}
                              </span>
                              <div className={`w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-[#ffce00]/20 border-[#ffce00]/40 text-[#ffce00]' : 'text-neutral-300'}`}>
                                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-3 sm:p-5 pt-0 border-t border-white/5 animate-in fade-in duration-200">
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-3.5">
                                {gayProfiles.map(p => (
                                  <div
                                    key={p.id}
                                    onClick={() => onSelectProfile(p)}
                                    className="group relative aspect-4/5 rounded-2xl overflow-hidden bg-neutral-900 border border-white/15 hover:border-[#ffce00] transition-all duration-200 cursor-pointer shadow-md hover:scale-102 hover:shadow-xl hover:shadow-[#ffce00]/15"
                                  >
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

                                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-[9px] font-bold text-neutral-200">
                                      {p.distance}
                                    </div>

                                    <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 pointer-events-none">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${p.isOnline ? 'bg-[#00e676]' : 'bg-neutral-500'}`} />
                                        <span className="text-white font-extrabold text-xs sm:text-sm truncate drop-shadow-sm">
                                          {p.name}, {p.age}
                                        </span>
                                      </div>
                                      {p.headline && (
                                        <p className="text-[10px] text-neutral-300 truncate mt-0.5 font-medium opacity-90">
                                          {p.headline}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Trans Section */}
                    {(() => {
                      const transProfiles = profiles.filter(p => p.tribes.includes('Trans'));
                      const isExpanded = !!openSections.trans;
                      return (
                        <div className="w-full bg-[#141417]/90 border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all">
                          <button
                            type="button"
                            onClick={() => toggleSection('trans')}
                            className="w-full px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer group"
                            aria-expanded={isExpanded}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5 fill-pink-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
                                    Trans Escorts & Profiles
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-black">
                                    {transProfiles.length}
                                  </span>
                                </div>
                                <p className="text-[11px] text-neutral-400 font-medium">
                                  {isExpanded ? 'Click to collapse section' : 'Click to drop down and view profiles'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-neutral-400 group-hover:text-white transition-colors hidden sm:inline">
                                {isExpanded ? 'Collapse' : 'Expand'}
                              </span>
                              <div className={`w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-pink-500/20 border-pink-400/40 text-pink-300' : 'text-neutral-300'}`}>
                                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-3 sm:p-5 pt-0 border-t border-white/5 animate-in fade-in duration-200">
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-3.5">
                                {transProfiles.map(p => (
                                  <div
                                    key={p.id}
                                    onClick={() => onSelectProfile(p)}
                                    className="group relative aspect-4/5 rounded-2xl overflow-hidden bg-neutral-900 border border-white/15 hover:border-pink-400 transition-all duration-200 cursor-pointer shadow-md hover:scale-102 hover:shadow-xl hover:shadow-pink-500/15"
                                  >
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

                                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-[9px] font-bold text-neutral-200">
                                      {p.distance}
                                    </div>

                                    <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 pointer-events-none">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${p.isOnline ? 'bg-[#00e676]' : 'bg-neutral-500'}`} />
                                        <span className="text-white font-extrabold text-xs sm:text-sm truncate drop-shadow-sm">
                                          {p.name}, {p.age}
                                        </span>
                                      </div>
                                      {p.headline && (
                                        <p className="text-[10px] text-neutral-300 truncate mt-0.5 font-medium opacity-90">
                                          {p.headline}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Massage Therapist Section */}
                    {(() => {
                      const massageProfiles = profiles.filter(p => p.tribes.includes('Massage Therapist'));
                      const isExpanded = !!openSections.massage;
                      return (
                        <div className="w-full bg-[#141417]/90 border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all">
                          <button
                            type="button"
                            onClick={() => toggleSection('massage')}
                            className="w-full px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer group"
                            aria-expanded={isExpanded}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                                <Heart className="w-5 h-5 fill-emerald-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
                                    Massage Therapists
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                                    {massageProfiles.length}
                                  </span>
                                </div>
                                <p className="text-[11px] text-neutral-400 font-medium">
                                  {isExpanded ? 'Click to collapse section' : 'Click to drop down and view profiles'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-neutral-400 group-hover:text-white transition-colors hidden sm:inline">
                                {isExpanded ? 'Collapse' : 'Expand'}
                              </span>
                              <div className={`w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-emerald-500/20 border-emerald-400/40 text-emerald-300' : 'text-neutral-300'}`}>
                                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-3 sm:p-5 pt-0 border-t border-white/5 animate-in fade-in duration-200">
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-3.5">
                                {massageProfiles.map(p => (
                                  <div
                                    key={p.id}
                                    onClick={() => onSelectProfile(p)}
                                    className="group relative aspect-4/5 rounded-2xl overflow-hidden bg-neutral-900 border border-white/15 hover:border-emerald-400 transition-all duration-200 cursor-pointer shadow-md hover:scale-102 hover:shadow-xl hover:shadow-emerald-500/15"
                                  >
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

                                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-[9px] font-bold text-neutral-200">
                                      {p.distance}
                                    </div>

                                    <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 pointer-events-none">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${p.isOnline ? 'bg-[#00e676]' : 'bg-neutral-500'}`} />
                                        <span className="text-white font-extrabold text-xs sm:text-sm truncate drop-shadow-sm">
                                          {p.name}, {p.age}
                                        </span>
                                      </div>
                                      {p.headline && (
                                        <p className="text-[10px] text-neutral-300 truncate mt-0.5 font-medium opacity-90">
                                          {p.headline}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Desktop Active Chat Pane on right side if selected */}
              {activeChatProfile && (
                <div className="hidden lg:block w-96 xl:w-120 h-full border-l border-white/10 shrink-0">
                  <ChatView
                    profile={activeChatProfile}
                    messages={conversations[activeChatProfile.id]?.messages || []}
                    onSendMessage={onSendMessage}
                    onSendTap={onSendTap}
                    onSendExpiringPhoto={onSendExpiringPhoto}
                    onSendLocation={onSendLocation}
                    onExpireMessage={onExpireMessage}
                    onOpenBackendAccess={onOpenBackendAccess}
                    onClose={onCloseChat}
                    onViewProfile={() => onSelectProfile(activeChatProfile)}
                  />
                </div>
              )}
            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 3: SECURE PRIVATE CHAT WORKSPACE */}
          {/* ============================================================ */}
          {activeTab === 'messages' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Inbox / Conversations Sidebar */}
              <div className="w-full lg:w-84 xl:w-96 border-r border-white/10 flex flex-col bg-[#111114]">
                {/* Private Chat Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#ffce00]/20 text-[#ffce00]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                        <span>Private Chat</span>
                        <span className="px-1.5 py-0.2 bg-[#ffce00] text-black text-[9px] font-black rounded-full">
                          {Object.keys(conversations).length}
                        </span>
                      </h2>
                      <span className="text-[10px] text-neutral-400">Expiring media · Video · Taps</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowNewChatPicker(!showNewChatPicker)}
                    className="p-1.5 px-2.5 bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white rounded-xl border border-white/10 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Start new private chat"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#ffce00]" />
                    <span>New Chat</span>
                  </button>
                </div>

                {/* Quick New Chat Picker Dropdown */}
                {showNewChatPicker && (
                  <div className="p-3 bg-neutral-900 border-b border-white/10 animate-in slide-in-from-top-2 duration-150 shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold text-[#ffce00] uppercase tracking-wider">
                        Start Chat With Nearby Guy
                      </span>
                      <button
                        onClick={() => setShowNewChatPicker(false)}
                        className="text-neutral-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                      {visibleProfiles.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onOpenChat(p);
                            setShowNewChatPicker(false);
                          }}
                          className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#ffce00]/50 transition-all text-center group cursor-pointer"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="text-[10px] font-bold text-white truncate w-full">
                            {p.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Online Guys Bar */}
                <div className="px-3 py-2 border-b border-white/5 bg-black/20 shrink-0">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Online for Private Chat
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {visibleProfiles.slice(0, 8).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onOpenChat(p)}
                        className="flex flex-col items-center shrink-0 group cursor-pointer"
                        title={`Chat with ${p.name}`}
                      >
                        <div className="relative">
                          <img
                            src={p.image}
                            alt={p.name}
                            className={`w-10 h-10 rounded-full object-cover border-2 transition-transform group-hover:scale-105 ${
                              activeChatProfile?.id === p.id
                                ? 'border-[#ffce00]'
                                : 'border-transparent group-hover:border-white/40'
                            }`}
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00e676] border border-black" />
                        </div>
                        <span className="text-[9px] font-medium text-neutral-300 truncate max-w-10 mt-0.5">
                          {p.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversations List - All providers merged into same column */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {allMergedChats.map((prof) => {
                    const conv = conversations[prof.id];
                    const isSelected = activeChatProfile?.id === prof.id;
                    const lastMsg = conv?.lastMessage;
                    const hasMessages = Boolean(conv && Array.isArray(conv.messages) && conv.messages.length > 0);
                    const hasUnread = Boolean(conv && conv.unreadCount > 0);

                    return (
                      <div
                        key={prof.id}
                        onClick={() => onOpenChat(prof)}
                        className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#ffce00]/15 border border-[#ffce00]/40'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img
                            src={prof.image}
                            alt={prof.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#141416] ${
                              prof.isOnline ? 'bg-[#00e676]' : 'bg-neutral-500'
                            }`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="font-bold text-sm text-white truncate">{prof.name}</h4>
                            <span className={`text-[10px] ${hasUnread ? 'text-[#ffce00] font-bold' : 'text-neutral-400'}`}>
                              {hasMessages && lastMsg?.timestamp ? lastMsg.timestamp : prof.distance}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-300 truncate flex items-center gap-1">
                            {hasMessages ? (
                              lastMsg?.tapType ? (
                                <span className="text-[#ffce00] font-semibold flex items-center gap-1">
                                  <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                                  <span>Sent a tap</span>
                                </span>
                              ) : lastMsg?.mediaType === 'video' || lastMsg?.videoUrl ? (
                                <span className="text-[#ffce00] font-semibold flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  <span>Video clip {lastMsg?.text ? `· ${lastMsg.text}` : ''}</span>
                                </span>
                              ) : lastMsg?.mediaType === 'image' || lastMsg?.imageUrl ? (
                                <span className="text-white font-medium flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3 text-[#ffce00]" />
                                  <span>{lastMsg?.isExpiring ? 'View-once photo' : 'Photo'}</span>
                                </span>
                              ) : lastMsg?.isAudio ? (
                                <span className="text-neutral-300 flex items-center gap-1">
                                  <Volume2 className="w-3 h-3 text-[#ffce00]" />
                                  <span>Voice note ({lastMsg?.audioDuration || '0:14'})</span>
                                </span>
                              ) : (
                                <span>{lastMsg?.text}</span>
                              )
                            ) : (
                              <span className="text-neutral-500 italic">
                                {prof.headline || 'Tap to chat'}
                              </span>
                            )}
                          </p>
                        </div>

                        {hasUnread && (
                          <span className="w-5 h-5 rounded-full bg-[#ffce00] text-black font-black text-[10px] flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chat View in Messages tab (Desktop Pane) */}
              <div className="hidden lg:flex flex-1 h-full">
                {activeChatProfile ? (
                  <ChatView
                    profile={activeChatProfile}
                    messages={conversations[activeChatProfile.id]?.messages || []}
                    isTyping={Boolean(isTyping?.[activeChatProfile.id])}
                    onSendMessage={onSendMessage}
                    onSendTap={onSendTap}
                    onSendExpiringPhoto={onSendExpiringPhoto}
                    onSendLocation={onSendLocation}
                    onExpireMessage={onExpireMessage}
                    onOpenBackendAccess={onOpenBackendAccess}
                    onMarkConversationAsRead={onMarkConversationAsRead}
                    onClose={onCloseChat}
                    onViewProfile={() => onSelectProfile(activeChatProfile)}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 bg-[#0d0d0f]">
                    <div className="w-16 h-16 rounded-3xl bg-[#ffce00]/10 border border-[#ffce00]/30 flex items-center justify-center text-[#ffce00] mb-4">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-white">Private Chat Room</h3>
                    <p className="text-xs text-neutral-400 max-w-sm mt-1 mb-6">
                      Select a conversation on the left or tap below to start exchanging private photos, videos, view-once media, and taps.
                    </p>
                    <div className="flex items-center gap-3">
                      {visibleProfiles.slice(0, 3).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => onOpenChat(p)}
                          className="px-4 py-2 bg-white/10 hover:bg-[#ffce00] hover:text-black rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <img src={p.image} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
                          <span>Chat with {p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: MY PROFILE */}
          {/* ============================================================ */}
          {activeTab === 'profile' && (
            <div className="flex-1 overflow-y-auto p-6 max-w-xl mx-auto w-full">
              <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-neutral-800 border-2 border-[#ffce00] flex items-center justify-center text-3xl font-black text-[#ffce00]">
                    {myProfile.name.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      {myProfile.name}, {myProfile.age}
                    </h2>
                    <p className="text-xs text-[#ffce00] font-semibold mt-0.5">
                      {myProfile.headline || 'No headline set'}
                    </p>
                    <span className="text-[11px] text-neutral-400 block mt-1">
                      Online Now
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white/3 rounded-2xl border border-white/5 space-y-2 text-xs">
                  <h4 className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">
                    About Me
                  </h4>
                  <p className="text-neutral-200">
                    {myProfile.bio || 'Add a bio describing yourself and what you are looking for.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={onOpenMyProfile}
                    className="w-full py-3 bg-[#ffce00] hover:bg-[#ebd200] text-black font-extrabold text-sm rounded-2xl shadow transition-transform active:scale-98"
                  >
                    Edit Profile & Photos
                  </button>
                  <button
                    onClick={onOpenUnlimited}
                    className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#ffce00]" />
                    <span>Manage Grindr Unlimited</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {/* ============================================================ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#141416]/95 backdrop-blur-md border-t border-white/10 flex items-center justify-around py-2 px-1">
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl ${
            activeTab === 'grid' ? 'text-[#ffce00]' : 'text-neutral-400'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-bold">Nearby</span>
        </button>


        <button
          onClick={() => setActiveTab('messages')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl relative ${
            activeTab === 'messages' ? 'text-[#ffce00]' : 'text-neutral-400'
          }`}
          title="Secure Private Chat"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 border border-white/20">
              <Lock className="w-2 h-2 text-[#ffce00]" />
            </span>
            {totalUnread > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#ffce00] text-black font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalUnread}
              </span>
            )}
          </div>
          <span className="text-[9px] font-extrabold tracking-tight">Private Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl ${
            activeTab === 'favorites' ? 'text-[#ffce00]' : 'text-neutral-400'
          }`}
        >
          <Star className="w-5 h-5" />
          <span className="text-[10px] font-bold">Starred</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl ${
            activeTab === 'profile' ? 'text-[#ffce00]' : 'text-neutral-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>

      {/* Mobile Full Screen Chat Screen overlay */}
      {activeChatProfile && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#121214]">
            <ChatView
              profile={activeChatProfile}
              messages={conversations[activeChatProfile.id]?.messages || []}
              isTyping={Boolean(isTyping?.[activeChatProfile.id])}
              onSendMessage={onSendMessage}
              onSendTap={onSendTap}
              onSendExpiringPhoto={onSendExpiringPhoto}
              onSendLocation={onSendLocation}
              onExpireMessage={onExpireMessage}
              onOpenBackendAccess={onOpenBackendAccess}
              onMarkConversationAsRead={onMarkConversationAsRead}
              onClose={onCloseChat}
              onViewProfile={() => onSelectProfile(activeChatProfile)}
            />
        </div>
      )}
    </div>
  );
};
