import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Star, ImagePlus, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, ProductColor } from '@/lib/types';

const CATEGORIES = ['Running', 'Lifestyle', 'Basketball', 'Trail'];
const DEFAULT_SIZES = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'];

interface ProductForm {
  name: string;
  brand: string;
  description: string;
  price: string;
  image_url: string;
  gallery: string[];
  colors: ProductColor[];
  sizes: string[];
  category: string;
  rating: string;
  reviews: string;
  badge: string;
  featured: boolean;
  in_stock: boolean;
  stock_count: string;
}

const EMPTY_FORM: ProductForm = {
  name: '',
  brand: 'STRIDE',
  description: '',
  price: '',
  image_url: '',
  gallery: [],
  colors: [{ name: 'Black', hex: '#1f2937' }],
  sizes: DEFAULT_SIZES,
  category: 'Lifestyle',
  rating: '4.5',
  reviews: '0',
  badge: '',
  featured: false,
  in_stock: true,
  stock_count: '50',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setProducts((data ?? []) as Product[]);
    }
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: String(product.price),
      image_url: product.image_url,
      gallery: product.gallery ?? [],
      colors: product.colors ?? [],
      sizes: product.sizes ?? [],
      category: product.category,
      rating: String(product.rating),
      reviews: String(product.reviews),
      badge: product.badge ?? '',
      featured: product.featured,
      in_stock: product.in_stock,
      stock_count: String(product.stock_count ?? 0),
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.image_url) {
      setFormError('Name, price, and main image are required.');
      return;
    }
    setSaving(true);
    setFormError('');

    const payload = {
      name: form.name,
      brand: form.brand,
      description: form.description,
      price: parseFloat(form.price),
      image_url: form.image_url,
      gallery: form.gallery,
      colors: form.colors,
      sizes: form.sizes,
      category: form.category,
      rating: parseFloat(form.rating) || 4.5,
      reviews: parseInt(form.reviews) || 0,
      badge: form.badge || null,
      featured: form.featured,
      in_stock: form.in_stock,
      stock_count: parseInt(form.stock_count) || 0,
    };

    let err: string | null = null;
    if (editing) {
      const { error: updateError } = await supabase.from('products').update(payload).eq('id', editing.id);
      err = updateError?.message ?? null;
    } else {
      const { error: insertError } = await supabase.from('products').insert(payload);
      err = insertError?.message ?? null;
    }

    if (err) {
      setFormError(err);
    } else {
      setShowForm(false);
      fetchProducts();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    const { error: err } = await supabase.from('products').delete().eq('id', id);
    if (!err) fetchProducts();
  };

  const addGalleryImage = () => setForm({ ...form, gallery: [...form.gallery, ''] });
  const updateGalleryImage = (i: number, url: string) => setForm({ ...form, gallery: form.gallery.map((g, idx) => (idx === i ? url : g)) });
  const removeGalleryImage = (i: number) => setForm({ ...form, gallery: form.gallery.filter((_, idx) => idx !== i) });

  const addColor = () => setForm({ ...form, colors: [...form.colors, { name: '', hex: '#000000' }] });
  const updateColor = (i: number, field: keyof ProductColor, value: string) => setForm({ ...form, colors: form.colors.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)) });
  const removeColor = (i: number) => setForm({ ...form, colors: form.colors.filter((_, idx) => idx !== i) });

  const toggleSize = (size: string) => {
    setForm({
      ...form,
      sizes: form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size].sort((a, b) => parseFloat(a) - parseFloat(b)),
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  }

  if (error) {
    return <div className="px-6 py-10 text-center text-sm text-error-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">Products ({products.length})</h2>
        <button onClick={openNew} className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-400 active:scale-95">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Product grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="group overflow-hidden rounded-2xl border border-white/8 bg-ink-800/40">
            <div className="relative aspect-square overflow-hidden">
              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
              {product.badge && <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white">{product.badge}</span>}
              <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button onClick={() => openEdit(product)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-900 transition-transform hover:scale-110"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(product.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-error-500/90 text-white transition-transform hover:scale-110"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-ink-500">{product.category}</span>
                <div className="flex items-center gap-1"><Star className="h-3 w-3 fill-accent-500 text-accent-500" /><span className="text-xs text-ink-300">{product.rating}</span></div>
              </div>
              <h3 className="mt-1 font-display text-base font-bold text-white">{product.name}</h3>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-display text-lg font-bold text-white">${product.price}</span>
                <div className="flex gap-1">
                  {product.colors.slice(0, 4).map((c) => <span key={c.name} className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />)}
                </div>
              </div>
              {product.gallery && product.gallery.length > 0 && (
                <p className="mt-2 text-xs text-ink-500">{product.gallery.length} additional image{product.gallery.length > 1 ? 's' : ''}</p>
              )}
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${(product.stock_count ?? 0) > 0 ? 'bg-success-500' : 'bg-error-500'}`} />
                <span className="text-xs text-ink-400">{(product.stock_count ?? 0)} in stock</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative z-10 w-full max-w-2xl animate-scale-in overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h3 className="font-display text-lg font-bold text-white">{editing ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setShowForm(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="max-h-[75vh] overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name"><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Aero Pulse Pro" /></Field>
                <Field label="Price ($"><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} placeholder="189" /></Field>
                <Field label="Brand"><input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputCls} /></Field>
                <Field label="Category">
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                    {CATEGORIES.map((c) => <option key={c} value={c} className="bg-ink-900">{c}</option>)}
                  </select>
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="Engineered for speed..." /></Field>
              </div>

              <div className="mt-4">
                <Field label="Main Image URL"><input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputCls} placeholder="https://..." /></Field>
                {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-24 w-24 rounded-xl border border-white/10 object-cover" />}
              </div>

              {/* Gallery */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Gallery Images</label>
                  <button type="button" onClick={addGalleryImage} className="flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300"><ImagePlus className="h-3.5 w-3.5" /> Add</button>
                </div>
                <div className="mt-2 space-y-2">
                  {form.gallery.map((url, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="text" value={url} onChange={(e) => updateGalleryImage(i, e.target.value)} className={inputCls} placeholder="https://..." />
                      {url && <img src={url} alt="" className="h-9 w-9 rounded-lg border border-white/10 object-cover" />}
                      <button type="button" onClick={() => removeGalleryImage(i)} className="text-ink-500 hover:text-error-500"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                  {form.gallery.length === 0 && <p className="text-xs text-ink-500">No additional images. Click "Add" to include more.</p>}
                </div>
              </div>

              {/* Colors */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Colors</label>
                  <button type="button" onClick={addColor} className="flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300"><Plus className="h-3.5 w-3.5" /> Add</button>
                </div>
                <div className="mt-2 space-y-2">
                  {form.colors.map((color, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="text" value={color.name} onChange={(e) => updateColor(i, 'name', e.target.value)} className={inputCls} placeholder="Color name" />
                      <input type="color" value={color.hex} onChange={(e) => updateColor(i, 'hex', e.target.value)} className="h-10 w-12 rounded-lg border border-white/10 bg-ink-800" />
                      <button type="button" onClick={() => removeColor(i)} className="text-ink-500 hover:text-error-500"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Available Sizes</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DEFAULT_SIZES.map((size) => (
                    <button key={size} type="button" onClick={() => toggleSize(size)} className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${form.sizes.includes(size) ? 'border-white bg-white text-ink-950' : 'border-white/15 text-ink-400 hover:border-white/30'}`}>{size}</button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Rating (0-5)"><input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className={inputCls} /></Field>
                <Field label="Reviews"><input type="number" value={form.reviews} onChange={(e) => setForm({ ...form, reviews: e.target.value })} className={inputCls} /></Field>
                <Field label="Badge (optional)"><input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className={inputCls} placeholder="New, Bestseller..." /></Field>
                <Field label="Stock Count"><input type="number" value={form.stock_count} onChange={(e) => setForm({ ...form, stock_count: e.target.value })} className={inputCls} placeholder="50" /></Field>
              </div>

              <div className="mt-4 flex gap-6">
                <label className="flex items-center gap-2 text-sm text-ink-200"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-brand-500" /> Featured</label>
                <label className="flex items-center gap-2 text-sm text-ink-200"><input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} className="h-4 w-4 accent-brand-500" /> In Stock</label>
              </div>

              {formError && <p className="mt-4 rounded-lg bg-error-500/10 px-4 py-2 text-sm text-error-500">{formError}</p>}

              <button type="submit" disabled={saving} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-400 active:scale-95 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> {editing ? 'Save Changes' : 'Create Product'}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</label>
      {children}
    </div>
  );
}
