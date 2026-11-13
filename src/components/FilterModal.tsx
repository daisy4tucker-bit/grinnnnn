import React from 'react';
import { X, RotateCcw, Check, SlidersHorizontal } from 'lucide-react';
import { FilterState } from '../types';
import { ALL_TRIBES, LOOKING_FOR_OPTIONS } from '../data/mockProfiles';

interface FilterModalProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  onClose: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  filters,
  onChange,
  onReset,
  onClose,
}) => {
  const toggleTribe = (tribe: string) => {
    const exists = filters.selectedTribes.includes(tribe);
    const updated = exists
      ? filters.selectedTribes.filter((t) => t !== tribe)
      : [...filters.selectedTribes, tribe];
    onChange({ ...filters, selectedTribes: updated });
  };

  const toggleLookingFor = (item: string) => {
    const exists = filters.selectedLookingFor.includes(item);
    const updated = exists
      ? filters.selectedLookingFor.filter((l) => l !== item)
      : [...filters.selectedLookingFor, item];
    onChange({ ...filters, selectedLookingFor: updated });
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
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#ffce00]" />
            <h2 className="text-lg font-black text-white">Filter Radar</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs">
          {/* Toggles */}
          <div className="space-y-3 bg-white/3 p-3.5 rounded-2xl border border-white/5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-white">Online Guys Only</span>
              <input
                type="checkbox"
                checked={filters.onlineOnly}
                onChange={(e) => onChange({ ...filters, onlineOnly: e.target.checked })}
                className="w-4 h-4 accent-[#ffce00] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-white">Must Have Profile Photos</span>
              <input
                type="checkbox"
                checked={filters.photosOnly}
                onChange={(e) => onChange({ ...filters, photosOnly: e.target.checked })}
                className="w-4 h-4 accent-[#ffce00] rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Max Distance Slider */}
          <div>
            <div className="flex justify-between font-bold text-white mb-2">
              <span>Maximum Distance</span>
              <span className="text-[#ffce00] font-mono">{filters.maxDistanceKm} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={filters.maxDistanceKm}
              onChange={(e) => onChange({ ...filters, maxDistanceKm: Number(e.target.value) })}
              className="w-full accent-[#ffce00] cursor-pointer"
            />
          </div>

          {/* Age Range Slider */}
          <div>
            <div className="flex justify-between font-bold text-white mb-2">
              <span>Age Range</span>
              <span className="text-[#ffce00] font-mono">{filters.minAge} - {filters.maxAge} yrs</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="18"
                max="65"
                value={filters.maxAge}
                onChange={(e) => onChange({ ...filters, maxAge: Number(e.target.value) })}
                className="w-full accent-[#ffce00] cursor-pointer"
              />
            </div>
          </div>

          {/* Looking For */}
          <div>
            <span className="font-bold text-white block mb-2">Looking For</span>
            <div className="flex flex-wrap gap-1.5">
              {LOOKING_FOR_OPTIONS.map((opt) => {
                const isSelected = filters.selectedLookingFor.includes(opt);
                return (
                  <button
                    key={opt}
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
            <span className="font-bold text-white block mb-2">Tribes</span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TRIBES.map((tribe) => {
                const isSelected = filters.selectedTribes.includes(tribe);
                return (
                  <button
                    key={tribe}
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
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#ffce00] hover:bg-[#ebd200] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#ffce00]/20"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
