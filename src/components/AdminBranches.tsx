import { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  Compass,
  Building2,
  Store,
  Navigation,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Camera
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Branch } from '@/lib/types';

interface BranchForm {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  google_maps_url: string;
  google_maps_embed: string;
  opening_hours: string;
  images: string[];
  is_flagship: boolean;
  active: boolean;
}

const EMPTY_FORM: BranchForm = {
  name: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  google_maps_url: '',
  google_maps_embed: '',
  opening_hours: 'Mon - Sat: 10:00 AM - 9:00 PM | Sun: 11:00 AM - 7:00 PM',
  images: [],
  is_flagship: false,
  active: true,
};

export default function AdminBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchForm>(EMPTY_FORM);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBranches(data as Branch[]);
    }
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setNewImageUrl('');
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setForm({
      name: branch.name,
      city: branch.city,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      google_maps_url: branch.google_maps_url,
      google_maps_embed: branch.google_maps_embed || '',
      opening_hours: branch.opening_hours,
      images: Array.isArray(branch.images) ? [...branch.images] : [],
      is_flagship: branch.is_flagship,
      active: branch.active,
    });
    setNewImageUrl('');
    setFormError('');
    setShowForm(true);
  };

  const addImageToForm = () => {
    if (!newImageUrl.trim()) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  const removeImageFromForm = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) {
      setFormError('Branch name and physical address are required.');
      return;
    }

    setSaving(true);
    setFormError('');

    // Generate clean Google Maps URL if empty
    const mapsUrl = form.google_maps_url.trim()
      ? form.google_maps_url.trim()
      : `https://maps.google.com/?q=${encodeURIComponent(`${form.name}, ${form.address}`)}`;

    // Generate embed URL if empty
    const embedUrl = form.google_maps_embed.trim()
      ? form.google_maps_embed.trim()
      : `https://maps.google.com/maps?q=${encodeURIComponent(form.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

    // Ensure we also grab any url still typed in the newImageUrl input
    let finalImages = [...form.images];
    if (newImageUrl.trim() && !finalImages.includes(newImageUrl.trim())) {
      finalImages.push(newImageUrl.trim());
    }

    const payload = {
      name: form.name.trim(),
      city: form.city.trim() || 'Store Location',
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      google_maps_url: mapsUrl,
      google_maps_embed: embedUrl,
      opening_hours: form.opening_hours.trim() || 'Mon - Sun: 10:00 AM - 8:00 PM',
      images: finalImages,
      is_flagship: form.is_flagship,
      active: form.active,
    };

    let err: string | null = null;
    if (editing) {
      const { error: updateError } = await supabase
        .from('branches')
        .update(payload)
        .eq('id', editing.id);
      err = updateError?.message ?? null;
    } else {
      const { error: insertError } = await supabase.from('branches').insert(payload);
      err = insertError?.message ?? null;
    }

    if (err) {
      setFormError(err);
    } else {
      setShowForm(false);
      fetchBranches();
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deletingBranch) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('branches').delete().eq('id', deletingBranch.id);
      if (!error) {
        setBranches((prev) => prev.filter((b) => b.id !== deletingBranch.id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
      setDeletingBranch(null);
    }
  };

  const toggleStatus = async (branch: Branch) => {
    const newStatus = !branch.active;
    setBranches((prev) =>
      prev.map((b) => (b.id === branch.id ? { ...b, active: newStatus } : b))
    );
    await supabase.from('branches').update({ active: newStatus }).eq('id', branch.id);
  };

  const filtered = branches.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q) ||
      b.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search branches by name, city, address..."
            className="w-full rounded-xl border border-white/10 bg-ink-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500"
          />
        </div>

        <button
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all duration-200 hover:bg-brand-400 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Branch
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-ink-400">Total Branches</p>
              <p className="font-display text-2xl font-bold text-white">{branches.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-ink-400">Active Stores</p>
              <p className="font-display text-2xl font-bold text-white">
                {branches.filter((b) => b.active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-ink-400">Flagship Locations</p>
              <p className="font-display text-2xl font-bold text-white">
                {branches.filter((b) => b.is_flagship).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Branches List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-ink-900/40 py-16 text-center">
          <Building2 className="h-12 w-12 text-ink-500" />
          <h3 className="mt-4 font-display text-lg font-bold text-white">No Branches Found</h3>
          <p className="mt-1 text-sm text-ink-400">
            {search ? 'Try adjusting your search filter.' : 'Click "Add Branch" above to create your first store location.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((branch) => {
            const isPreviewOpen = activePreviewId === branch.id;
            const branchImages = Array.isArray(branch.images) ? branch.images : [];

            return (
              <div
                key={branch.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-ink-900/70 p-6 backdrop-blur-xl transition-all duration-300 hover:border-brand-500/40"
              >
                <div>
                  {/* Branch Photo Gallery Thumbnail Strip */}
                  {branchImages.length > 0 && (
                    <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-ink-950">
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink-900">
                        <img
                          src={branchImages[0]}
                          alt={branch.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-black/20" />
                        
                        {/* Photo count indicator */}
                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                          <Camera className="h-3 w-3 text-brand-400" />
                          <span>{branchImages.length} photo{branchImages.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {/* Small thumbs if multiple */}
                      {branchImages.length > 1 && (
                        <div className="flex gap-1.5 p-2 bg-ink-900/90 overflow-x-auto no-scrollbar">
                          {branchImages.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt=""
                              className="h-10 w-14 shrink-0 rounded-lg object-cover border border-white/10"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                          {branch.name}
                        </h3>
                        {branch.is_flagship && (
                          <span className="rounded-full bg-accent-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-400 border border-accent-500/30">
                            Flagship
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleStatus(branch)}
                          className={`cursor-pointer rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
                            branch.active
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-ink-700/50 text-ink-400 border border-white/10 hover:bg-ink-700'
                          }`}
                          title="Click to toggle status"
                        >
                          {branch.active ? '● Active' : '○ Inactive'}
                        </button>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-brand-400">
                        <Compass className="h-3.5 w-3.5" />
                        {branch.city}
                      </p>
                    </div>

                    {/* Edit & In-App Delete Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(branch)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-ink-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        title="Edit Branch"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingBranch(branch)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-error-500/10 text-error-400 hover:bg-error-500/20 hover:text-error-300 transition-colors cursor-pointer"
                        title="Delete Branch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Branch Details */}
                  <div className="mt-4 space-y-2.5 border-t border-white/5 pt-4 text-xs text-ink-300">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 shrink-0 text-brand-400 mt-0.5" />
                      <span className="leading-relaxed">{branch.address}</span>
                    </div>

                    {branch.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone className="h-4 w-4 shrink-0 text-ink-400" />
                        <a href={`tel:${branch.phone}`} className="hover:text-white transition-colors">
                          {branch.phone}
                        </a>
                      </div>
                    )}

                    {branch.email && (
                      <div className="flex items-center gap-2.5">
                        <Mail className="h-4 w-4 shrink-0 text-ink-400" />
                        <a href={`mailto:${branch.email}`} className="hover:text-white transition-colors">
                          {branch.email}
                        </a>
                      </div>
                    )}

                    {branch.opening_hours && (
                      <div className="flex items-start gap-2.5">
                        <Clock className="h-4 w-4 shrink-0 text-ink-400 mt-0.5" />
                        <span className="leading-relaxed">{branch.opening_hours}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Google Map Section */}
                <div className="mt-5 border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePreviewId(isPreviewOpen ? null : branch.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-ink-200 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                    >
                      <Navigation className="h-3.5 w-3.5 text-brand-400" />
                      {isPreviewOpen ? 'Hide Map' : 'Preview Google Map'}
                    </button>

                    {branch.google_maps_url && (
                      <a
                        href={branch.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 hover:underline transition-colors cursor-pointer"
                      >
                        Open in Google Maps
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Embedded Google Map Preview */}
                  {isPreviewOpen && (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-ink-950 animate-fade-in">
                      <iframe
                        title={`Google Map - ${branch.name}`}
                        src={
                          branch.google_maps_embed ||
                          `https://maps.google.com/maps?q=${encodeURIComponent(branch.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`
                        }
                        className="h-56 w-full border-0"
                        loading="lazy"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal (Guaranteed working without window.confirm) */}
      {deletingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setDeletingBranch(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-ink-900 p-6 shadow-2xl animate-scale-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-error-500/20 text-error-400 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Delete Branch Location?</h3>
            <p className="mt-2 text-sm text-ink-300">
              Are you sure you want to remove <span className="text-white font-semibold">{deletingBranch.name}</span> located at{' '}
              <span className="text-ink-200">{deletingBranch.address}</span>? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingBranch(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-ink-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-error-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-error-500/20 hover:bg-error-400 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Yes, Delete Branch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal with Multi-Image Support */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowForm(false)}
          />

          <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-ink-900 p-6 sm:p-8 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  {editing ? 'Edit Branch Location' : 'Add New KINGWEAR Branch'}
                </h2>
                <p className="text-xs text-ink-400 mt-0.5">
                  Configure store photos, address, contact details, and Google Maps pin
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-4">
              {formError && (
                <div className="rounded-xl border border-error-500/20 bg-error-500/10 p-3 text-xs text-error-400">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1.5">
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. KINGWEAR Fifth Ave Flagship"
                    className="w-full rounded-xl border border-white/10 bg-ink-800 px-3.5 py-2.5 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1.5">
                    City / Region *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. New York, NY"
                    className="w-full rounded-xl border border-white/10 bg-ink-800 px-3.5 py-2.5 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1.5">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. 720 5th Ave, New York, NY 10019"
                  className="w-full rounded-xl border border-white/10 bg-ink-800 px-3.5 py-2.5 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
                />
              </div>

              {/* MULTI-IMAGE MANAGEMENT SECTION */}
              <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-4 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-300">
                  Branch Photos & Showroom Images
                </label>
                <p className="text-xs text-ink-400">
                  Add multiple photos of the store exterior, interior displays, and entrance.
                </p>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Paste image URL (e.g. https://images.pexels.com/...)"
                    className="flex-1 rounded-xl border border-white/10 bg-ink-800 px-3.5 py-2 text-xs text-white placeholder-ink-500 outline-none focus:border-brand-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImageToForm();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addImageToForm}
                    disabled={!newImageUrl.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Photo
                  </button>
                </div>

                {/* Thumbnail Previews */}
                {form.images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 pt-2">
                    {form.images.map((url, i) => (
                      <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-ink-950">
                        <img src={url} alt={`Branch ${i + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImageFromForm(i)}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-error-500 transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 rounded bg-brand-500/80 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/10 py-3 px-4 text-xs text-ink-500">
                    <ImageIcon className="h-4 w-4 text-ink-600" />
                    <span>No photos added yet. Enter a URL above and click "Add Photo".</span>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (212) 555-0199"
                    className="w-full rounded-xl border border-white/10 bg-ink-800 px-3.5 py-2.5 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1.5">
                    Branch Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="fifthave@kingwear.com"
                    className="w-full rounded-xl border border-white/10 bg-ink-800 px-3.5 py-2.5 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1.5">
                  Google Maps URL
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                  <input
                    type="url"
                    value={form.google_maps_url}
                    onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full rounded-xl border border-white/10 bg-ink-800 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
                  />
                </div>
                <p className="mt-1 text-[11px] text-ink-500">
                  Leave empty to auto-generate a Google Maps direct link from the address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1.5">
                  Google Maps Embed Iframe URL (Optional)
                </label>
                <input
                  type="text"
                  value={form.google_maps_embed}
                  onChange={(e) => setForm({ ...form, google_maps_embed: e.target.value })}
                  placeholder="https://maps.google.com/maps?q=...&output=embed"
                  className="w-full rounded-xl border border-white/10 bg-ink-800 px-3.5 py-2.5 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1.5">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={form.opening_hours}
                  onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
                  placeholder="Mon - Sat: 10:00 AM - 9:00 PM | Sun: 11:00 AM - 7:00 PM"
                  className="w-full rounded-xl border border-white/10 bg-ink-800 px-3.5 py-2.5 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_flagship}
                    onChange={(e) => setForm({ ...form, is_flagship: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-ink-800 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-white">Flagship Store</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-ink-800 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-white">Active Location</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-ink-300 hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-400 disabled:opacity-50 cursor-pointer"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? 'Update Branch' : 'Add Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
