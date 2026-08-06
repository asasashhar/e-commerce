import { Star, Truck, Shield, RefreshCw, Sparkles } from 'lucide-react';

const ITEMS = [
  { icon: Truck, text: 'Free Shipping Over $99' },
  { icon: Shield, text: '2-Year Warranty' },
  { icon: RefreshCw, text: '30-Day Returns' },
  { icon: Sparkles, text: 'Carbon Neutral' },
  { icon: Star, text: 'Rated 4.8 / 5' },
];

export default function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-ink-900 py-4">
      <div className="flex w-max animate-marquee">
        {[...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS].map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-8">
            <item.icon className="h-4 w-4 text-brand-400" />
            <span className="whitespace-nowrap text-sm font-medium uppercase tracking-wide text-ink-200">
              {item.text}
            </span>
            <span className="text-ink-600">/</span>
          </div>
        ))}
      </div>
    </div>
  );
}
