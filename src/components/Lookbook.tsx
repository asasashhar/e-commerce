import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Camera, Loader2 } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { supabase } from '@/lib/supabase';

const PHOTOS = [
  {
    src: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Street style sneakers',
    span: 'row-span-2',
  },
  {
    src: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Running shoes on track',
    span: '',
  },
  {
    src: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Lifestyle sneakers',
    span: '',
  },
  {
    src: 'https://images.pexels.com/photos/3316924/pexels-photo-3316924.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Athletic shoes in motion',
    span: 'row-span-2',
  },
  {
    src: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Casual shoe style',
    span: '',
  },
  {
    src: 'https://images.pexels.com/photos/2562992/pexels-photo-2562992.png?auto=compress&cs=tinysrgb&w=800',
    alt: 'Outdoor shoes',
    span: '',
  },
  {
    src: 'https://images.pexels.com/photos/1082528/pexels-photo-1082528.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Fashion sneakers on feet',
    span: 'row-span-2',
  },
  {
    src: 'https://images.pexels.com/photos/1546003/pexels-photo-1546003.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'White sneakers closeup',
    span: '',
  },
  {
    src: 'https://images.pexels.com/photos/2048548/pexels-photo-2048548.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Colorful shoes collection',
    span: '',
  },
];

const FALLBACK_PHOTOS = [
  { src: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Street style sneakers', span: 'row-span-2' },
  { src: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Running shoes on track', span: '' },
  { src: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Lifestyle sneakers', span: '' },
  { src: 'https://images.pexels.com/photos/3316924/pexels-photo-3316924.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Athletic shoes in motion', span: 'row-span-2' },
  { src: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Casual shoe style', span: '' },
  { src: 'https://images.pexels.com/photos/2562992/pexels-photo-2562992.png?auto=compress&cs=tinysrgb&w=800', alt: 'Outdoor shoes', span: '' },
  { src: 'https://images.pexels.com/photos/1082528/pexels-photo-1082528.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Fashion sneakers on feet', span: 'row-span-2' },
  { src: 'https://images.pexels.com/photos/1546003/pexels-photo-1546003.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'White sneakers closeup', span: '' },
  { src: 'https://images.pexels.com/photos/2048548/pexels-photo-2048548.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Colorful shoes collection', span: '' },
];

interface LookbookProps {
  onBack: () => void;
}

export default function Lookbook({ onBack }: LookbookProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const { ref, visible } = useReveal<HTMLDivElement>();

  useEffect(() => {
    supabase
      .from('lookbook_items')
      .select('src, alt, span')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          setPhotos(FALLBACK_PHOTOS);
        } else {
          setPhotos(data as Photo[]);
        }
        setDbLoading(false);
      });
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
            STRIDE Lookbook
          </div>
          <h1 className="font-display text-5xl font-bold text-white sm:text-6xl">
            Styled for the Streets
          </h1>
          <p className="mx-auto mt-4 max-w-md text-ink-400">
            Real shoes. Real style. See how the STRIDE collection looks in the wild.
          </p>
        </div>
      </div>

      {/* Masonry grid */}
      <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} mx-auto max-w-7xl px-5 py-16 sm:px-8`}>
        {dbLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridAutoRows: '280px',
            }}
          >
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className={`group relative overflow-hidden rounded-2xl ${photo.span} transition-transform duration-300 hover:scale-[1.02]`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-4 left-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <p className="text-sm font-medium text-white">{photo.alt}</p>
                </div>
              </button>
            ))}
          </div>
        )}
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
            src={photos[lightbox]?.src ?? ''}
            alt={photos[lightbox]?.alt ?? ''}
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
