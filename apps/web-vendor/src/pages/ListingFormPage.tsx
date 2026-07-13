import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Loader2, Plus, X } from 'lucide-react';

import { getListing, createListing, updateListing, type VendorListing } from '../lib/api';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending review' },
  { value: 'paused', label: 'Paused' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'km', label: 'Khmer' },
  { value: 'fr', label: 'French' },
  { value: 'zh', label: 'Chinese' },
];

export default function ListingFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [cities, setCities] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{
    title: string;
    category_id: string;
    city_id: string;
    description: string;
    duration_minutes: string;
    min_group: string;
    max_group: string;
    base_price_usd: string;
    status: string;
    is_instant_book: boolean;
    spoken_languages: string[];
    meeting_point_address: string;
    inclusions: string;
    exclusions: string;
    itinerary: Array<{ time: string; description: string }>;
  }>({
    title: '',
    category_id: '',
    city_id: '',
    description: '',
    duration_minutes: '180',
    min_group: '1',
    max_group: '8',
    base_price_usd: '',
    status: 'draft',
    is_instant_book: true,
    spoken_languages: ['en'],
    meeting_point_address: '',
    inclusions: '',
    exclusions: '',
    itinerary: [{ time: '', description: '' }],
  });

  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<VendorListing['gallery']>([]);
  const [removedGalleryIds, setRemovedGalleryIds] = useState<number[]>([]);

  useEffect(() => {
    loadLookups();
    if (isEdit) {
      loadListing(Number(id));
    }
  }, [id]);

  const loadLookups = async () => {
    try {
      const [catRes, cityRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'}/api/public/categories`),
        fetch(`${import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'}/api/public/cities`),
      ]);
      const cats = await catRes.json();
      const cits = await cityRes.json();
      setCategories(cats.data ?? cats);
      setCities(cits.data ?? cits);
    } catch {
      // silent fail for lookups
    }
  };

  const loadListing = async (listingId: number) => {
    try {
      setLoading(true);
      const listing = await getListing(listingId);
      setForm({
        title: listing.title,
        category_id: String(listing.category?.id ?? ''),
        city_id: String(listing.city?.id ?? ''),
        description: listing.description ?? '',
        duration_minutes: String(listing.duration_minutes),
        min_group: String(listing.min_group),
        max_group: String(listing.max_group),
        base_price_usd: String(listing.base_price_usd),
        status: listing.status,
        is_instant_book: listing.is_instant_book,
        spoken_languages: listing.spoken_languages ?? ['en'],
        meeting_point_address: listing.meeting_point?.address ?? '',
        inclusions: listing.inclusions ?? '',
        exclusions: listing.exclusions ?? '',
        itinerary: listing.itinerary?.length ? listing.itinerary : [{ time: '', description: '' }],
      });
      setExistingGallery(listing.gallery ?? []);
    } catch (err) {
      setError('Failed to load listing.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const data = new FormData();
    data.append('title', form.title);
    data.append('category_id', form.category_id);
    data.append('city_id', form.city_id);
    data.append('description', form.description);
    data.append('duration_minutes', form.duration_minutes);
    data.append('min_group', form.min_group);
    data.append('max_group', form.max_group);
    data.append('base_price_usd', form.base_price_usd);
    data.append('status', form.status);
    data.append('is_instant_book', form.is_instant_book ? '1' : '0');
    data.append('meeting_point_address', form.meeting_point_address);
    data.append('inclusions', form.inclusions);
    data.append('exclusions', form.exclusions);

    form.spoken_languages.forEach((lang) => data.append('spoken_languages[]', lang));

    form.itinerary.forEach((item, index) => {
      data.append(`itinerary[${index}][time]`, item.time);
      data.append(`itinerary[${index}][description]`, item.description);
    });

    if (heroFile) {
      data.append('hero_image', heroFile);
    }

    galleryFiles.forEach((file) => data.append('gallery_images[]', file));

    removedGalleryIds.forEach((id) => data.append('remove_gallery_image_ids[]', String(id)));

    try {
      if (isEdit) {
        await updateListing(Number(id), data);
      } else {
        await createListing(data);
      }
      navigate('/listings');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to save listing.';
      const errors = err?.response?.data?.errors;
      const detail = errors ? Object.values(errors).flat().join(' ') : '';
      setError(`${message} ${detail}`.trim());
    } finally {
      setSaving(false);
    }
  };

  const addItineraryItem = () => {
    setForm((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, { time: '', description: '' }],
    }));
  };

  const removeItineraryItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index),
    }));
  };

  const updateItinerary = (index: number, field: 'time' | 'description', value: string) => {
    setForm((prev) => {
      const updated = [...prev.itinerary];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, itinerary: updated };
    });
  };

  const toggleLanguage = (lang: string) => {
    setForm((prev) => {
      const has = prev.spoken_languages.includes(lang);
      return {
        ...prev,
        spoken_languages: has
          ? prev.spoken_languages.filter((l) => l !== lang)
          : [...prev.spoken_languages, lang],
      };
    });
  };

  const removeExistingGallery = (imageId: number) => {
    setRemovedGalleryIds((prev) => [...prev, imageId]);
    setExistingGallery((prev) => prev?.filter((img) => img.id !== imageId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-angkor-orange animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/listings')}
        className="mb-4 flex items-center gap-2 text-sm text-stone-gray hover:text-stone-charcoal"
      >
        <ChevronLeft className="w-4 h-4" /> Back to listings
      </button>

      <h1 className="text-2xl font-bold text-stone-charcoal mb-6">
        {isEdit ? 'Edit Listing' : 'Create Listing'}
      </h1>

      {error && (
        <div className="bg-error-red/10 text-error-red rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card-white rounded-2xl shadow-sm border border-stone-gray/10 p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-stone-gray mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-gray mb-1">Category *</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none bg-white"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-gray mb-1">City</label>
            <select
              value={form.city_id}
              onChange={(e) => setForm({ ...form, city_id: e.target.value })}
              className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none bg-white"
            >
              <option value="">Select city</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-stone-gray mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-gray mb-1">Duration (minutes) *</label>
            <input
              type="number"
              min={15}
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
              className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-gray mb-1">Base price (USD) *</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.base_price_usd}
              onChange={(e) => setForm({ ...form, base_price_usd: e.target.value })}
              className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-gray mb-1">Min group size *</label>
            <input
              type="number"
              min={1}
              value={form.min_group}
              onChange={(e) => setForm({ ...form, min_group: e.target.value })}
              className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-gray mb-1">Max group size *</label>
            <input
              type="number"
              min={1}
              value={form.max_group}
              onChange={(e) => setForm({ ...form, max_group: e.target.value })}
              className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-gray mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 py-3">
            <input
              type="checkbox"
              id="instant_book"
              checked={form.is_instant_book}
              onChange={(e) => setForm({ ...form, is_instant_book: e.target.checked })}
              className="w-5 h-5 rounded border-stone-gray/20 text-angkor-orange focus:ring-angkor-orange"
            />
            <label htmlFor="instant_book" className="text-sm text-stone-charcoal">
              Instant book
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-stone-gray mb-2">Spoken languages</label>
            <div className="flex flex-wrap gap-3">
              {LANGUAGE_OPTIONS.map((lang) => (
                <label
                  key={lang.value}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm ${
                    form.spoken_languages.includes(lang.value)
                      ? 'border-angkor-orange bg-angkor-orange/10 text-angkor-orange'
                      : 'border-stone-gray/20 text-stone-gray'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.spoken_languages.includes(lang.value)}
                    onChange={() => toggleLanguage(lang.value)}
                    className="hidden"
                  />
                  {lang.label}
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-stone-gray mb-1">Meeting point address</label>
            <input
              type="text"
              value={form.meeting_point_address}
              onChange={(e) => setForm({ ...form, meeting_point_address: e.target.value })}
              className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
              placeholder="e.g. Pub Street, Siem Reap"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-stone-gray mb-1">Inclusions</label>
            <textarea
              value={form.inclusions}
              onChange={(e) => setForm({ ...form, inclusions: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none resize-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-stone-gray mb-1">Exclusions</label>
            <textarea
              value={form.exclusions}
              onChange={(e) => setForm({ ...form, exclusions: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none resize-none"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-gray mb-2">Itinerary</label>
          <div className="space-y-3">
            {form.itinerary.map((item, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={item.time}
                  onChange={(e) => updateItinerary(index, 'time', e.target.value)}
                  placeholder="Time"
                  className="w-24 rounded-xl border border-stone-gray/20 px-3 py-2 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
                />
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItinerary(index, 'description', e.target.value)}
                  placeholder="Description"
                  className="flex-1 rounded-xl border border-stone-gray/20 px-3 py-2 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
                />
                {form.itinerary.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItineraryItem(index)}
                    className="p-2 rounded-xl border border-stone-gray/20 text-stone-gray hover:text-error-red hover:border-error-red"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItineraryItem}
              className="flex items-center gap-2 text-sm text-angkor-orange font-medium"
            >
              <Plus className="w-4 h-4" /> Add stop
            </button>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-gray mb-1">Hero image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-stone-gray file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-angkor-orange/10 file:text-angkor-orange file:font-medium"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-gray mb-1">Gallery images</label>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setGalleryFiles(Array.from(e.target.files ?? []))}
            className="block w-full text-sm text-stone-gray file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-angkor-orange/10 file:text-angkor-orange file:font-medium"
          />
          {existingGallery && existingGallery.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {existingGallery.map((img) => (
                <div key={img.id} className="relative w-20 h-20">
                  <img
                    src={img.url}
                    alt="Gallery"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingGallery(img.id)}
                    className="absolute -top-2 -right-2 p-1 bg-error-red text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="px-6 py-3 rounded-xl border border-stone-gray/20 text-stone-charcoal font-medium hover:bg-stone-gray/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-angkor-orange text-white px-6 py-3 rounded-xl font-medium hover:bg-angkor-orange-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Create listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
