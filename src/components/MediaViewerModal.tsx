import React, { useState, useEffect } from 'react';
import { X, Lock, Eye, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { ChatMessage, Profile } from '../types';

interface MediaViewerModalProps {
  message: ChatMessage;
  profile: Profile;
  onClose: () => void;
  onExpire?: (messageId: string) => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  message,
  profile,
  onClose,
  onExpire,
}) => {
  const isExpiring = Boolean(message.isExpiring);
  const [timeLeft, setTimeLeft] = useState<number>(message.viewOnceSeconds || 10);
  const [isMuted, setIsMuted] = useState(false);

  // Countdown timer for view-once media
  useEffect(() => {
    if (!isExpiring) return;

    if (timeLeft <= 0) {
      if (onExpire) {
        onExpire(message.id);
      }
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpire) {
            onExpire(message.id);
          }
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isExpiring, message.id, onClose, onExpire]);

  const isVideo = message.mediaType === 'video' || Boolean(message.videoUrl);
  const mediaUrl = isVideo ? message.videoUrl : (message.imageUrl || profile.image);
  const isMe = message.senderId === 'me';
  const senderName = isMe ? 'You' : profile.name;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between z-10 pt-2 pb-4">
        <div className="flex items-center gap-3">
          <img
            src={isMe ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' : profile.image}
            alt={senderName}
            className="w-10 h-10 rounded-full object-cover border border-white/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">{senderName}</span>
              {isExpiring && (
                <span className="px-2 py-0.5 bg-[#ffce00] text-black text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3 h-3" /> View Once
                </span>
              )}
            </div>
            <span className="text-[11px] text-neutral-400">{message.timestamp}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Expiring countdown badge */}
          {isExpiring && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/30 border border-red-500/50 rounded-full text-red-300 text-xs font-black animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Expires in {timeLeft}s</span>
            </div>
          )}

          <button
            onClick={() => {
              if (isExpiring && onExpire) {
                onExpire(message.id);
              }
              onClose();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Expiration Progress Bar */}
      {isExpiring && (
        <div className="w-full max-w-2xl bg-neutral-800 h-1.5 rounded-full overflow-hidden my-2">
          <div
            className="h-full bg-gradient-to-r from-[#ffce00] to-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>
      )}

      {/* Main Media Container */}
      <div className="relative flex-1 w-full max-w-2xl flex items-center justify-center overflow-hidden my-auto">
        {isVideo ? (
          <div className="relative max-h-full max-w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 flex items-center justify-center">
            <video
              src={mediaUrl}
              autoPlay
              controls
              loop={!isExpiring}
              muted={isMuted}
              playsInline
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain"
            />
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <div className="relative max-h-full max-w-full flex items-center justify-center">
            <img
              src={mediaUrl}
              alt="Shared Media"
              className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        )}
      </div>

      {/* Bottom Caption & Privacy Shield */}
      <div className="w-full max-w-2xl pt-3 pb-2 text-center space-y-1 z-10">
        {message.text && (
          <p className="text-white text-sm font-medium bg-black/60 px-4 py-2 rounded-xl inline-block max-w-md border border-white/10">
            {message.text}
          </p>
        )}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
          <Lock className="w-3 h-3 text-[#ffce00]" />
          <span>Encrypted Private Chat Session · Screenshots Blocked</span>
        </div>
      </div>
    </div>
  );
};
