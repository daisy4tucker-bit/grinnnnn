import React, { useState } from 'react';
import { 
  X, MessageSquare, Flame, Sparkles, Heart, Star, 
  MapPin, ShieldCheck, Check, Volume2, Play, Pause,
  Instagram, Music, Share2, Info, Flag, ShieldAlert, ArrowLeft, AlertTriangle,
  ChevronLeft, ChevronRight, Images, Video
} from 'lucide-react';
import { Profile, TapType } from '../types';

interface ProfileModalProps {
  profile: Profile | null;
  onClose: () => void;
  onStartChat: (profile: Profile) => void;
  onSendTap: (profile: Profile, tap: TapType) => void;
  onToggleFavorite: (profileId: string) => void;
  onBlockProfile: (profileId: string) => void;
  onReportProfile?: (profileId: string, reason: string, details?: string, autoBlock?: boolean) => void;
}

const REPORT_REASONS = [
  { id: 'underage', label: 'Underage or Minor Concern', desc: 'Anyone under 18 is strictly prohibited on Grindr' },
  { id: 'harassment', label: 'Harassment, Hate Speech or Bullying', desc: 'Threats, abusive language, or discrimination' },
  { id: 'nudity', label: 'Inappropriate Photos or Content', desc: 'Prohibited public nudity, non-consensual media, or violence' },
  { id: 'scam', label: 'Spam, Commercial Advertising or Scam', desc: 'Phishing links, selling services, or fraudulent requests' },
  { id: 'impersonation', label: 'Impersonation or Stolen Pictures', desc: 'Pretending to be someone else or using celebrity photos' },
  { id: 'solicitation', label: 'Illegal Substances or Solicitation', desc: 'Buying/selling controlled items or illegal services' },
  { id: 'other', label: 'Other Guideline Violation', desc: 'Behavior that makes the community unsafe' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onClose,
  onStartChat,
  onSendTap,
  onToggleFavorite,
  onBlockProfile,
  onReportProfile,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [tapSentMessage, setTapSentMessage] = useState<string | null>(null);

  // Reporting State
  const [isReporting, setIsReporting] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0].id);
  const [reportDetails, setReportDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!profile) return null;

  const handleTap = (type: TapType) => {
    onSendTap(profile, type);
    const tapLabels: Record<TapType, string> = {
      flame: 'Flame sent 🔥',
      devil: 'Looking sent 😈',
      wave: 'Wave sent 👋',
      water: 'Water sent 💦',
      coffee: 'Coffee sent ☕',
    };
    setTapSentMessage(tapLabels[type]);
    setTimeout(() => setTapSentMessage(null), 2500);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonObj = REPORT_REASONS.find((r) => r.id === selectedReason);
    const reasonLabel = reasonObj?.label || selectedReason;

    if (onReportProfile) {
      onReportProfile(profile.id, reasonLabel, reportDetails.trim(), alsoBlock);
    }

    if (alsoBlock) {
      onBlockProfile(profile.id);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2400);
  };

  const albumPhotos = profile.album && profile.album.length > 0 ? profile.album : [profile.image];
  const mediaItems: Array<{
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    duration?: string;
  }> = [
    ...albumPhotos.map((url) => ({
      type: 'image' as const,
      url,
    })),
    ...(profile.videoUrl
      ? [
          {
            type: 'video' as const,
            url: profile.videoUrl,
            thumbnail: profile.videoThumbnail || profile.image,
            duration: profile.videoDuration || '0:06',
          },
        ]
      : []),
  ];
  const currentMedia = mediaItems[activePhotoIdx] || mediaItems[0] || { type: 'image' as const, url: profile.image };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#141416] border border-white/10 rounded-none md:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[100dvh] md:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================ */}
        {/* REPORT FORM VIEW */}
        {/* ============================================================ */}
        {isReporting ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-[#18181c] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {!isSubmitted && (
                  <button
                    onClick={() => setIsReporting(false)}
                    className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Back to profile"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-extrabold text-white">
                    Report {profile.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {isSubmitted ? (
                <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black text-white">Report Submitted</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Thank you for keeping Grindr safe. Our safety and moderation team has received your report regarding <strong>{profile.name}</strong> and will review their profile and activity within 24 hours.
                  </p>
                  {alsoBlock && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
                      ✓ {profile.name} has also been blocked and can no longer contact you.
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-[#ffce00] hover:bg-[#e6ba00] text-black font-extrabold text-xs rounded-xl shadow transition-transform active:scale-95"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-5">
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-neutral-200 leading-relaxed">
                      <p className="font-bold text-amber-300 mb-0.5">Community Safety Notice</p>
                      Your report is anonymous. The user will not know who reported them. Select the reason that best describes the issue:
                    </div>
                  </div>

                  {/* Reasons Radio list */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                      Reason for Report
                    </label>
                    <div className="space-y-2">
                      {REPORT_REASONS.map((reason) => {
                        const isSelected = selectedReason === reason.id;
                        return (
                          <label
                            key={reason.id}
                            className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm'
                                : 'bg-white/3 border-white/5 hover:bg-white/5 text-neutral-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="reportReason"
                              value={reason.id}
                              checked={isSelected}
                              onChange={() => setSelectedReason(reason.id)}
                              className="accent-amber-400 mt-1"
                            />
                            <div className="flex-1">
                              <span className="text-xs font-bold block text-white">
                                {reason.label}
                              </span>
                              <span className="text-[11px] text-neutral-400 block mt-0.5">
                                {reason.desc}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional details */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      placeholder="Provide any additional context or describe what was violated..."
                      className="w-full bg-black/50 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                    />
                  </div>

                  {/* Auto block checkbox */}
                  <label className="flex items-center gap-2.5 p-3 bg-white/3 rounded-xl border border-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alsoBlock}
                      onChange={(e) => setAlsoBlock(e.target.checked)}
                      className="accent-amber-400 w-4 h-4 rounded"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-white block">
                        Also block {profile.name}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        They will be removed from your grid and unable to send you messages
                      </span>
                    </div>
                  </label>

                  {/* Submit actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReporting(false)}
                      className="px-4 py-2.5 text-xs font-bold text-neutral-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5 fill-current" />
                      <span>Submit Report</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* STANDARD PROFILE VIEW */
          /* ============================================================ */
          <>
            {/* Sticky Header with Close button & Profile Name */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#141416]/90 backdrop-blur-md border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${profile.isOnline ? 'bg-[#00e676]' : 'bg-neutral-500'}`} />
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  {profile.name}, {profile.age}
                </h2>
                <span className="text-xs text-neutral-400 font-medium">· {profile.distance}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Report icon in header */}
                <button
                  onClick={() => setIsReporting(true)}
                  className="p-2 text-neutral-400 hover:text-amber-400 hover:bg-white/10 rounded-full transition-colors"
                  title="Report Profile"
                >
                  <Flag className="w-4 h-4" />
                </button>

                {/* Favorite */}
                <button
                  onClick={() => onToggleFavorite(profile.id)}
                  className={`p-2 rounded-full transition-colors ${
                    profile.isFavorite 
                      ? 'text-[#ffce00] bg-[#ffce00]/15' 
                      : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={profile.isFavorite ? 'Favorited' : 'Add to Favorites'}
                >
                  <Star className={`w-5 h-5 ${profile.isFavorite ? 'fill-[#ffce00]' : ''}`} />
                </button>

                {/* Close */}
                <button 
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              {/* Main Photo / Video Gallery */}
              <div className="relative aspect-square sm:aspect-4/3 w-full bg-black overflow-hidden group">
                {currentMedia.type === 'video' ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <video
                      key={currentMedia.url}
                      src={currentMedia.url}
                      poster={currentMedia.thumbnail}
                      autoPlay
                      loop
                      playsInline
                      controls
                      className="w-full h-full object-contain sm:object-cover"
                    />
                  </div>
                ) : (
                  <img 
                    src={currentMedia.url} 
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Media navigation bars if multiple */}
                {mediaItems.length > 1 && (
                  <>
                    <div className="absolute top-3 left-4 right-4 flex gap-1.5 z-20">
                      {mediaItems.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePhotoIdx(idx);
                          }}
                          className={`h-1 flex-1 rounded-full transition-all cursor-pointer ${
                            activePhotoIdx === idx
                              ? item.type === 'video'
                                ? 'bg-[#ffce00] h-1.5 shadow'
                                : 'bg-white h-1.5 shadow'
                              : 'bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Media ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Counter Badge */}
                    <div className="absolute top-7 right-4 z-20 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[10px] font-extrabold text-white flex items-center gap-1 border border-white/20">
                      {currentMedia.type === 'video' ? (
                        <>
                          <Video className="w-3 h-3 text-[#ffce00]" />
                          <span className="text-[#ffce00]">Video</span>
                        </>
                      ) : (
                        <Images className="w-3 h-3 text-[#ffce00]" />
                      )}
                      <span>{activePhotoIdx + 1} / {mediaItems.length}</span>
                    </div>

                    {/* Left Tap Zone & Arrow */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
                      }}
                      className="absolute inset-y-0 left-0 w-1/4 z-10 flex items-center justify-start pl-3 text-white/70 hover:text-white transition-opacity group/nav cursor-pointer"
                      aria-label="Previous media"
                    >
                      <span className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover/nav:scale-110 transition-all">
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </span>
                    </button>

                    {/* Right Tap Zone & Arrow */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIdx((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute inset-y-0 right-0 w-1/4 z-10 flex items-center justify-end pr-3 text-white/70 hover:text-white transition-opacity group/nav cursor-pointer"
                      aria-label="Next media"
                    >
                      <span className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover/nav:scale-110 transition-all">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </span>
                    </button>
                  </>
                )}

                {/* Tap Alert Banner */}
                {tapSentMessage && (
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-md border border-[#ffce00]/40 text-[#ffce00] text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2">
                    {tapSentMessage}
                  </div>
                )}

                {/* Bottom Overlay on Photo */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between pointer-events-none">
                  <div>
                    <h3 className="text-2xl font-black text-white drop-shadow-md">
                      {profile.name}, {profile.age}
                    </h3>
                    <p className="text-sm text-neutral-200 drop-shadow flex items-center gap-1 mt-0.5">
                      <span className="font-semibold text-[#ffce00]">{profile.distance}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Album Media Thumbnails Strip */}
              {mediaItems.length > 1 && (
                <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-white/5 bg-[#121214]/60 flex items-center gap-3 overflow-x-auto">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                    <Images className="w-3.5 h-3.5 text-[#ffce00]" />
                    <span>Album ({mediaItems.length})</span>
                  </span>
                  <div className="flex items-center gap-2.5 pb-1">
                    {mediaItems.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhotoIdx(idx)}
                        className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          activePhotoIdx === idx
                            ? 'border-[#ffce00] scale-105 shadow-md shadow-[#ffce00]/20 ring-2 ring-[#ffce00]/40'
                            : 'border-white/15 opacity-65 hover:opacity-100 hover:border-white/30'
                        }`}
                      >
                        {item.type === 'video' ? (
                          <>
                            <img
                              src={item.thumbnail}
                              alt={`${profile.name} video`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="w-5 h-5 rounded-full bg-[#ffce00] text-black flex items-center justify-center shadow">
                                <Play className="w-3 h-3 fill-black ml-0.5" />
                              </span>
                            </div>
                            <span className="absolute bottom-0 inset-x-0 bg-[#ffce00] text-[8px] font-black text-center text-black py-0.2">
                              Video
                            </span>
                          </>
                        ) : (
                          <>
                            <img
                              src={item.url}
                              alt={`${profile.name} photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-bold text-center text-white py-0.2">
                              {idx === 0 ? 'Main' : idx === 1 ? '2nd' : idx === 2 ? '3rd' : idx === 3 ? '4th' : `#${idx + 1}`}
                            </span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Details Body */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* Quick Taps Bar */}
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2.5">
                    Send a Tap
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    <button
                      onClick={() => handleTap('flame')}
                      className="py-2.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-2xl flex flex-col items-center gap-1 text-xs font-bold text-neutral-200 transition-all cursor-pointer"
                    >
                      <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                      <span className="text-[10px]">Flame</span>
                    </button>
                    <button
                      onClick={() => handleTap('devil')}
                      className="py-2.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-2xl flex flex-col items-center gap-1 text-xs font-bold text-neutral-200 transition-all cursor-pointer"
                    >
                      <span className="text-base">😈</span>
                      <span className="text-[10px]">Looking</span>
                    </button>
                    <button
                      onClick={() => handleTap('wave')}
                      className="py-2.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-2xl flex flex-col items-center gap-1 text-xs font-bold text-neutral-200 transition-all cursor-pointer"
                    >
                      <span className="text-base">👋</span>
                      <span className="text-[10px]">Wave</span>
                    </button>
                    <button
                      onClick={() => handleTap('water')}
                      className="py-2.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-2xl flex flex-col items-center gap-1 text-xs font-bold text-neutral-200 transition-all cursor-pointer"
                    >
                      <span className="text-base">💦</span>
                      <span className="text-[10px]">Wet</span>
                    </button>
                    <button
                      onClick={() => handleTap('coffee')}
                      className="py-2.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-2xl flex flex-col items-center gap-1 text-xs font-bold text-neutral-200 transition-all cursor-pointer"
                    >
                      <span className="text-base">☕</span>
                      <span className="text-[10px]">Coffee</span>
                    </button>
                  </div>
                </div>

                {/* Headline & Bio */}
                {(profile.headline || profile.bio) && (
                  <div className="space-y-2 pb-4 border-b border-white/10">
                    {profile.headline && (
                      <h4 className="text-base font-extrabold text-white leading-snug">
                        {profile.headline}
                      </h4>
                    )}
                    {profile.bio && (
                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                )}

                {/* Looking For Tags */}
                {profile.lookingFor && profile.lookingFor.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                      Looking For
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.lookingFor.map((item, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-[#ffce00]/15 text-[#ffce00] border border-[#ffce00]/30 rounded-full text-xs font-extrabold"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tribes */}
                {profile.tribes && profile.tribes.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                      Tribes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.tribes.map((tribe, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-white/10 text-neutral-200 border border-white/10 rounded-full text-xs font-semibold"
                        >
                          {tribe}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats / Stats Grid */}
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                    Stats
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white/3 border border-white/5 p-4 rounded-2xl">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase block">Height</span>
                      <span className="font-bold text-white">{profile.height}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase block">Weight</span>
                      <span className="font-bold text-white">{profile.weight}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase block">Body Type</span>
                      <span className="font-bold text-white">{profile.bodyType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase block">Position</span>
                      <span className="font-bold text-white">{profile.position}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase block">Relationship</span>
                      <span className="font-bold text-white">{profile.relationshipStatus}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase block">Ethnicity</span>
                      <span className="font-bold text-white">{profile.ethnicity}</span>
                    </div>
                  </div>
                </div>

                {/* Escort Info (Matching Screenshots) */}
                {profile.escortInfo && (
                  <div className="space-y-5 pt-4 border-t border-white/10">
                    {/* Gay Escort Info Header */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-4 bg-red-600 rounded-full" />
                        <h4 className="text-sm font-extrabold text-white tracking-wide">
                          Gay Escort Info
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-xs bg-white/3 border border-white/5 p-4 rounded-2xl">
                        <div>
                          <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Age</span>
                          <span className="font-extrabold text-white text-sm">{profile.age}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Height</span>
                          <span className="font-extrabold text-white text-sm">{profile.height}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Weight</span>
                          <span className="font-extrabold text-white text-sm">{profile.weight}</span>
                        </div>
                        {profile.escortInfo.size && (
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Size</span>
                            <span className="font-extrabold text-white text-sm">{profile.escortInfo.size}</span>
                          </div>
                        )}
                        {profile.escortInfo.orientation && (
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Orientation</span>
                            <span className="font-extrabold text-white text-sm">{profile.escortInfo.orientation}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Position</span>
                          <span className="font-extrabold text-white text-sm">{profile.position}</span>
                        </div>
                        {profile.escortInfo.foreskin && (
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Foreskin</span>
                            <span className="font-extrabold text-white text-sm">{profile.escortInfo.foreskin}</span>
                          </div>
                        )}
                        {profile.escortInfo.safeBb && (
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Safe/bb</span>
                            <span className="font-extrabold text-white text-sm">{profile.escortInfo.safeBb}</span>
                          </div>
                        )}
                        {profile.escortInfo.bodyHair && (
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Body Hair</span>
                            <span className="font-extrabold text-white text-sm">{profile.escortInfo.bodyHair}</span>
                          </div>
                        )}
                        {profile.escortInfo.hairColor && (
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Hair color</span>
                            <span className="font-extrabold text-white text-sm">{profile.escortInfo.hairColor}</span>
                          </div>
                        )}
                        {profile.escortInfo.eyeColor && (
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Eye color</span>
                            <span className="font-extrabold text-white text-sm">{profile.escortInfo.eyeColor}</span>
                          </div>
                        )}
                        {profile.escortInfo.style && (
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Style</span>
                            <span className="font-extrabold text-white text-sm">{profile.escortInfo.style}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Body</span>
                          <span className="font-extrabold text-white text-sm">{profile.bodyType}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Race</span>
                          <span className="font-extrabold text-white text-sm">{profile.ethnicity}</span>
                        </div>
                        {profile.escortInfo.tattoos && (
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Tattoos</span>
                            <span className="font-extrabold text-white text-sm">{profile.escortInfo.tattoos}</span>
                          </div>
                        )}
                        {profile.escortInfo.piercings && (
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Piercings</span>
                            <span className="font-extrabold text-white text-sm">{profile.escortInfo.piercings}</span>
                          </div>
                        )}
                        {profile.escortInfo.smoking && (
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Smoking</span>
                            <span className="font-extrabold text-white text-sm">{profile.escortInfo.smoking}</span>
                          </div>
                        )}
                        {profile.escortInfo.zodiac && (
                          <div>
                            <span className="text-[11px] text-neutral-400 block mb-0.5 font-medium">Zodiac</span>
                            <span className="font-extrabold text-white text-sm">{profile.escortInfo.zodiac}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Services */}
                    {profile.escortInfo.services && profile.escortInfo.services.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-4 bg-red-600 rounded-full" />
                          <h4 className="text-xs font-extrabold text-white tracking-wide uppercase">
                            RentMen Services
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.escortInfo.services.map((srv, idx) => (
                            <span
                              key={idx}
                              className="px-3.5 py-1.5 bg-white/10 text-neutral-200 border border-white/10 rounded-full text-xs font-bold"
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Spoken Languages */}
                    {profile.escortInfo.languages && profile.escortInfo.languages.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-1.5 h-4 bg-red-600 rounded-full" />
                          <h4 className="text-xs font-extrabold text-white tracking-wide uppercase">
                            Spoken Languages
                          </h4>
                        </div>
                        <p className="text-xs text-neutral-300 font-semibold pl-3.5">
                          {profile.escortInfo.languages.join(' • ')}
                        </p>
                      </div>
                    )}

                    {/* I Am Into */}
                    {profile.escortInfo.intoTags && profile.escortInfo.intoTags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="w-1.5 h-4 bg-red-600 rounded-full" />
                          <h4 className="text-xs font-extrabold text-white tracking-wide uppercase">
                            I Am Into
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.escortInfo.intoTags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3.5 py-1.5 bg-[#252528] text-neutral-200 border border-white/10 rounded-full text-xs font-semibold hover:bg-white/15 transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sexual Health & Safety */}
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sexual Health & Verification</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-neutral-300">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>On PrEP: <strong>{profile.health.prep ? 'Yes' : 'No'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Last Tested: <strong>{profile.health.testedDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>COVID Vaccinated</span>
                    </div>
                  </div>
                </div>

                {/* Social handles if available */}
                {profile.social && (profile.social.instagram || profile.social.spotify) && (
                  <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                    {profile.social.instagram && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                        <Instagram className="w-4 h-4 text-pink-400" />
                        <span>{profile.social.instagram}</span>
                      </div>
                    )}
                    {profile.social.spotify && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                        <Music className="w-4 h-4 text-emerald-400" />
                        <span>{profile.social.spotify}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="p-3 bg-[#141416] border-t border-white/10 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <button 
                  onClick={() => onToggleFavorite(profile.id)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    profile.isFavorite 
                      ? 'border-[#ffce00] text-[#ffce00] bg-[#ffce00]/10' 
                      : 'border-white/10 text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  <Star className={`w-4 h-4 ${profile.isFavorite ? 'fill-[#ffce00]' : ''}`} />
                  <span>{profile.isFavorite ? 'Favorited' : 'Favorite'}</span>
                </button>
                
                <button
                  onClick={() => onStartChat(profile)}
                  className="flex-2 py-2.5 bg-[#ffce00] hover:bg-[#e6ba00] text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-black" />
                  <span>Message {profile.name}</span>
                </button>
              </div>

              {/* Safety & Moderation Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReporting(true)}
                  className="flex-1 py-2 bg-white/5 hover:bg-amber-500/15 hover:border-amber-500/30 text-neutral-300 hover:text-amber-300 text-xs font-bold rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Report Profile</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Block ${profile.name}? This will hide their profile and messages.`)) {
                      onBlockProfile(profile.id);
                      onClose();
                    }
                  }}
                  className="flex-1 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs font-bold rounded-xl border border-red-900/30 transition-colors cursor-pointer"
                >
                  Block Profile
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
