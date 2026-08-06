import { useEffect, useState } from 'react';
import {
  Loader2, Plus, Trash2, Eye, EyeOff, ImageIcon,
  ArrowUp, ArrowDown, Save, X, Camera, ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LookbookItem {
  id: string;
  src: string;
  alt: string;
  span: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

const SPAN_OPTIONS = [
  { value: '', label: 'Normal (1×1)' },
  { value: 'row-span-2', label: 'Tall (1×2)' },
];

export default function AdminLookbook() {
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({ src: '', alt: '', span: '' });
  const [adding, setAdding] = useState(false);
  const [previewSrc, setPreviewSrc] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('lookbook_items')
      .select('*')
      .order('sort_order', { ascending: true });
    setItems((data as LookbookItem[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (item: LookbookItem) => {
    setSaving(item.id);
    await supabase
      .from('lookbook_items')
      .update({ active: !item.active })
      .eq('id', item.id);
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, active: !i.active } : i))
    );
    setSaving(null);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this lookbook photo?')) return;
    setSaving(id);
    await supabase.from('lookbook_items').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSaving(null);
  };

  const updateSpan = async (item: LookbookItem, span: string) => {
    setSaving(item.id);
    await supabase.from('lookbook_items').update({ span }).eq('id', item.id);
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, span } : i))
    );
    setSaving(null);
  };

  const updateAlt = async (item: LookbookItem, alt: string) => {
    setSaving(item.id);
    await supabase.from('lookbook_items').update({ alt }).eq('id', item.id);
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, alt } : i))
    );
    setSaving(null);
  };

  const moveItem = async (index: number, dir: 'up' | 'down') => {
    const newItems = [...items];
    const swapIdx = dir === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newItems.length) return;
    [newItems[index], newItems[swapIdx]] = [newItems[swapIdx], newItems[index]];

    // Update sort_order
    const updates = newItems.map((item, i) => ({ id: item.id, sort_order: i + 1 }));
    setItems(newItems.map((item, i) => ({ ...item, sort_order: i + 1 })));

    for (const u of updates) {
      await supabase.from('lookbook_items').update({ sort_order: u.sort_order }).eq('id', u.id);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.src.trim()) return;
    setAdding(true);
    const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) : 0;
    const { data } = await supabase
      .from('lookbook_items')
      .insert({ src: newItem.src.trim(), alt: newItem.alt.trim() || 'Lookbook photo', span: newItem.span, sort_order: maxOrder + 1, active: true })
      .select()
      .single();
    if (data) {
      setItems((prev) => [...prev, data as LookbookItem]);
      setNewItem({ src: '', alt: '', span: '' });
      setPreviewSrc('');
      setAddOpen(false);
    }
    setAdding(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Camera className="h-6 w-6 text-brand-400" /> Lookbook Manager
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            {items.filter((i) => i.active).length} active · {items.length} total photos
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-400 hover:scale-105"
          id="add-lookbook-photo-btn"
        >
          <Plus className="h-4 w-4" /> Add Photo
        </button>
      </div>

      {/* Add photo modal */}
      {addOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setAddOpen(false)} />
          <div className="relative z-10 w-full max-w-lg animate-scale-in rounded-3xl border border-white/10 bg-ink-900 p-6 shadow-2xl">
            <button onClick={() => setAddOpen(false)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-display text-xl font-bold text-white mb-5">Add Lookbook Photo</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Image URL *</label>
                <input
                  type="url"
                  value={newItem.src}
                  onChange={(e) => { setNewItem({ ...newItem, src: e.target.value }); setPreviewSrc(e.target.value); }}
                  placeholder="https://images.pexels.com/..."
                  required
                  className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
                />
              </div>

              {/* Preview */}
              {previewSrc && (
                <div className="overflow-hidden rounded-xl border border-white/10 aspect-[4/3] bg-ink-800">
                  <img src={previewSrc} alt="Preview" className="h-full w-full object-cover" onError={() => setPreviewSrc('')} />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Caption / Alt Text</label>
                  <input
                    type="text"
                    value={newItem.alt}
                    onChange={(e) => setNewItem({ ...newItem, alt: e.target.value })}
                    placeholder="Street style sneakers"
                    className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Grid Size</label>
                  <select
                    value={newItem.span}
                    onChange={(e) => setNewItem({ ...newItem, span: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
                  >
                    {SPAN_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={adding || !newItem.src.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-400 disabled:opacity-50"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add to Lookbook
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Photo grid / list */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/8 bg-ink-900/50 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <ImageIcon className="h-8 w-8 text-ink-600" />
          </div>
          <p className="font-display text-lg font-bold text-white">No photos yet</p>
          <p className="text-sm text-ink-400">Click "Add Photo" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                item.active ? 'border-white/8 bg-ink-900/50' : 'border-white/5 bg-ink-900/20 opacity-60'
              }`}
            >
              {/* Thumbnail */}
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/10">
                <img src={item.src} alt={item.alt} className="h-full w-full object-cover" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Alt text editable */}
                <input
                  type="text"
                  defaultValue={item.alt}
                  onBlur={(e) => e.target.value !== item.alt && updateAlt(item, e.target.value)}
                  placeholder="Caption..."
                  className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder-ink-500 border-b border-transparent focus:border-white/20"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={item.span}
                    onChange={(e) => updateSpan(item, e.target.value)}
                    className="rounded-lg border border-white/10 bg-ink-800 px-2 py-1 text-xs text-ink-300 outline-none focus:border-brand-500"
                  >
                    {SPAN_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <span className="text-xs text-ink-600">#{item.sort_order}</span>
                  <a href={item.src} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                    <ExternalLink className="h-3 w-3" /> View
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Reorder */}
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>

                {/* Toggle active */}
                <button
                  onClick={() => toggleActive(item)}
                  disabled={saving === item.id}
                  title={item.active ? 'Hide from lookbook' : 'Show in lookbook'}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    item.active ? 'text-success-500 hover:bg-success-500/10' : 'text-ink-500 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {saving === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : item.active ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteItem(item.id)}
                  disabled={saving === item.id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-error-500/10 hover:text-error-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview tip */}
      {items.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/8 bg-ink-900/30 px-4 py-3 text-xs text-ink-400">
          💡 <strong className="text-ink-200">Tip:</strong> Changes are saved instantly. Use the arrows to reorder photos in the gallery. Toggle the eye icon to show/hide photos without deleting them.
        </div>
      )}
    </div>
  );
}
