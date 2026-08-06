import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { useReveal } from '@/hooks/useReveal';

interface ProductGridProps {
  products: Product[];
  onQuickView: (product: Product) => void;
}

const CATEGORIES = ['All', 'Running', 'Lifestyle', 'Basketball', 'Trail'];
const SIZES = ['6', '7', '8', '9', '10', '11', '12'];

export default function ProductGrid({ products, onQuickView }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState(500);
  const [showFilters, setShowFilters] = useState(false);
  const { ref, visible } = useReveal<HTMLDivElement>();

  const filtered = useMemo(() => {
    let list = products;

    // Category filter
    if (activeCategory !== 'All') {
      list = list.filter((p) => p.category === activeCategory);
    }

    // Search filter
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Size filter
    if (sizeFilter) {
      list = list.filter((p) => p.sizes.includes(sizeFilter));
    }

    // Price filter
    list = list.filter((p) => p.price <= maxPrice);

    return list;
  }, [products, activeCategory, search, sizeFilter, maxPrice]);

  const hasActiveFilters = search || sizeFilter || maxPrice < 500;
  const minProductPrice = products.length ? Math.min(...products.map((p) => p.price)) : 0;
  const maxProductPrice = products.length ? Math.max(...products.map((p) => p.price)) : 500;

  const clearFilters = () => {
    setSearch('');
    setSizeFilter('');
    setMaxPrice(maxProductPrice || 500);
    setActiveCategory('All');
  };

  return (
    <section id="shop" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''}`}>
        {/* Section header */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">
              The Collection
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Find Your Pair
            </h2>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-white text-ink-950'
                    : 'border border-white/10 text-ink-300 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search + Filters bar */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shoes, brands, categories…"
              id="product-search-input"
              className="w-full rounded-2xl border border-white/10 bg-ink-900/60 py-3 pl-11 pr-10 text-sm text-white placeholder-ink-500 outline-none transition-all focus:border-brand-500 focus:bg-ink-900 backdrop-blur-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-medium transition-all duration-200 ${
              showFilters || hasActiveFilters
                ? 'border-brand-500 bg-brand-500/10 text-white'
                : 'border-white/10 text-ink-300 hover:border-white/30 hover:text-white'
            }`}
            id="filter-toggle-btn"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                !
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-ink-400 transition-colors hover:text-white"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-4 animate-fade-in rounded-2xl border border-white/10 bg-ink-900/60 p-5 backdrop-blur-sm">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Size filter */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Size (US)
                </p>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSizeFilter(sizeFilter === s ? '' : s)}
                      className={`min-w-10 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                        sizeFilter === s
                          ? 'border-brand-500 bg-brand-500/15 text-white'
                          : 'border-white/10 text-ink-300 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Max Price — <span className="text-white">${maxPrice}</span>
                </p>
                <input
                  type="range"
                  min={minProductPrice || 0}
                  max={maxProductPrice || 500}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-500"
                  id="price-range-slider"
                />
                <div className="mt-1 flex justify-between text-xs text-ink-500">
                  <span>${minProductPrice}</span>
                  <span>${maxProductPrice}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-ink-500">
          <span className="font-semibold text-white">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {/* Product grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} onQuickView={onQuickView} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
            <Search className="h-8 w-8 text-ink-600" />
          </div>
          <p className="font-display text-xl font-bold text-white">No shoes found</p>
          <p className="text-sm text-ink-400">Try adjusting your search or filters.</p>
          <button
            onClick={clearFilters}
            className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-400"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
}
