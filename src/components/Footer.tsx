import { ArrowUp, Share2, MessageSquareShare, Link2, ShieldCheck } from 'lucide-react';

const LINKS = {
  Shop: ['New Arrivals', 'Bestsellers', 'Running', 'Lifestyle', 'Sale'],
  Support: ['Shipping', 'Returns', 'Size Guide', 'Warranty', 'Contact'],
  Company: ['About Us', 'Sustainability', 'Careers', 'Press', 'Stores'],
};

interface FooterProps {
  onAdmin?: () => void;
  onTrack?: () => void;
}

export default function Footer({ onAdmin, onTrack }: FooterProps) {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink-950">
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-brand-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
          {/* Brand */}
          <div>
            <a href="#top" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-white">STRIDE</span>
              <span className="h-2 w-2 rounded-full bg-brand-500" />
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
              Performance footwear engineered for athletes, designed for the streets. Move with
              purpose.
            </p>
            <div className="mt-6 flex gap-3">
              {[Share2, MessageSquareShare, Link2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ink-300 transition-all duration-300 hover:border-brand-500 hover:bg-brand-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {Object.entries(LINKS).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-400">
                  {heading}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-ink-300 transition-colors hover:text-white"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} STRIDE. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-ink-500 transition-colors hover:text-white">
              Privacy
            </a>
            <a href="#" className="text-xs text-ink-500 transition-colors hover:text-white">
              Terms
            </a>
            {onAdmin && (
              <button
                onClick={onAdmin}
                className="flex items-center gap-1 text-xs text-ink-500 transition-colors hover:text-white"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </button>
            )}
            <a
              href="#top"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-ink-300 transition-all hover:border-brand-500 hover:text-white"
            >
              <ArrowUp className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
