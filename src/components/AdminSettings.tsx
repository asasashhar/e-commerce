import { useEffect, useState } from 'react';
import { Loader2, Save, Store, Mail, Phone, MapPin, FileText, Image as ImageIcon, Truck, Percent } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ShopSettings } from '@/lib/types';

export default function AdminSettings() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
    if (err) {
      setError(err.message);
    } else if (data) {
      setSettings(data as ShopSettings);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSaved(false);

    const { error: err } = await supabase.from('settings').update({
      shop_name: settings.shop_name,
      shop_email: settings.shop_email,
      shop_phone: settings.shop_phone,
      shop_address: settings.shop_address,
      about_title: settings.about_title,
      about_description: settings.about_description,
      about_image: settings.about_image,
      free_shipping_threshold: settings.free_shipping_threshold,
      tax_rate: settings.tax_rate,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);

    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  }

  if (error && !settings) {
    return <div className="px-6 py-10 text-center text-sm text-error-500">{error}</div>;
  }

  if (!settings) return null;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Shop Info */}
      <Section icon={Store} title="Shop Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Shop Name"><input type="text" value={settings.shop_name} onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })} className={inputCls} /></Field>
          <Field label="Shop Email"><input type="email" value={settings.shop_email} onChange={(e) => setSettings({ ...settings, shop_email: e.target.value })} className={inputCls} /></Field>
          <Field label="Phone"><input type="text" value={settings.shop_phone} onChange={(e) => setSettings({ ...settings, shop_phone: e.target.value })} className={inputCls} /></Field>
          <Field label="Address"><input type="text" value={settings.shop_address} onChange={(e) => setSettings({ ...settings, shop_address: e.target.value })} className={inputCls} /></Field>
        </div>
      </Section>

      {/* About Page */}
      <Section icon={FileText} title="About Page Content">
        <div className="space-y-4">
          <Field label="About Title"><input type="text" value={settings.about_title} onChange={(e) => setSettings({ ...settings, about_title: e.target.value })} className={inputCls} /></Field>
          <Field label="About Description"><textarea value={settings.about_description} onChange={(e) => setSettings({ ...settings, about_description: e.target.value })} rows={4} className={`${inputCls} resize-none`} /></Field>
          <Field label="About Image URL (optional)"><input type="text" value={settings.about_image ?? ''} onChange={(e) => setSettings({ ...settings, about_image: e.target.value })} className={inputCls} placeholder="https://..." /></Field>
          {settings.about_image && <img src={settings.about_image} alt="About preview" className="h-24 w-full rounded-xl border border-white/10 object-cover" />}
        </div>
      </Section>

      {/* Store Settings */}
      <Section icon={Truck} title="Store Configuration">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Free Shipping Threshold ($)"><input type="number" step="0.01" value={settings.free_shipping_threshold} onChange={(e) => setSettings({ ...settings, free_shipping_threshold: parseFloat(e.target.value) || 0 })} className={inputCls} /></Field>
          <Field label="Tax Rate (e.g. 0.08 for 8%)"><input type="number" step="0.0001" value={settings.tax_rate} onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) || 0 })} className={inputCls} /></Field>
        </div>
      </Section>

      {error && <p className="rounded-lg bg-error-500/10 px-4 py-2 text-sm text-error-500">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-400 active:scale-95 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
        </button>
        {saved && <span className="text-sm font-medium text-success-500 animate-fade-in">Settings saved!</span>}
      </div>
    </form>
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

function Section({ icon: Icon, title, children }: { icon: typeof Store; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-ink-900/50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400"><Icon className="h-4.5 w-4.5" /></div>
        <h3 className="font-display text-base font-bold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}
