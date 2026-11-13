import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, ArrowLeft, Flame, Image as ImageIcon,
  MapPin, Mic, Video, Eye, Lock, Check, CheckCheck, Play, Pause,
  Upload, Shield
} from 'lucide-react';
import { Profile, ChatMessage, TapType } from '../types';
import { MediaViewerModal } from './MediaViewerModal';
import { broadcastChatEvent } from '../utils/chatSync';

interface ChatViewProps {
  profile: Profile;
  messages: ChatMessage[];
  isTyping?: boolean;
  onSendMessage: (profileId: string, text: string, options?: Partial<ChatMessage>) => void;
  onSendTap: (profile: Profile, tap: TapType) => void;
  onSendExpiringPhoto: (profileId: string) => void;
  onSendLocation: (profileId: string) => void;
  onClose: () => void;
  onViewProfile?: () => void;
  onExpireMessage?: (messageId: string) => void;
  onOpenBackendAccess?: () => void;
  onMarkConversationAsRead?: (profileId: string, byRole: 'visitor' | 'escort') => void;
}

// Curated stock photo presets for instant sharing
const PRESET_PHOTOS = [
  {
    title: 'Gym Workout Selfie',
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
    caption: 'Post-workout pump 💪',
  },
  {
    title: 'Rooftop Sunset',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    caption: 'Golden hour sunset 🌅',
  },
  {
    title: 'Espresso Bar',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    caption: 'Fuel for the afternoon ☕',
  },
  {
    title: 'Poolside Vibe',
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80',
    caption: 'Relaxing afternoon by the pool 🏊',
  },
];

// Curated stock video clips for instant sharing
const PRESET_VIDEOS = [
  {
    title: 'Gym Workout Set',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '0:15',
    caption: 'Finishing the last superset 🔥',
  },
  {
    title: 'Sunset Panorama',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: '0:12',
    caption: 'Look at this sky tonight! 🌇',
  },
  {
    title: 'Night Walk',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    duration: '0:10',
    caption: 'City night lights ✨',
  },
  {
    title: 'Espresso & Chill',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    duration: '0:14',
    caption: 'Weekend coffee vibes ☕',
  },
];

