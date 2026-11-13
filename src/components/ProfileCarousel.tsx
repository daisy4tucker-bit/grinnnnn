import React, { useRef, useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Profile } from '../types';

interface ProfileCarouselProps {
  profiles: Profile[];
  onSelectProfile?: (profile: Profile) => void;
}

export const ProfileCarousel: React.FC<ProfileCarouselProps> = ({
  profiles,
  onSelectProfile,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Drag-to-scroll state
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Ensure 100% unique profile names and unique profile images (no duplicates)
  const uniqueProfiles = useMemo(() => {
    const seenNames = new Set<string>();
    const seenImages = new Set<string>();
    const seenIds = new Set<string>();
    const result: Profile[] = [];

    for (const p of profiles) {
      if (!p) continue;
      const nameKey = p.name.trim().toLowerCase();
      if (seenIds.has(p.id) || seenNames.has(nameKey) || seenImages.has(p.image)) {
        continue;
      }
      seenIds.add(p.id);
      seenNames.add(nameKey);
      seenImages.add(p.image);
      result.push(p);
    }
    return result;
  }, [profiles]);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);

    const stepWidth = 160;
    const index = Math.round(scrollLeft / (stepWidth * 3));
    const maxDots = Math.max(1, Math.ceil(uniqueProfiles.length / 3));
    setActiveSlide(Math.min(index, maxDots - 1));
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [uniqueProfiles]);

  // Gentle smooth auto-gliding
  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;

    const interval = setInterval(() => {
      if (!scrollContainerRef.current || isDragging.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = Math.max(220, scrollContainerRef.current.clientWidth * 0.6);
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftStart.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 6) {
      hasDragged.current = true;
    }
    scrollContainerRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const totalDots = Math.min(8, Math.max(1, Math.ceil(uniqueProfiles.length / 3)));

  return (
    <div 
      className="relative w-full my-3.5 select-none bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-2.5 sm:p-3.5 shadow-xl backdrop-blur-md overflow-hidden max-w-5xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        isDragging.current = false;
      }}
    >
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 bg-[#ffce00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Reduced Header Above Carousel */}
      <div className="flex items-center justify-between mb-2.5 px-1 sm:px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse shadow-sm shadow-[#00e676]" />
          <h3 className="text-xs sm:text-xs font-bold tracking-wider uppercase text-neutral-200 flex items-center gap-1.5">
            <span>Explore Profiles</span>
            <span className="text-[#ffce00]">· Active Radar</span>
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-400">
          <Sparkles className="w-3 h-3 text-[#ffce00]" />
          <span>Click to view · Swipe to browse</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CAROUSEL TRACK WITH REDUCED DIMENSION & COMPACT CARDS        */}
      {/* ============================================================ */}
      <div className="relative group">
        {/* Floating Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`absolute -left-1.5 sm:-left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl backdrop-blur-md border ${
            canScrollLeft
              ? 'bg-black/85 border-[#ffce00] text-[#ffce00] hover:bg-[#ffce00] hover:text-black hover:scale-105 active:scale-95 shadow-[#ffce00]/30 cursor-pointer'
              : 'bg-black/40 border-white/5 text-neutral-600 opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* Floating Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`absolute -right-1.5 sm:-right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl backdrop-blur-md border ${
            canScrollRight
              ? 'bg-black/85 border-[#ffce00] text-[#ffce00] hover:bg-[#ffce00] hover:text-black hover:scale-105 active:scale-95 shadow-[#ffce00]/30 cursor-pointer'
              : 'bg-black/40 border-white/5 text-neutral-600 opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* Soft edge fade indicators */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/70 to-transparent z-20 pointer-events-none rounded-l-xl" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/70 to-transparent z-20 pointer-events-none rounded-r-xl" />
        )}

        {/* Sleek, Compact Single-Row Carousel Track */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2.5 pt-0.5 px-0.5 sm:px-1 scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing focus:outline-none"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {uniqueProfiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => {
                if (!hasDragged.current && onSelectProfile) {
                  onSelectProfile(profile);
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectProfile?.(profile);
                }
              }}
              aria-label={`View ${profile.name}'s profile`}
              className="group/card relative shrink-0 w-28 sm:w-32 md:w-36 aspect-4/5 rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900 border border-white/15 hover:border-[#ffce00] transition-all duration-200 shadow-lg shadow-black/60 hover:shadow-[#ffce00]/25 select-none snap-start cursor-pointer hover:scale-103 active:scale-97"
            >
              {/* Portrait image */}
              <img
                src={profile.image}
                alt={profile.name}
                referrerPolicy="no-referrer"
                draggable={false}
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/card:scale-105 pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/images/portrait_alei_main.jpg';
                }}
              />

              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

              {/* View profile badge on hover */}
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 pointer-events-none">
                <span className="px-1.5 py-0.5 rounded-md bg-[#ffce00] text-black text-[9px] font-black uppercase tracking-tight shadow">
                  View
                </span>
              </div>

              {/* Compact Name and Status */}
              <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 shadow-md max-w-full">
                  <span 
                    className={`w-2 h-2 rounded-full shrink-0 shadow-xs ${
                      profile.isOnline ? 'bg-[#00e676]' : 'bg-neutral-500'
                    }`} 
                  />
                  <span className="text-white font-bold text-xs tracking-tight truncate drop-shadow-sm">
                    {profile.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {Array.from({ length: totalDots }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (!scrollContainerRef.current) return;
              const stepWidth = 160 * 3;
              scrollContainerRef.current.scrollTo({
                left: idx * stepWidth,
                behavior: 'smooth',
              });
            }}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === activeSlide
                ? 'w-6 bg-[#ffce00] shadow-xs shadow-[#ffce00]/50'
                : 'w-1.5 bg-white/25 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
