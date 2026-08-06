import { useEffect, useState } from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideProps {
  open: boolean;
  onClose: () => void;
}

const MEN_SIZES = [
  { us: '6',   eu: '39', uk: '5.5', cm: '24.0' },
  { us: '6.5', eu: '39.5', uk: '6', cm: '24.5' },
  { us: '7',   eu: '40', uk: '6.5', cm: '25.0' },
  { us: '7.5', eu: '40.5', uk: '7', cm: '25.5' },
  { us: '8',   eu: '41', uk: '7.5', cm: '26.0' },
  { us: '8.5', eu: '42', uk: '8',   cm: '26.5' },
  { us: '9',   eu: '42.5', uk: '8.5', cm: '27.0' },
  { us: '9.5', eu: '43', uk: '9',   cm: '27.5' },
  { us: '10',  eu: '44', uk: '9.5', cm: '28.0' },
  { us: '10.5',eu: '44.5', uk: '10', cm: '28.5' },
  { us: '11',  eu: '45', uk: '10.5', cm: '29.0' },
  { us: '12',  eu: '46', uk: '11.5', cm: '30.0' },
  { us: '13',  eu: '47', uk: '12.5', cm: '31.0' },
];

const WOMEN_SIZES = [
  { us: '5',   eu: '35.5', uk: '3',   cm: '22.0' },
  { us: '5.5', eu: '36',   uk: '3.5', cm: '22.5' },
  { us: '6',   eu: '36.5', uk: '4',   cm: '23.0' },
  { us: '6.5', eu: '37',   uk: '4.5', cm: '23.5' },
  { us: '7',   eu: '37.5', uk: '5',   cm: '24.0' },
  { us: '7.5', eu: '38',   uk: '5.5', cm: '24.5' },
  { us: '8',   eu: '38.5', uk: '6',   cm: '25.0' },
  { us: '8.5', eu: '39',   uk: '6.5', cm: '25.5' },
  { us: '9',   eu: '40',   uk: '7',   cm: '26.0' },
  { us: '9.5', eu: '40.5', uk: '7.5', cm: '26.5' },
  { us: '10',  eu: '41',   uk: '8',   cm: '27.0' },
  { us: '11',  eu: '42',   uk: '9',   cm: '28.0' },
];

export default function SizeGuide({ open, onClose }: SizeGuideProps) {
  const [tab, setTab] = useState<'men' | 'women'>('men');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = tab === 'men' ? MEN_SIZES : WOMEN_SIZES;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-scale-in overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-brand-400" />
            <h2 className="font-display text-xl font-bold text-white">Size Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 px-6 py-3">
          {(['men', 'women'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-1.5 text-sm font-semibold capitalize transition-all duration-200 ${
                tab === t
                  ? 'bg-brand-500 text-white'
                  : 'text-ink-400 hover:text-white'
              }`}
            >
              {t === 'men' ? "Men's" : "Women's"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="max-h-[55vh] overflow-y-auto p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['US', 'EU', 'UK', 'CM'].map((h) => (
                  <th key={h} className="pb-3 text-center text-xs font-semibold uppercase tracking-wider text-ink-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map((row, i) => (
                <tr
                  key={row.us}
                  className={`border-b border-white/5 transition-colors hover:bg-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                >
                  <td className="py-2.5 text-center font-medium text-white">{row.us}</td>
                  <td className="py-2.5 text-center text-ink-300">{row.eu}</td>
                  <td className="py-2.5 text-center text-ink-300">{row.uk}</td>
                  <td className="py-2.5 text-center text-ink-300">{row.cm}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4 rounded-xl border border-white/8 bg-ink-800/50 px-4 py-3 text-xs text-ink-400">
            💡 <strong className="text-ink-200">Tip:</strong> If you're between sizes, we recommend sizing up for a comfortable fit.
            For narrow feet, size down.
          </p>
        </div>
      </div>
    </div>
  );
}
