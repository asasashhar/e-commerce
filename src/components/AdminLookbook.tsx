import { useState, useEffect } from 'react';
import { Plus, Trash2, Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { LookbookItem } from '@/lib/types';

export default function AdminLookbook() {
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ image_url: '', alt_text: '', span: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lookbook_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch lookbook items:', error);
    } else {
      setItems(data as LookbookItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const { error: insertError } = await supabase.from('lookbook_items').insert({
      image_url: form.image_url,
      alt_text: form.alt_text,
      span: form.span,
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setForm({ image_url: '', alt_text: '', span: '' });
    setShowAdd(false);
    setSubmitting(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    await supabase.from('lookbook_items').delete().eq('id', id);
    fetchItems();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white">Lookbook Images</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
        >
          {showAdd ? 'Cancel' : <><Plus className="h-4 w-4" /> Add Image</>}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="animate-fade-in space-y-4 rounded-3xl border border-white/10 bg-ink-900/50 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
                Image URL
              </label>
              <input
                required
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
                Alt Text (Description)
              </label>
              <input
                required
                type="text"
                value={form.alt_text}
                onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-500"
                placeholder="Street style sneakers..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
                Grid Span (Optional)
              </label>
              <select
                value={form.span}
                onChange={(e) => setForm({ ...form, span: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="">Normal (1 row)</option>
                <option value="row-span-2">Tall (2 rows)</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-error-500">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-400 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Save Image
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={item.image_url} alt={item.alt_text} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-4">
              <p className="truncate text-sm font-medium text-white">{item.alt_text}</p>
              <p className="mt-1 text-xs text-ink-500">Span: {item.span || 'Normal'}</p>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-ink-300 opacity-0 backdrop-blur-md transition-all hover:bg-error-500 hover:text-white group-hover:opacity-100"
              title="Delete Image"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 py-16 text-center">
            <ImageIcon className="h-10 w-10 text-ink-600 mb-3" />
            <p className="text-sm text-ink-400">No lookbook images found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
