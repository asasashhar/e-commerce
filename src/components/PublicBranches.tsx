import { useState, useEffect } from 'react';
import {
  MapPin,
  ChevronLeft,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Navigation,
  Compass,
  Building2,
  Camera,
  Loader2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Branch } from '@/lib/types';

interface PublicBranchesProps {
  onBack: () => void;
}

export default function PublicBranches({ onBack }: PublicBranchesProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [activeImageIndexes, setActiveImageIndexes] = useState<Record<string, number>>({});
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null);

  useEffect(() => {
    async function loadBranches() {
      setLoading(true);
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('is_flagship', { ascending: false });

      if (!error && data) {
        setBranches((data as Branch[]).filter((b) => b.active !== false));
      }
      setLoading(false);
    }

    loadBranches();
  }, []);

  const cities = ['all', ...Array.from(new Set(branches.map((b) => b.city.split(',')[0].trim())))];

  const filteredBranches = branches.filter((b) => {
    if (selectedCity === 'all') return true;
    return b.city.toLowerCase().includes(selectedCity.toLowerCase());
  });

  const selectPhoto = (branchId: string, index: number) => {
    setActiveImageIndexes((prev) => ({ ...prev, [branchId]: index }));
  };

  return (
    <div className="min-h-screen bg-ink-950 text-ink-50">
      {/* Header Banner */}
      <div className="relative overflow-hidden border-b border-white/10 bg-ink-900 px-5 py-20 text-center sm:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-brand-500/10 blur-[100px]" />
          <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-accent-500/10 blur-[100px]" />
        </div>

        <button
          onClick={onBack}
          className="absolute left-5 top-6 flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-white sm:left-8 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Store
        </button>

        <div className="relative mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-ink-200">
            <MapPin className="h-3.5 w-3.5 text-brand-400" />
            KINGWEAR Store Locator & Showrooms
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Visit Our Stores
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-300">
            Experience our engineered footwear firsthand. Explore flagship showrooms, receive personalized fitting sessions, and discover exclusive in-store drops.
          </p>

          {/* City Filter Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition-all duration-200 cursor-pointer ${
                  selectedCity === city
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                    : 'border border-white/10 bg-white/5 text-ink-300 hover:border-white/20 hover:text-white'
                }`}
              >
                {city === 'all' ? 'All Locations' : city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-ink-900/40 py-20 text-center">
            <Building2 className="h-12 w-12 text-ink-500" />
            <h3 className="mt-4 font-display text-xl font-bold text-white">No Branches Found</h3>
            <p className="mt-1 text-sm text-ink-400">
              There are currently no stores listed under this filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredBranches.map((branch) => {
              const images = Array.isArray(branch.images) && branch.images.length > 0
                ? branch.images
                : [
                    'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=800'
                  ];
              const activeIndex = activeImageIndexes[branch.id] ?? 0;
              const currentImage = images[activeIndex] || images[0];
              const isMapOpen = expandedMapId === branch.id;

              return (
                <div
                  key={branch.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60 backdrop-blur-xl transition-all duration-300 hover:border-brand-500/40 hover:shadow-2xl hover:shadow-black/50"
                >
                  <div>
                    {/* Multi-Image Gallery Display */}
                    <div className="relative overflow-hidden bg-ink-950">
                      <div className="relative aspect-[16/9] w-full overflow-hidden">
                        <img
                          src={currentImage}
                          alt={branch.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-black/30" />

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          {branch.is_flagship && (
                            <span className="rounded-full bg-accent-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink-950 shadow-lg backdrop-blur-md">
                              Flagship Showroom
                            </span>
                          )}
                          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                            ● Open for Visits
                          </span>
                        </div>

                        {/* Image Counter */}
                        {images.length > 1 && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs text-white backdrop-blur-md">
                            <Camera className="h-3.5 w-3.5 text-brand-400" />
                            <span>
                              {activeIndex + 1} / {images.length}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Photo Thumbnail Picker Strip */}
                      {images.length > 1 && (
                        <div className="flex gap-2 p-2.5 bg-ink-900/90 border-t border-white/5 overflow-x-auto no-scrollbar">
                          {images.map((img, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => selectPhoto(branch.id, i)}
                              className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                                i === activeIndex
                                  ? 'border-brand-500 scale-105'
                                  : 'border-white/10 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt="" className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-6 sm:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400">
                            <Compass className="h-3.5 w-3.5" />
                            {branch.city}
                          </p>
                          <h2 className="mt-1 font-display text-2xl font-bold text-white group-hover:text-brand-300 transition-colors">
                            {branch.name}
                          </h2>
                        </div>
                      </div>

                      {/* Store Details List */}
                      <div className="mt-5 space-y-3 border-t border-white/5 pt-5 text-sm text-ink-300">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 shrink-0 text-brand-400 mt-1" />
                          <span className="leading-relaxed text-white font-medium">
                            {branch.address}
                          </span>
                        </div>

                        {branch.opening_hours && (
                          <div className="flex items-start gap-3">
                            <Clock className="h-4 w-4 shrink-0 text-ink-400 mt-1" />
                            <span className="leading-relaxed">{branch.opening_hours}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-5 pt-1">
                          {branch.phone && (
                            <a
                              href={`tel:${branch.phone}`}
                              className="flex items-center gap-2 hover:text-white transition-colors"
                            >
                              <Phone className="h-3.5 w-3.5 text-ink-400" />
                              <span>{branch.phone}</span>
                            </a>
                          )}

                          {branch.email && (
                            <a
                              href={`mailto:${branch.email}`}
                              className="flex items-center gap-2 hover:text-white transition-colors"
                            >
                              <Mail className="h-3.5 w-3.5 text-ink-400" />
                              <span>{branch.email}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Map Preview Bottom Section */}
                  <div className="border-t border-white/5 bg-ink-900/40 p-6 sm:px-7">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setExpandedMapId(isMapOpen ? null : branch.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-ink-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        <Navigation className="h-3.5 w-3.5 text-brand-400" />
                        {isMapOpen ? 'Hide Interactive Map' : 'View On Google Maps'}
                      </button>

                      {branch.google_maps_url && (
                        <a
                          href={branch.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-400 active:scale-95 transition-all cursor-pointer"
                        >
                          Get Directions
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Expandable Embedded Google Map */}
                    {isMapOpen && (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-ink-950 animate-fade-in shadow-inner">
                        <iframe
                          title={`Google Maps Location - ${branch.name}`}
                          src={
                            branch.google_maps_embed ||
                            `https://maps.google.com/maps?q=${encodeURIComponent(branch.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`
                          }
                          className="h-64 w-full border-0"
                          loading="lazy"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
