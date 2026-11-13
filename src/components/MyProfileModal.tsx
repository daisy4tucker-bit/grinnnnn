import React, { useState } from 'react';
import { X, Check, Camera, User, Sparkles, EyeOff } from 'lucide-react';
import { ALL_TRIBES, LOOKING_FOR_OPTIONS } from '../data/mockProfiles';

export interface MyProfileData {
  name: string;
  age: number;
  headline: string;
  bio: string;
  lookingFor: string[];
  tribes: string[];
  showDistance: boolean;
  incognito: boolean;
}

interface MyProfileModalProps {
  myProfile: MyProfileData;
  onSave: (data: MyProfileData) => void;
  onClose: () => void;
}

export const MyProfileModal: React.FC<MyProfileModalProps> = ({
  myProfile,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<MyProfileData>({ ...myProfile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleTribe = (tribe: string) => {
    const exists = formData.tribes.includes(tribe);
    setFormData({
      ...formData,
      tribes: exists ? formData.tribes.filter((t) => t !== tribe) : [...formData.tribes, tribe],
    });
  };

  const toggleLookingFor = (item: string) => {
    const exists = formData.lookingFor.includes(item);
    setFormData({
      ...formData,
      lookingFor: exists ? formData.lookingFor.filter((l) => l !== item) : [...formData.lookingFor, item],
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#161618] border border-white/10 rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#ffce00]" />
            <h2 className="text-lg font-black text-white">Edit My Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 p-3 bg-white/3 rounded-2xl border border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800 border-2 border-[#ffce00] flex items-center justify-center relative overflow-hidden group">
              <span className="text-xl font-black text-[#ffce00]">
                {formData.name.charAt(0) || 'U'}
              </span>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="font-bold text-white text-sm">{formData.name || 'Your Name'}, {formData.age}</p>
              <p className="text-neutral-400 text-[11px]">Primary Photo Verified</p>
              <span className="text-[10px] text-[#ffce00] font-semibold">Change photo</span>
            </div>
          </div>

          {/* Name & Age */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-neutral-400 font-bold mb-1">Display Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-[#ffce00]"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-bold mb-1">Age</label>
              <input
                type="number"
                min="18"
                max="99"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-[#ffce00]"
                required
              />
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-neutral-400 font-bold mb-1">Headline</label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g. Exploring the night scene 🍸"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffce00]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-neutral-400 font-bold mb-1">About Me / Bio</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell guys what you are into..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffce00] resize-none"
            />
          </div>

          {/* Privacy Toggles */}
          <div className="space-y-2.5 p-3.5 bg-white/3 rounded-2xl border border-white/5">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-white block">Show Distance in Meters</span>
                <span className="text-[10px] text-neutral-400">Allow nearby guys to see your relative distance</span>
              </div>
              <input
                type="checkbox"
                checked={formData.showDistance}
                onChange={(e) => setFormData({ ...formData, showDistance: e.target.checked })}
                className="w-4 h-4 accent-[#ffce00] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-white/5">
              <div>
                <span className="font-bold text-white block flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-[#ffce00]" /> Incognito Ghost Mode
                </span>
                <span className="text-[10px] text-neutral-400">Hide from the grid while browsing others</span>
              </div>
              <input
                type="checkbox"
                checked={formData.incognito}
                onChange={(e) => setFormData({ ...formData, incognito: e.target.checked })}
                className="w-4 h-4 accent-[#ffce00] cursor-pointer"
              />
            </label>
          </div>

          {/* Looking For */}
          <div>
            <label className="block text-neutral-400 font-bold mb-1.5">Looking For</label>
            <div className="flex flex-wrap gap-1.5">
              {LOOKING_FOR_OPTIONS.map((opt) => {
                const isSelected = formData.lookingFor.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleLookingFor(opt)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      isSelected
                        ? 'bg-[#ffce00] text-black shadow'
                        : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tribes */}
          <div>
            <label className="block text-neutral-400 font-bold mb-1.5">My Tribes</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TRIBES.map((tribe) => {
                const isSelected = formData.tribes.includes(tribe);
                return (
                  <button
                    key={tribe}
                    type="button"
                    onClick={() => toggleTribe(tribe)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      isSelected
                        ? 'bg-[#ffce00] text-black shadow'
                        : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    {tribe}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
                <Check className="w-4 h-4" /> Changes saved!
              </span>
            ) : <span />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#ffce00] hover:bg-[#ebd200] text-black rounded-xl font-black shadow-lg shadow-[#ffce00]/20 transition-transform active:scale-95"
              >
                Save Profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
