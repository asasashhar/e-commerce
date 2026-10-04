import { useEffect, useState } from 'react';
import { Gauge, Layers, Leaf, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ShopSettings } from '@/lib/types';
import { useReveal } from '@/hooks/useReveal';

const FEATURES = [
  { icon: Gauge, title: 'Responsive Cushioning', desc: 'Energy-return foam midsoles that adapt to your stride for explosive comfort on every step.' },
  { icon: Layers, title: 'Breathable Knit', desc: 'Engineered mesh uppers keep your feet cool and locked in, mile after mile.' },
  { icon: Leaf, title: 'Sustainable Build', desc: 'Recycled materials and carbon-neutral manufacturing — performance that respects the planet.' },
  { icon: ShieldCheck, title: 'Built To Last', desc: 'Durable outsoles and reinforced stitching backed by our 2-year warranty.' },
];

export default function Features() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) setSettings(data as ShopSettings);
    });
  }, []);

  return (
    <section id="about" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''}`}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">Why {settings?.shop_name ?? 'KINGWEAR'}</p>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {settings?.about_title ?? 'Crafted For Every Move'}
          </h2>
          <p className="mt-4 text-ink-300">
            {settings?.about_description ?? 'We obsess over every detail so you don\'t have to. From lab to street, our shoes are built to perform and designed to turn heads.'}
          </p>
        </div>
      </div>

      {settings?.about_image && (
        <div className="mt-10 overflow-hidden rounded-3xl">
          <img src={settings.about_image} alt="About" className="h-64 w-full object-cover sm:h-80" />
        </div>
      )}

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: (typeof FEATURES)[number]; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} group rounded-3xl border border-white/8 bg-gradient-to-b from-ink-800/50 to-ink-900/50 p-6 transition-colors duration-300 hover:border-brand-500/30`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
        <feature.icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 font-display text-lg font-bold text-white">{feature.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-400">{feature.desc}</p>
    </div>
  );
}
