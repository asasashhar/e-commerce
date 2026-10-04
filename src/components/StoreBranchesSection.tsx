import { useEffect, useState } from 'react';
import { MapPin, Navigation, ArrowRight, Camera, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Branch } from '@/lib/types';

interface StoreBranchesSectionProps {
  onExplore: () => void;
}

export default function StoreBranchesSection({ onExplore }: StoreBranchesSectionProps) {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    supabase
      .from('branches')
      .select('*')
      .eq('active', true)
      .limit(3)
      .then(({ data }) => {
        if (data) setBranches(data as Branch[]);
      });
  }, []);

  if (branches.length === 0) return null;

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-brand-400">
            <Building2 className="h-3.5 w-3.5" />
            KINGWEAR Retail Experience
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Our Showrooms & Flagship Stores
          </h2>
          <p className="mt-2 text-sm text-ink-300 max-w-xl">
            Visit our retail branches for exclusive product trials, custom fittings, and the complete KINGWEAR collection.
          </p>
        </div>

        <button
          onClick={onExplore}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer self-start sm:self-auto"
        >
          View All Locations & Maps
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {branches.map((b) => {
          const coverImg = (b.images && b.images[0]) || 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=800';

          return (
            <div
              key={b.id}
              onClick={onExplore}
              className="group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60 p-5 transition-all duration-300 hover:border-brand-500/40 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-ink-950">
                <img
                  src={coverImg}
                  alt={b.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-black/20" />
                {b.is_flagship && (
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-accent-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase text-ink-950">
                    Flagship
                  </span>
                )}
                <span className="absolute bottom-2.5 left-2.5 text-xs font-semibold text-brand-300">
                  {b.city}
                </span>
              </div>

              <h3 className="mt-4 font-display text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                {b.name}
              </h3>
              <p className="mt-1 text-xs text-ink-400 line-clamp-2">{b.address}</p>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-ink-300">
                <span>{b.opening_hours.split('|')[0] || b.opening_hours}</span>
                <span className="flex items-center gap-1 text-brand-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