export const ChatView: React.FC<ChatViewProps> = ({
  profile,
  messages = [],
  isTyping = false,
  onSendMessage,
  onSendTap,
  onSendExpiringPhoto,
  onSendLocation,
  onClose,
  onViewProfile,
  onExpireMessage,
  onOpenBackendAccess,
  onMarkConversationAsRead,
}) => {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const [inputText, setInputText] = useState('');

  // Media drawers
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showVideoPicker, setShowVideoPicker] = useState(false);
  const [mediaCaption, setMediaCaption] = useState('');
  const [isViewOnceChecked, setIsViewOnceChecked] = useState(false);

  // Fullscreen Viewer for image / video / view-once
  const [selectedViewerMessage, setSelectedViewerMessage] = useState<ChatMessage | null>(null);

  // Voice note simulation playing state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [safeMessages]);

  // When visitor opens this chat, mark incoming messages as read
  useEffect(() => {
    if (onMarkConversationAsRead) {
      onMarkConversationAsRead(profile.id, 'visitor');
    }
  }, [profile.id]);

  // Handle visitor text submit
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');
    
    // Stop typing indicator on send
    broadcastChatEvent({ type: 'TYPING', profileId: profile.id, senderRole: 'visitor', isTyping: false });

    // Sent cleanly as visitor ('me')
    onSendMessage(profile.id, text, {
      senderId: 'me',
    });
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    broadcastChatEvent({ 
      type: 'TYPING', 
      profileId: profile.id, 
      senderRole: 'visitor', 
      isTyping: text.length > 0 
    });
  };

  // Handle local image file upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onSendMessage(profile.id, mediaCaption.trim() || (isViewOnceChecked ? 'Expiring Photo (View Once)' : 'Photo'), {
          senderId: 'me',
          mediaType: 'image',
          imageUrl: dataUrl,
          isExpiring: isViewOnceChecked,
          viewOnceSeconds: 10,
        });
        setShowImagePicker(false);
        setMediaCaption('');
        setIsViewOnceChecked(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle preset photo selection
  const handleSelectPresetPhoto = (preset: typeof PRESET_PHOTOS[0]) => {
    onSendMessage(profile.id, mediaCaption.trim() || preset.caption, {
      senderId: 'me',
      mediaType: 'image',
      imageUrl: preset.url,
      isExpiring: isViewOnceChecked,
      viewOnceSeconds: 10,
    });
    setShowImagePicker(false);
    setMediaCaption('');
    setIsViewOnceChecked(false);
  };

  // Handle local video file upload
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const videoUrl = URL.createObjectURL(file);
    onSendMessage(profile.id, mediaCaption.trim() || (isViewOnceChecked ? 'Expiring Video (View Once)' : 'Video clip'), {
      senderId: 'me',
      mediaType: 'video',
      videoUrl,
      videoDuration: '0:10',
      isExpiring: isViewOnceChecked,
      viewOnceSeconds: 10,
    });
    setShowVideoPicker(false);
    setMediaCaption('');
    setIsViewOnceChecked(false);
  };

  // Handle preset video selection
  const handleSelectPresetVideo = (preset: typeof PRESET_VIDEOS[0]) => {
    onSendMessage(profile.id, mediaCaption.trim() || preset.caption, {
      senderId: 'me',
      mediaType: 'video',
      videoUrl: preset.url,
      videoDuration: preset.duration,
      isExpiring: isViewOnceChecked,
      viewOnceSeconds: 10,
    });
    setShowVideoPicker(false);
    setMediaCaption('');
    setIsViewOnceChecked(false);
  };

  // Send simulated voice note
  const handleSendVoiceNote = () => {
    onSendMessage(profile.id, 'Voice message (0:14)', {
      senderId: 'me',
      mediaType: 'audio',
      isAudio: true,
      audioDuration: '0:14',
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f] border-l border-white/10 select-none relative overflow-hidden">
      {/* ============================================================ */}
      {/* 1. TOP HEADER (NORMAL CHAT HEADER) */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-[#141416] border-b border-white/10 shrink-0 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={onClose} 
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors md:hidden shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button 
            onClick={onViewProfile}
            className="flex items-center gap-2.5 text-left group hover:opacity-90 transition-opacity min-w-0"
          >
            <div className="relative shrink-0">
              <img
                src={profile.image}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
              <span 
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#141416] ${
                  profile.isOnline ? 'bg-[#00e676]' : 'bg-neutral-500'
                }`} 
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-extrabold text-white text-sm group-hover:text-[#ffce00] transition-colors truncate">
                  {profile.name}, {profile.age}
                </span>
                <span className="px-1.5 py-0.2 bg-[#ffce00]/20 text-[#ffce00] text-[9px] font-black rounded border border-[#ffce00]/40 shrink-0">
                  PRIVATE
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 block truncate">
                {profile.isOnline ? 'Active now' : profile.lastActive} · {profile.distance}
              </span>
            </div>
          </button>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Discreet Backend Access Button for the Operator/Admin */}
          {onOpenBackendAccess && (
            <button
              onClick={onOpenBackendAccess}
              className="px-2.5 py-1 text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Secured Admin Login & Dispatch Desk: Reply to client in absence of provider"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin Dispatch</span>
            </button>
          )}

          {onViewProfile && (
            <button
              onClick={onViewProfile}
              className="px-2.5 py-1 text-xs font-semibold bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl border border-white/10 hidden sm:block"
            >
              Profile
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors hidden md:block cursor-pointer"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MESSAGES HISTORY (NORMAL CHAT FLOW) */}
      {/* ============================================================ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Encrypted Session Banner */}
        <div className="bg-[#18181c] border border-white/10 rounded-2xl p-3 text-center text-xs text-neutral-300 shadow-sm max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-1.5 text-[#ffce00] font-bold text-[11px] mb-0.5">
            <Lock className="w-3.5 h-3.5" />
            <span>End-to-End Encrypted Private Chat</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Messages, taps, and media are securely transmitted between you and {profile.name}.
          </p>
        </div>

        {/* Messages */}
        {safeMessages.map((msg) => {
          const isMe = msg.senderId === 'me';
          const senderName = isMe ? 'You' : profile.name;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full group`}
            >
              <span className="text-[10px] font-bold text-neutral-500 mb-0.5 px-1">
                {senderName}
              </span>

              {/* TAP MESSAGE */}
              {msg.tapType ? (
                <div
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm ${
                    isMe
                      ? 'bg-[#ffce00]/20 text-[#ffce00] border border-[#ffce00]/30 rounded-br-xs'
                      : 'bg-white/10 text-white border border-white/10 rounded-bl-xs'
                  }`}
                >
                  {msg.tapType === 'flame' && <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />}
                  {msg.tapType === 'devil' && <span>😈</span>}
                  {msg.tapType === 'wave' && <span>👋</span>}
                  {msg.tapType === 'water' && <span>💦</span>}
                  {msg.tapType === 'coffee' && <span>☕</span>}
                  <span>
                    {isMe ? 'You sent a tap' : `${profile.name} sent a tap`}
                  </span>
                </div>
              ) : msg.isExpiring && msg.isExpired ? (
                /* EXPIRED VIEW-ONCE */
                <div className="px-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-700 text-neutral-400 text-xs font-medium flex items-center gap-2 max-w-xs opacity-75">
                  <Eye className="w-4 h-4 text-neutral-500" />
                  <div>
                    <p className="font-bold">🔥 {msg.mediaType === 'video' ? 'Video Expired' : 'Photo Expired'}</p>
                    <p className="text-[10px]">Opened & vanished</p>
                  </div>
                </div>
              ) : msg.isExpiring ? (
                /* ACTIVE VIEW-ONCE */
                <button
                  onClick={() => setSelectedViewerMessage(msg)}
                  className={`p-3.5 rounded-2xl text-xs flex items-center gap-3 max-w-xs transition-transform active:scale-95 shadow-md cursor-pointer ${
                    isMe
                      ? 'bg-gradient-to-r from-[#ffce00] to-amber-400 text-black font-extrabold rounded-br-xs'
                      : 'bg-gradient-to-r from-neutral-800 to-neutral-900 text-white border border-white/20 rounded-bl-xs hover:border-[#ffce00]/50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center shrink-0">
                    <Eye className="w-5 h-5 text-current animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <span>{msg.mediaType === 'video' ? '🎥 View-Once Video' : '📸 View-Once Photo'}</span>
                      <span className="text-[9px] px-1 bg-black/20 rounded">10s</span>
                    </div>
                    <p className="text-[10px] opacity-85 mt-0.5">Tap to view before it vanishes</p>
                  </div>
                </button>
              ) : msg.mediaType === 'video' || msg.videoUrl ? (
                /* VIDEO */
                <div
                  className={`rounded-2xl overflow-hidden max-w-xs sm:max-w-sm border shadow-lg ${
                    isMe
                      ? 'border-[#ffce00]/40 bg-[#1e1e24] rounded-br-xs'
                      : 'border-white/10 bg-[#1a1a1e] rounded-bl-xs'
                  }`}
                >
                  <div className="relative group/video cursor-pointer" onClick={() => setSelectedViewerMessage(msg)}>
                    <video
                      src={msg.videoUrl}
                      className="w-full h-44 object-cover bg-black"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/video:bg-black/20 transition-colors">
                      <div className="w-11 h-11 rounded-full bg-[#ffce00] text-black flex items-center justify-center shadow-lg transform group-hover/video:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                      </div>
                    </div>
                    {msg.videoDuration && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-bold rounded-md">
                        {msg.videoDuration}
                      </span>
                    )}
                  </div>
                  {msg.text && (
                    <div className="p-3 text-xs text-white">
                      {msg.text}
                    </div>
                  )}
                </div>
              ) : msg.mediaType === 'image' || msg.imageUrl ? (
                /* IMAGE */
                <div
                  className={`rounded-2xl overflow-hidden max-w-xs sm:max-w-sm border shadow-lg cursor-pointer ${
                    isMe
                      ? 'border-[#ffce00]/40 bg-[#1e1e24] rounded-br-xs'
                      : 'border-white/10 bg-[#1a1a1e] rounded-bl-xs'
                  }`}
                  onClick={() => setSelectedViewerMessage(msg)}
                >
                  <img
                    src={msg.imageUrl}
                    alt="Shared"
                    referrerPolicy="no-referrer"
                    className="w-full max-h-60 object-cover hover:opacity-95 transition-opacity"
                  />
                  {msg.text && (
                    <div className="p-3 text-xs text-white">
                      {msg.text}
                    </div>
                  )}
                </div>
              ) : msg.isAudio ? (
                /* VOICE NOTE */
                <div
                  className={`p-3 rounded-2xl flex items-center gap-3 w-56 sm:w-64 shadow-md ${
                    isMe
                      ? 'bg-[#ffce00] text-black font-semibold rounded-br-xs'
                      : 'bg-[#222226] text-white border border-white/10 rounded-bl-xs'
                  }`}
                >
                  <button
                    onClick={() => {
                      setPlayingAudioId(playingAudioId === msg.id ? null : msg.id);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${
                      isMe ? 'bg-black text-[#ffce00]' : 'bg-[#ffce00] text-black'
                    }`}
                  >
                    {playingAudioId === msg.id ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-0.5 h-5 mb-1">
                      {[40, 75, 55, 90, 60, 100, 45, 80, 65, 95, 50, 70].map((h, i) => (
                        <span
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            isMe ? 'bg-black' : 'bg-[#ffce00]'
                          } ${playingAudioId === msg.id ? 'animate-pulse' : 'opacity-70'}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] opacity-80">
                      <span>Voice note</span>
                      <span>{msg.audioDuration || '0:14'}</span>
                    </div>
                  </div>
                </div>
              ) : msg.isLocation ? (
                /* LOCATION PIN */
                <div
                  className={`p-3 rounded-2xl text-xs flex items-center gap-3 max-w-xs shadow-md ${
                    isMe
                      ? 'bg-[#ffce00] text-black font-bold rounded-br-xs'
                      : 'bg-neutral-800 text-white border border-white/10 rounded-bl-xs'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isMe ? 'bg-black/15 text-black' : 'bg-[#ffce00] text-black'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold block">Location Shared</span>
                    <span className="text-[11px] opacity-85">{msg.locationName || 'Nearby Location'}</span>
                  </div>
                </div>
              ) : (
                /* STANDARD TEXT */
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[85%] break-words shadow-sm ${
                    isMe
                      ? 'bg-[#ffce00] text-black font-semibold rounded-br-xs'
                      : 'bg-[#222226] text-white border border-white/5 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              )}

              {/* Timestamp & Read / Delivered Status */}
              <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px]">
                <span className="text-neutral-500">{msg.timestamp}</span>
                {isMe && (
                  <div className="flex items-center gap-1">
                    <span className="text-neutral-600">·</span>
                    {msg.read || msg.deliveryStatus === 'read' ? (
                      <span className="flex items-center gap-0.5 text-[#ffce00] font-bold">
                        <CheckCheck className="w-3.5 h-3.5 text-[#ffce00]" />
                        <span>Read</span>
                        {msg.readAt && (
                          <span className="opacity-75 font-normal ml-0.5">· {msg.readAt}</span>
                        )}
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-neutral-400 font-medium">
                        <Check className="w-3 h-3 text-neutral-400" />
                        <span>Delivered</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
        
        {/* Typing Indicator */}
        <div className={`px-4 py-1 text-xs text-neutral-500 transition-opacity duration-300 ${isTyping ? 'opacity-100' : 'opacity-0'}`}>
          {profile.name} is typing...
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MEDIA SHARING DRAWERS */}
      {/* ============================================================ */}

      {/* PHOTO SHARING DRAWER */}
      {showImagePicker && (
        <div className="p-4 bg-[#161618] border-t border-white/10 shadow-2xl animate-in slide-in-from-bottom-2 duration-150 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#ffce00]" />
              <span className="font-extrabold text-sm text-white">Share Photo with {profile.name}</span>
            </div>
            <button
              onClick={() => setShowImagePicker(false)}
              className="p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <label className="flex items-center gap-2 mb-3 px-3 py-2 bg-black/40 rounded-xl border border-white/10 cursor-pointer">
            <input
              type="checkbox"
              checked={isViewOnceChecked}
              onChange={(e) => setIsViewOnceChecked(e.target.checked)}
              className="accent-[#ffce00] w-4 h-4 rounded"
            />
            <Eye className="w-4 h-4 text-[#ffce00]" />
            <span className="text-xs font-bold text-white">Send as Expiring View-Once (Burns in 10s)</span>
          </label>

          <div className="mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 text-[#ffce00]" />
              <span>Upload Custom Photo from Device</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Or Choose Preset Photo:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_PHOTOS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPresetPhoto(preset)}
                  className="relative group rounded-xl overflow-hidden border border-white/10 hover:border-[#ffce00] transition-colors text-left"
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    className="w-full h-16 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="p-1 bg-black/80 text-[10px] font-bold text-white truncate">
                    {preset.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIDEO SHARING DRAWER */}
      {showVideoPicker && (
        <div className="p-4 bg-[#161618] border-t border-white/10 shadow-2xl animate-in slide-in-from-bottom-2 duration-150 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#ffce00]" />
              <span className="font-extrabold text-sm text-white">Share Video Clip</span>
            </div>
            <button
              onClick={() => setShowVideoPicker(false)}
              className="p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <label className="flex items-center gap-2 mb-3 px-3 py-2 bg-black/40 rounded-xl border border-white/10 cursor-pointer">
            <input
              type="checkbox"
              checked={isViewOnceChecked}
              onChange={(e) => setIsViewOnceChecked(e.target.checked)}
              className="accent-[#ffce00] w-4 h-4 rounded"
            />
            <Eye className="w-4 h-4 text-[#ffce00]" />
            <span className="text-xs font-bold text-white">Send as Expiring View-Once Video (Watch 1x)</span>
          </label>

          <div className="mb-3">
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoFileUpload}
              className="hidden"
            />
            <button
              onClick={() => videoInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 text-[#ffce00]" />
              <span>Upload Video File from Device</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Or Choose Curated Video Clip:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_VIDEOS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPresetVideo(preset)}
                  className="relative group rounded-xl overflow-hidden border border-white/10 hover:border-[#ffce00] transition-colors text-left bg-black p-2"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Play className="w-3.5 h-3.5 text-[#ffce00] fill-[#ffce00]" />
                    <span className="text-[11px] font-bold text-white truncate">{preset.title}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 block">{preset.duration} · MP4</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. QUICK TAPS & MEDIA ACCESS BAR */}
      {/* ============================================================ */}
      <div className="px-4 py-2 bg-[#18181b]/90 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto shrink-0">
        <span className="text-[11px] text-neutral-400 font-bold mr-1 shrink-0">Tap:</span>
        <button
          onClick={() => onSendTap(profile, 'flame')}
          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white flex items-center gap-1 shrink-0 active:scale-95 transition-all cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          <span>Flame</span>
        </button>
        <button
          onClick={() => onSendTap(profile, 'devil')}
          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white flex items-center gap-1 shrink-0 active:scale-95 transition-all cursor-pointer"
        >
          <span>😈 Looking</span>
        </button>
        <button
          onClick={() => onSendTap(profile, 'wave')}
          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white flex items-center gap-1 shrink-0 active:scale-95 transition-all cursor-pointer"
        >
          <span>👋 Wave</span>
        </button>
        <button
          onClick={() => onSendTap(profile, 'coffee')}
          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white flex items-center gap-1 shrink-0 active:scale-95 transition-all cursor-pointer"
        >
          <span>☕ Coffee</span>
        </button>

        {/* Media Buttons on Right */}
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              setShowImagePicker(!showImagePicker);
              setShowVideoPicker(false);
            }}
            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer ${
              showImagePicker
                ? 'bg-[#ffce00] text-black border-[#ffce00]'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
            }`}
            title="Share image or view-once photo"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Photo</span>
          </button>

          <button
            onClick={() => {
              setShowVideoPicker(!showVideoPicker);
              setShowImagePicker(false);
            }}
            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer ${
              showVideoPicker
                ? 'bg-[#ffce00] text-black border-[#ffce00]'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
            }`}
            title="Share video clip"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Video</span>
          </button>

          <button
            onClick={handleSendVoiceNote}
            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Send voice note"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSendLocation(profile.id)}
            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Send current location pin"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. MESSAGE INPUT FORM (NORMAL USER CHAT INPUT) */}
      {/* ============================================================ */}
      <form onSubmit={handleSend} className="p-3 bg-[#141416] border-t border-white/10 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={`Message ${profile.name}...`}
          className="flex-1 bg-black/40 text-white placeholder-neutral-500 text-sm px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#ffce00] transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-4 py-2.5 bg-[#ffce00] disabled:bg-neutral-800 disabled:text-neutral-600 text-black rounded-xl font-black text-xs transition-all disabled:opacity-50 hover:bg-[#e6ba00] active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
          aria-label="Send"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5 fill-current" />
        </button>
      </form>

      {/* Fullscreen Media Viewer Modal */}
      {selectedViewerMessage && (
        <MediaViewerModal
          message={selectedViewerMessage}
          profile={profile}
          onClose={() => setSelectedViewerMessage(null)}
          onExpire={(msgId) => {
            if (onExpireMessage) {
              onExpireMessage(msgId);
            }
          }}
        />
      )}
    </div>
  );
};
