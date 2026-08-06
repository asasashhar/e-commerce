import { ArrowRight, Star, Zap } from 'lucide-react';
import type { Product } from '@/lib/types';

interface HeroProps {
  featured: Product[];
  onShop: () => void;
}

export default function Hero({ featured, onShop }: HeroProps) {
  const hero = featured[0];

  return (
    <section id="top" className="relative min-h-screen overflow-hidden pt-28">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-accent-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-brand-500/10 blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 sm:px-8 lg:grid-cols-2 lg:gap-8">
        {/* Left: copy */}
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-ink-200">
            <Zap className="h-3.5 w-3.5 text-accent-500" />
            New Spring Drop — Live Now
          </div>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Step Into
            <br />
            <span className="shimmer-text">The Future</span>
            <br />
            Of Motion.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-300">
            Engineered for athletes, designed for the streets. Discover performance footwear that moves with you.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onShop}
              className="group flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink-950 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20 active:scale-95"
            >
              Shop The Drop
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <a
              href="#collections"
              className="rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
            >
              Explore Collections
            </a>
          </div>

          <div className="mt-10 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[
                'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=80',
                'https://images.pexels.com/photos/12628400/pexels-photo-12628400.jpeg?auto=compress&cs=tinysrgb&w=80',
                'https://images.pexels.com/photos/5413290/pexels-photo-5413290.jpeg?auto=compress&cs=tinysrgb&w=80',
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-10 w-10 rounded-full border-2 border-ink-950 object-cover"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />
                ))}
              </div>
              <p className="mt-0.5 text-xs text-ink-400">
                <span className="font-semibold text-white">12,000+</span> happy athletes
              </p>
            </div>
          </div>
        </div>

        {/* Right: featured shoe */}
        <div className="relative flex items-center justify-center">
          {hero && (
            <>
              <div className="absolute h-72 w-72 animate-spin-slow rounded-full border border-dashed border-white/10 sm:h-96 sm:w-96" />
              <div className="absolute h-52 w-52 animate-spin-slow rounded-full border border-white/5 [animation-direction:reverse] sm:h-72 sm:w-72" />

              <div className="relative animate-float">
                <img
                  src={hero.image_url}
                  alt={hero.name}
                  className="relative h-72 w-72 rotate-[-8deg] object-contain drop-shadow-2xl sm:h-[28rem] sm:w-[28rem]"
                />
              </div>

              {/* Floating badge */}
              <div className="absolute right-4 top-8 animate-bounce-subtle rounded-2xl glass px-4 py-3 sm:right-12">
                <p className="text-xs text-ink-400">Featured</p>
                <p className="font-display text-lg font-bold text-white">{hero.name}</p>
                <p className="text-sm font-semibold text-brand-400">${hero.price}</p>
              </div>

              <div className="absolute bottom-8 left-4 animate-bounce-subtle rounded-2xl glass px-4 py-3 [animation-delay:1s] sm:left-12">
                <p className="text-xs text-ink-400">Rating</p>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-accent-500 text-accent-500" />
                  <span className="font-display text-lg font-bold text-white">{hero.rating}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/20 p-1.5">
          <div className="h-2 w-1 animate-bounce rounded-full bg-white/50" />
        </div>
      </div>
    </section>
  );
}
