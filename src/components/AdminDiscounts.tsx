import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Loader2, Tag, Save, Pencil, Percent, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Discount } from '@/lib/types';

const EMPTY_FORM = {
  code: '',
  description: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: '',
  expires_at: '',
};

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setDiscounts((data ?? []) as Discount[]);
    }
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (discount: Discount) => {
    setEditing(discount);
    setForm({
      code: discount.code,
      description: discount.description,
      type: discount.type,
      value: String(discount.value),
      expires_at: discount.expires_at ? discount.expires_at.slice(0, 10) : '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value) {
      setFormError('Code and value are required.');
      return;
    }
    setSaving(true);
    setFormError('');

    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description,
      type: form.type,
      value: parseFloat(form.value),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    let err: string | null = null;
    if (editing) {
      const { error: updateError } = await supabase.from('discounts').update(payload).eq('id', editing.id);
      err = updateError?.message ?? null;
    } else {
      const { error: insertError } = await supabase.from('discounts').insert(payload);
      err = insertError?.message ?? null;
    }

    if (err) {
      setFormError(err);
    } else {
      setShowForm(false);
      fetchDiscounts();
    }
    setSaving(false);
  };

  const toggleActive = async (discount: Discount) => {
    const { error: err } = await supabase.from('discounts').update({ active: !discount.active }).eq('id', discount.id);
    if (!err) fetchDiscounts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this discount code?')) return;
    const { error: err } = await supabase.from('discounts').delete().eq('id', id);
    if (!err) fetchDiscounts();
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
        <h2 className="font-display text-lg font-bold text-white">Discount Codes ({discounts.length})</h2>
        <button onClick={openNew} className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-400 active:scale-95">
          <Plus className="h-4 w-4" /> Create Discount
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {discounts.map((discount) => (
          <div key={discount.id} className="rounded-2xl border border-white/8 bg-ink-800/40 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                  {discount.type === 'percentage' ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-white">{discount.code}</p>
                  <p className="text-xs text-ink-500">{discount.type === 'percentage' ? `${discount.value}% off` : `$${discount.value} off`}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${discount.active ? 'bg-success-500/10 text-success-500' : 'bg-ink-700 text-ink-400'}`}>
                {discount.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {discount.description && <p className="mt-3 text-sm text-ink-300">{discount.description}</p>}
            {discount.expires_at && (
              <p className="mt-2 text-xs text-ink-500">Expires: {new Date(discount.expires_at).toLocaleDateString()}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button onClick={() => toggleActive(discount)} className="flex-1 rounded-lg border border-white/10 py-2 text-xs font-medium text-ink-300 transition-colors hover:border-white/30 hover:text-white">
                {discount.active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => openEdit(discount)} className="rounded-lg border border-white/10 px-3 py-2 text-ink-300 transition-colors hover:border-white/30 hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => handleDelete(discount.id)} className="rounded-lg border border-white/10 px-3 py-2 text-ink-300 transition-colors hover:border-error-500 hover:text-error-500"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
        {discounts.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/8 bg-ink-800/30 px-6 py-16 text-center">
            <Tag className="mx-auto h-10 w-10 text-ink-600" />
            <p className="mt-3 text-sm text-ink-400">No discount codes yet. Create one to offer deals to your customers.</p>
          </div>
        )}
      </div>

      {/* Discount form */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative z-10 w-full max-w-md animate-scale-in overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h3 className="font-display text-lg font-bold text-white">{editing ? 'Edit Discount' : 'New Discount'}</h3>
              <button onClick={() => setShowForm(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Code</label>
                  <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={inputCls} placeholder="SUMMER20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Description</label>
                  <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} placeholder="20% off summer collection" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })} className={inputCls}>
                      <option value="percentage" className="bg-ink-900">Percentage</option>
                      <option value="fixed" className="bg-ink-900">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Value</label>
                    <input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={inputCls} placeholder="20" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Expiry Date (optional)</label>
                  <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className={inputCls} />
                </div>
              </div>

              {formError && <p className="mt-4 rounded-lg bg-error-500/10 px-4 py-2 text-sm text-error-500">{formError}</p>}

              <button type="submit" disabled={saving} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-400 active:scale-95 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> {editing ? 'Save Changes' : 'Create Discount'}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500';
