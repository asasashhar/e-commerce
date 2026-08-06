import { useEffect, useState } from 'react';
import { X, Star, Check, ShoppingBag, Heart, Bell, Ruler, Send, Loader2 } from 'lucide-react';
import type { Product, ProductColor } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCurrency } from '@/context/CurrencyContext';
import { supabase } from '@/lib/supabase';
import SizeGuide from './SizeGuide';
import NotifyModal from './NotifyModal';

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: QuickViewProps) {
  const { add } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { format } = useCurrency();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<ProductColor | null>(null);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    if (product) {
      setSize(null);
      setColor(product.colors[0] ?? null);
      setAdded(false);
      setActiveImage(0);
      setShowReviewForm(false);
      setSubmitStatus('idle');
      // Load reviews
      setReviewsLoading(true);
      supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setReviews((data as Review[]) ?? []);
          setReviewsLoading(false);
        });
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [product, onClose]);

  if (!product) return null;
  const wishlisted = isWishlisted(product.id);

  const handleAdd = () => {
    if (!size || !color) return;
    add(product, size, color);
    setAdded(true);
    setTimeout(onClose, 800);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim()) return;
    setSubmitStatus('loading');
    const { data } = await supabase
      .from('reviews')
      .insert({
        product_id: product.id,
        reviewer_name: reviewForm.name.trim(),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim() || null,
      })
      .select()
      .single();
    if (data) {
      setReviews((prev) => [data as Review, ...prev]);
      setSubmitStatus('success');
      setShowReviewForm(false);
      setReviewForm({ name: '', rating: 5, comment: '' });
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : product.rating;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <div
          className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative z-10 w-full max-w-4xl animate-scale-in overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl max-h-[90vh] flex flex-col">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Wishlist button */}
          <button
            onClick={() => toggle(product)}
            className={`absolute right-16 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
              wishlisted
                ? 'bg-red-500/20 text-red-400'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-5 w-5 transition-all ${wishlisted ? 'fill-red-400' : ''}`} />
          </button>

          <div className="overflow-y-auto">
            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-ink-800 md:aspect-auto">
                <img
                  src={[product.image_url, ...(product.gallery ?? [])][activeImage] ?? product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover transition-opacity duration-300"
                />
                {product.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    {product.badge}
                  </span>
                )}
                {(product.gallery ?? []).length > 0 && (
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                    {[product.image_url, ...product.gallery].map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`h-12 w-12 overflow-hidden rounded-lg border-2 transition-all ${activeImage === i ? 'border-white' : 'border-white/20 opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col p-6 sm:p-8">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  {product.category}
                </span>
                <h2 className="mt-1 font-display text-3xl font-bold text-white">{product.name}</h2>

                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(avgRating)
                            ? 'fill-accent-500 text-accent-500'
                            : 'text-ink-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-ink-400">
                    {avgRating.toFixed(1)} ({reviews.length > 0 ? reviews.length : product.reviews} reviews)
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-ink-300">{product.description}</p>

                {/* Colors */}
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    Color {color && <span className="text-white">— {color.name}</span>}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setColor(c)}
                        className={`h-9 w-9 rounded-full border-2 transition-all duration-200 ${
                          color?.name === c.name
                            ? 'border-white scale-110'
                            : 'border-white/20 hover:border-white/50'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      Size {size && <span className="text-white">— US {size}</span>}
                    </p>
                    <button
                      onClick={() => setSizeGuideOpen(true)}
                      className="flex items-center gap-1 text-xs text-brand-400 transition-colors hover:text-brand-300"
                      id="size-guide-btn"
                    >
                      <Ruler className="h-3.5 w-3.5" /> Size Guide
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`min-w-11 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                          size === s
                            ? 'border-white bg-white text-ink-950'
                            : 'border-white/15 text-ink-200 hover:border-white/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price + CTA */}
                <div className="mt-auto pt-6">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-bold text-white">
                      {format(product.price)}
                    </span>
                    {product.in_stock ? (
                      <button
                        onClick={handleAdd}
                        disabled={!size}
                        className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                          !size
                            ? 'cursor-not-allowed bg-white/10 text-ink-500'
                            : added
                              ? 'bg-success-500 text-white'
                              : 'bg-brand-500 text-white hover:scale-105 hover:bg-brand-400 active:scale-95'
                        }`}
                      >
                        {added ? (
                          <><Check className="h-4 w-4" /> Added!</>
                        ) : (
                          <><ShoppingBag className="h-4 w-4" />{size ? 'Add To Cart' : 'Select Size'}</>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setNotifyOpen(true)}
                        className="flex items-center gap-2 rounded-full border border-brand-500/50 bg-brand-500/10 px-6 py-3 text-sm font-semibold text-brand-400 transition-all hover:bg-brand-500/20"
                      >
                        <Bell className="h-4 w-4" /> Notify Me
                      </button>
                    )}
                  </div>
                  {!size && product.in_stock && (
                    <p className="mt-2 text-xs text-ink-500">Select a size to continue</p>
                  )}
                  {!product.in_stock && (
                    <p className="mt-2 text-xs text-error-500">Currently out of stock</p>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-white/10 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-white">
                  Customer Reviews
                  {reviews.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-ink-400">({reviews.length})</span>
                  )}
                </h3>
                {!showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-ink-300 transition-all hover:border-brand-500 hover:text-white"
                    id="write-review-btn"
                  >
                    <Star className="h-3.5 w-3.5" /> Write a Review
                  </button>
                )}
              </div>

              {/* Review form */}
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="mt-4 animate-fade-in rounded-2xl border border-white/10 bg-ink-800/50 p-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Your Name</label>
                      <input
                        type="text"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        placeholder="Alex Morgan"
                        required
                        className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Rating</label>
                      <div className="flex gap-1 py-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                s <= reviewForm.rating ? 'fill-accent-500 text-accent-500' : 'text-ink-600 hover:text-accent-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Comment (optional)</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Share your experience with this shoe…"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitStatus === 'loading'}
                      className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-400 disabled:opacity-60"
                    >
                      {submitStatus === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Submit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-ink-400 transition-colors hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews list */}
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="mt-6 text-center py-8 rounded-2xl border border-white/8 bg-ink-800/30">
                  <Star className="mx-auto h-8 w-8 text-ink-600" />
                  <p className="mt-3 text-sm text-ink-400">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="mt-5 space-y-4 max-h-80 overflow-y-auto pr-1">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-white/8 bg-ink-800/40 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{review.reviewer_name}</p>
                          <div className="mt-0.5 flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-accent-500 text-accent-500' : 'text-ink-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-ink-500">
                          {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm leading-relaxed text-ink-300">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SizeGuide open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
      {notifyOpen && (
        <NotifyModal productId={product.id} productName={product.name} onClose={() => setNotifyOpen(false)} />
      )}
    </>
  );
}
