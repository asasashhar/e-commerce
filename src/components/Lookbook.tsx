import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Camera, Loader2 } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { supabase } from '@/lib/supabase';
import type { LookbookItem } from '@/lib/types';

interface LookbookProps {
  onBack: () => void;
}

export default function Lookbook({ onBack }: LookbookProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [photos, setPhotos] = useState<LookbookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, visible } = useReveal<HTMLDivElement>();

  useEffect(() => {
    const fetchLookbook = async () => {
      const { data } = await supabase
        .from('lookbook_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        setPhotos(data as LookbookItem[]);
      }
      setLoading(false);
    };
    fetchLookbook();
  }, []);

  const prev = () =>
    setLightbox((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  const next = () =>
    setLightbox((i) => (i === null ? null : (i + 1) % photos.length));



  return (
    <div className="min-h-screen bg-ink-950">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10 bg-ink-900 px-5 py-20 sm:px-8 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-brand-500/10 blur-[100px]" />
          <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-accent-500/10 blur-[100px]" />
        </div>
        <button
          onClick={onBack}
          className="absolute left-5 top-6 sm:left-8 flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Store
        </button>
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-ink-200 mb-4">
            <Camera className="h-3.5 w-3.5 text-brand-400" />
            KINGWEAR Lookbook
          </div>
          <h1 className="font-display text-5xl font-bold text-white sm:text-6xl">
            Styled for Royalty
          </h1>
          <p className="mx-auto mt-4 max-w-md text-ink-400">
            Real shoes. Royal style. See how the KINGWEAR collection looks in the wild.
          </p>
        </div>
      </div>

      {/* Masonry grid */}
      <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} mx-auto max-w-7xl px-5 py-16 sm:px-8`}>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: '280px',
          }}
        >
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            </div>
          ) : photos.length === 0 ? (
            <div className="col-span-full text-center py-20 text-ink-400">
              No photos available yet.
            </div>
          ) : (
            photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className={`group relative overflow-hidden rounded-2xl ${photo.span} transition-transform duration-300 hover:scale-[1.02]`}
              >
                <img
                  src={photo.image_url}
                  alt={photo.alt_text}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-4 left-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <p className="text-sm font-medium text-white">{photo.alt_text}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fade-in">
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={prev}
            className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <img
            src={photos[lightbox].image_url}
            alt={photos[lightbox].alt_text}
            className="max-h-[85vh] max-w-[85vw] animate-scale-in rounded-2xl object-contain shadow-2xl"
          />

          <button
            onClick={next}
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-ink-400">
            {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
