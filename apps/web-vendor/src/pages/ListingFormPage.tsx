import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
 ChevronLeft,
 Loader2,
 Plus,
 X,
 Upload,
 ImageIcon,
 Trash2,
 MapPin,
 Clock,
 Users,
 DollarSign,
 Globe,
 AlertCircle,
 CheckCircle2,
 Info,
 FileImage,
 Sparkles,
 ListOrdered,
 CalendarDays,
 Bookmark,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '../lib/cn';
import { getListing, createListing, updateListing, type VendorListing } from '../lib/api';

const STATUS_OPTIONS = [
 { value: 'draft', label: 'Draft', helper: 'Only you can see this listing.' },
 { value: 'pending', label: 'Pending review', helper: 'Send to our team for approval.' },
 { value: 'paused', label: 'Paused', helper: 'Hide a previously approved listing.' },
];

const LANGUAGE_OPTIONS = [
 { value: 'en', label: 'English' },
 { value: 'km', label: 'Khmer' },
 { value: 'fr', label: 'French' },
 { value: 'zh', label: 'Chinese' },
 { value: 'ja', label: 'Japanese' },
 { value: 'ko', label: 'Korean' },
 { value: 'th', label: 'Thai' },
];

const MAX_GALLERY_FILES = 10;
const MAX_FILE_SIZE_MB = 5;

interface FormState {
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
}

interface NewGalleryFile {
 file: File;
 id: string;
 preview: string;
}

interface FieldErrors {
 [key: string]: string;
}

const initialForm: FormState = {
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
};

const sections = [
 { id: 'basic', label: 'Basic info', icon: Bookmark },
 { id: 'details', label: 'Details & policies', icon: Info },
 { id: 'photos', label: 'Photos', icon: FileImage },
 { id: 'itinerary', label: 'Itinerary', icon: ListOrdered },
];

function formatBytes(bytes: number): string {
 if (bytes === 0) return '0 B';
 const k = 1024;
 const sizes = ['B', 'KB', 'MB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

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
 const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
 const [isDirty, setIsDirty] = useState(false);
 const [activeSection, setActiveSection] = useState('basic');

 const [form, setForm] = useState<FormState>(initialForm);
 const [heroFile, setHeroFile] = useState<File | null>(null);
 const [heroPreview, setHeroPreview] = useState<string | null>(null);
 const heroIsObjectUrl = useRef(false);
 const [galleryFiles, setGalleryFiles] = useState<NewGalleryFile[]>([]);
 const [existingGallery, setExistingGallery] = useState<VendorListing['gallery']>([]);
 const [removedGalleryIds, setRemovedGalleryIds] = useState<number[]>([]);

 const sectionRefs = useRef({
 basic: null as HTMLElement | null,
 details: null as HTMLElement | null,
 photos: null as HTMLElement | null,
 itinerary: null as HTMLElement | null,
 });

 useEffect(() => {
 loadLookups();
 if (isEdit) {
 loadListing(Number(id));
 }
 }, [id, isEdit]);

 useEffect(() => {
 const handleBeforeUnload = (e: BeforeUnloadEvent) => {
 if (isDirty && !saving) {
 e.preventDefault();
 e.returnValue = '';
 }
 };
 window.addEventListener('beforeunload', handleBeforeUnload);
 return () => window.removeEventListener('beforeunload', handleBeforeUnload);
 }, [isDirty, saving]);

 useEffect(() => {
 const observer = new IntersectionObserver(
 (entries) => {
 entries.forEach((entry) => {
 if (entry.isIntersecting) {
 setActiveSection(entry.target.getAttribute('data-section') ?? 'basic');
 }
 });
 },
 { rootMargin: '-20% 0px -55% 0px', threshold: 0 }
 );

 Object.values(sectionRefs.current).forEach((ref) => {
 if (ref) observer.observe(ref);
 });

 return () => observer.disconnect();
 }, []);

 useEffect(() => {
 return () => {
 galleryFiles.forEach((f) => URL.revokeObjectURL(f.preview));
 if (heroIsObjectUrl.current && heroPreview) URL.revokeObjectURL(heroPreview);
 };
 }, [galleryFiles, heroPreview]);

 const existingHeroUrl = useMemo(() => {
 return existingGallery?.find((img) => img.is_hero)?.url ?? null;
 }, [existingGallery]);

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
 toast.error('Failed to load categories and cities.');
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
 setHeroPreview(listing.hero_image ?? null);
 heroIsObjectUrl.current = false;
 } catch {
 setError('Failed to load listing.');
 toast.error('Failed to load listing.');
 } finally {
 setLoading(false);
 }
 };

 const updateForm = (updates: Partial<FormState>) => {
 setForm((prev) => ({ ...prev, ...updates }));
 setIsDirty(true);
 setFieldErrors((prev) => {
 const next = { ...prev };
 Object.keys(updates).forEach((key) => delete next[key]);
 return next;
 });
 };

 const validateClient = (): boolean => {
 const errors: FieldErrors = {};
 if (!form.title.trim()) errors.title = 'Title is required.';
 if (!form.category_id) errors.category_id = 'Category is required.';
 if (!form.base_price_usd || Number(form.base_price_usd) <= 0) {
 errors.base_price_usd = 'Base price must be greater than 0.';
 }
 if (!form.duration_minutes || Number(form.duration_minutes) < 15) {
 errors.duration_minutes = 'Duration must be at least 15 minutes.';
 }
 const min = Number(form.min_group);
 const max = Number(form.max_group);
 if (!form.min_group || min < 1) errors.min_group = 'Minimum group size is 1.';
 if (!form.max_group || max < 1) errors.max_group = 'Maximum group size is at least 1.';
 if (min > max) {
 errors.min_group = 'Minimum cannot be greater than maximum.';
 errors.max_group = 'Maximum cannot be smaller than minimum.';
 }

 setFieldErrors(errors);
 return Object.keys(errors).length === 0;
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);
 setFieldErrors({});

 if (!validateClient()) {
 toast.error('Please fix the highlighted fields.');
 const firstError = document.querySelector('[data-error="true"]');
 firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
 return;
 }

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

 galleryFiles.forEach(({ file }) => data.append('gallery_images[]', file));
 removedGalleryIds.forEach((id) => data.append('remove_gallery_image_ids[]', String(id)));

 try {
 if (isEdit) {
 await updateListing(Number(id), data);
 toast.success('Listing updated successfully.');
 } else {
 await createListing(data);
 toast.success('Listing created successfully.');
 }
 setIsDirty(false);
 navigate('/listings');
 } catch (err: any) {
 const message = err?.response?.data?.message ?? 'Failed to save listing.';
 const backendErrors: Record<string, string[]> = err?.response?.data?.errors ?? {};
 const mapped: FieldErrors = {};
 Object.entries(backendErrors).forEach(([key, values]) => {
 mapped[key] = values.join(' ');
 });
 setFieldErrors(mapped);
 setError(`${message}`.trim());
 toast.error(message);
 const firstError = document.querySelector('[data-error="true"]');
 firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
 } finally {
 setSaving(false);
 }
 };

 const addItineraryItem = () => {
 setForm((prev) => ({
 ...prev,
 itinerary: [...prev.itinerary, { time: '', description: '' }],
 }));
 setIsDirty(true);
 };

 const removeItineraryItem = (index: number) => {
 setForm((prev) => ({
 ...prev,
 itinerary: prev.itinerary.filter((_, i) => i !== index),
 }));
 setIsDirty(true);
 };

 const updateItinerary = (index: number, field: 'time' | 'description', value: string) => {
 setForm((prev) => {
 const updated = [...prev.itinerary];
 updated[index] = { ...updated[index], [field]: value };
 return { ...prev, itinerary: updated };
 });
 setIsDirty(true);
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
 setIsDirty(true);
 };

 const handleHeroChange = (files: FileList | null) => {
 const file = files?.[0];
 if (!file) return;
 if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
 toast.error(`Hero image must be under ${MAX_FILE_SIZE_MB} MB.`);
 return;
 }
 if (heroIsObjectUrl.current && heroPreview) URL.revokeObjectURL(heroPreview);
 heroIsObjectUrl.current = true;
 setHeroFile(file);
 setHeroPreview(URL.createObjectURL(file));
 setIsDirty(true);
 };

 const clearHero = () => {
 setHeroFile(null);
 if (heroIsObjectUrl.current && heroPreview) URL.revokeObjectURL(heroPreview);
 heroIsObjectUrl.current = false;
 setHeroPreview(existingHeroUrl ?? null);
 setIsDirty(true);
 if (fileInputRef.current) fileInputRef.current.value = '';
 };

 const handleGalleryFiles = (incoming: FileList | null) => {
 if (!incoming) return;
 const files = Array.from(incoming).filter((file) => {
 if (!file.type.startsWith('image/')) {
 toast.error(`${file.name} is not an image.`);
 return false;
 }
 if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
 toast.error(`${file.name} is larger than ${MAX_FILE_SIZE_MB} MB.`);
 return false;
 }
 return true;
 });

 const remainingSlots = MAX_GALLERY_FILES - (existingGallery?.length ?? 0) - galleryFiles.length + removedGalleryIds.length;
 if (files.length > remainingSlots) {
 toast.error(`You can add up to ${MAX_GALLERY_FILES} gallery images total.`);
 return;
 }

 const newFiles: NewGalleryFile[] = files.map((file) => ({
 file,
 id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
 preview: URL.createObjectURL(file),
 }));

 setGalleryFiles((prev) => [...prev, ...newFiles]);
 setIsDirty(true);
 };

 const removeNewGalleryFile = (id: string) => {
 setGalleryFiles((prev) => {
 const file = prev.find((f) => f.id === id);
 if (file) URL.revokeObjectURL(file.preview);
 return prev.filter((f) => f.id !== id);
 });
 setIsDirty(true);
 };

 const removeExistingGallery = (imageId: number) => {
 setRemovedGalleryIds((prev) => [...prev, imageId]);
 setExistingGallery((prev) => prev?.filter((img) => img.id !== imageId));
 setIsDirty(true);
 };

 const scrollToSection = (sectionId: string) => {
 sectionRefs.current[sectionId as keyof typeof sectionRefs.current]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
 };

 const bulletPreview = (text: string) =>
 text
 .split('\n')
 .map((line) => line.trim())
 .filter(Boolean);

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <Loader2 className="w-8 h-8 text-text-primary animate-spin" />
 </div>
 );
 }

 return (
 <div className="max-w-6xl mx-auto">
 <button
 onClick={() => navigate('/listings')}
 className="mb-4 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
 >
 <ChevronLeft className="w-4 h-4" /> Back to listings
 </button>

 <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
 <aside className="lg:w-56 xl:w-64 shrink-0">
 <div className="lg:sticky lg:top-24 bg-surface-raised rounded-md border border-border p-4">
 <h2 className="text-sm font-semibold text-text-primary px-3 py-2">
 {isEdit ? 'Edit listing' : 'Create listing'}
 </h2>
 <nav className="space-y-1 mt-1">
 {sections.map((section) => {
 const Icon = section.icon;
 const isActive = activeSection === section.id;
 return (
 <button
 key={section.id}
 type="button"
 onClick={() => scrollToSection(section.id)}
 className={cn(
 'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
 isActive
 ? 'bg-accent/10 text-text-primary'
 : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
 )}
 >
 <Icon className="w-4 h-4" />
 {section.label}
 </button>
 );
 })}
 </nav>
 <div className="mt-4 pt-4 border-t border-border px-3">
 <p className="text-xs text-text-secondary leading-relaxed">
 Fields marked with <span className="text-error">*</span> are required.
 </p>
 </div>
 </div>
 </aside>

 <div className="flex-1 min-w-0">
 <div className="mb-3">
 <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
 {isEdit ? 'Edit listing' : 'Create a new listing'}
 </h1>
 <p className="text-text-secondary mt-1 text-sm sm:text-base">
 Fill in the details below. You can save as a draft and submit for review when ready.
 </p>
 </div>

 {error && (
 <div className="bg-error/10 text-error rounded-md p-4 mb-3 text-sm flex items-start gap-3" data-error="true">
 <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
 <div>
 <p className="font-medium">Something went wrong</p>
 <p className="mt-0.5">{error}</p>
 </div>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-3">
 <section ref={(el) => { sectionRefs.current.basic = el; }} data-section="basic" className="bg-surface-raised rounded-md border border-border p-4 sm:p-4">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-10 h-10 rounded-md bg-accent/10 text-text-primary flex items-center justify-center">
 <Bookmark className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-text-primary">Basic info</h2>
 <p className="text-xs text-text-secondary">The essentials travelers will see first.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div className="sm:col-span-2" data-error={!!fieldErrors.title}>
 <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1.5">
 Title <span className="text-error">*</span>
 </label>
 <input
 id="title"
 type="text"
 value={form.title}
 onChange={(e) => updateForm({ title: e.target.value })}
 className={cn(
 'w-full rounded-md border px-4 py-3 outline-none transition-colors',
 fieldErrors.title
 ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
 : 'border-border focus:border-accent focus:ring-1 focus:ring-accent'
 )}
 placeholder="e.g. Sunrise Tour of Angkor Wat with Local Guide"
 required
 />
 {fieldErrors.title && <p className="mt-1.5 text-xs text-error">{fieldErrors.title}</p>}
 </div>

 <div data-error={!!fieldErrors.category_id}>
 <label htmlFor="category_id" className="block text-sm font-medium text-text-primary mb-1.5">
 Category <span className="text-error">*</span>
 </label>
 <select
 id="category_id"
 value={form.category_id}
 onChange={(e) => updateForm({ category_id: e.target.value })}
 className={cn(
 'w-full rounded-md border px-4 py-3 outline-none bg-surface-raised text-text-primary transition-colors',
 fieldErrors.category_id
 ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
 : 'border-border focus:border-accent focus:ring-1 focus:ring-accent'
 )}
 required
 >
 <option value="">Select category</option>
 {categories.map((cat) => (
 <option key={cat.id} value={cat.id}>
 {cat.name}
 </option>
 ))}
 </select>
 {fieldErrors.category_id && <p className="mt-1.5 text-xs text-error">{fieldErrors.category_id}</p>}
 </div>

 <div>
 <label htmlFor="city_id" className="block text-sm font-medium text-text-primary mb-1.5">City</label>
 <select
 id="city_id"
 value={form.city_id}
 onChange={(e) => updateForm({ city_id: e.target.value })}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-surface-raised text-text-primary transition-colors"
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
 <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
 <textarea
 id="description"
 value={form.description}
 onChange={(e) => updateForm({ description: e.target.value })}
 rows={5}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none transition-colors"
 placeholder="Describe the experience, what makes it special, and what travelers can expect..."
 />
 <p className="mt-1.5 text-xs text-text-secondary">Tip: keep it concise but vivid. Maximum 5000 characters.</p>
 </div>
 </div>
 </section>

 <section ref={(el) => { sectionRefs.current.details = el; }} data-section="details" className="bg-surface-raised rounded-md border border-border p-4 sm:p-4">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-10 h-10 rounded-md bg-accent/10 text-text-primary flex items-center justify-center">
 <Info className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-text-primary">Details & policies</h2>
 <p className="text-xs text-text-secondary">Pricing, group size, languages, and meeting point.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div data-error={!!fieldErrors.duration_minutes}>
 <label htmlFor="duration_minutes" className="block text-sm font-medium text-text-primary mb-1.5">
 <span className="inline-flex items-center gap-1.5">
 <Clock className="w-4 h-4 text-text-secondary" />
 Duration (minutes) <span className="text-error">*</span>
 </span>
 </label>
 <input
 id="duration_minutes"
 type="number"
 min={15}
 step={15}
 value={form.duration_minutes}
 onChange={(e) => updateForm({ duration_minutes: e.target.value })}
 className={cn(
 'w-full rounded-md border px-4 py-3 outline-none transition-colors',
 fieldErrors.duration_minutes
 ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
 : 'border-border focus:border-accent focus:ring-1 focus:ring-accent'
 )}
 required
 />
 {fieldErrors.duration_minutes && <p className="mt-1.5 text-xs text-error">{fieldErrors.duration_minutes}</p>}
 </div>

 <div data-error={!!fieldErrors.base_price_usd}>
 <label htmlFor="base_price_usd" className="block text-sm font-medium text-text-primary mb-1.5">
 <span className="inline-flex items-center gap-1.5">
 <DollarSign className="w-4 h-4 text-text-secondary" />
 Base price (USD) <span className="text-error">*</span>
 </span>
 </label>
 <input
 id="base_price_usd"
 type="number"
 min={0}
 step={0.01}
 value={form.base_price_usd}
 onChange={(e) => updateForm({ base_price_usd: e.target.value })}
 className={cn(
 'w-full rounded-md border px-4 py-3 outline-none transition-colors',
 fieldErrors.base_price_usd
 ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
 : 'border-border focus:border-accent focus:ring-1 focus:ring-accent'
 )}
 placeholder="0.00"
 required
 />
 {fieldErrors.base_price_usd && <p className="mt-1.5 text-xs text-error">{fieldErrors.base_price_usd}</p>}
 </div>

 <div data-error={!!fieldErrors.min_group}>
 <label htmlFor="min_group" className="block text-sm font-medium text-text-primary mb-1.5">
 <span className="inline-flex items-center gap-1.5">
 <Users className="w-4 h-4 text-text-secondary" />
 Min group size <span className="text-error">*</span>
 </span>
 </label>
 <input
 id="min_group"
 type="number"
 min={1}
 value={form.min_group}
 onChange={(e) => updateForm({ min_group: e.target.value })}
 className={cn(
 'w-full rounded-md border px-4 py-3 outline-none transition-colors',
 fieldErrors.min_group
 ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
 : 'border-border focus:border-accent focus:ring-1 focus:ring-accent'
 )}
 required
 />
 {fieldErrors.min_group && <p className="mt-1.5 text-xs text-error">{fieldErrors.min_group}</p>}
 </div>

 <div data-error={!!fieldErrors.max_group}>
 <label htmlFor="max_group" className="block text-sm font-medium text-text-primary mb-1.5">
 <span className="inline-flex items-center gap-1.5">
 <Users className="w-4 h-4 text-text-secondary" />
 Max group size <span className="text-error">*</span>
 </span>
 </label>
 <input
 id="max_group"
 type="number"
 min={1}
 value={form.max_group}
 onChange={(e) => updateForm({ max_group: e.target.value })}
 className={cn(
 'w-full rounded-md border px-4 py-3 outline-none transition-colors',
 fieldErrors.max_group
 ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
 : 'border-border focus:border-accent focus:ring-1 focus:ring-accent'
 )}
 required
 />
 {fieldErrors.max_group && <p className="mt-1.5 text-xs text-error">{fieldErrors.max_group}</p>}
 </div>

 <div>
 <label htmlFor="status" className="block text-sm font-medium text-text-primary mb-1.5">
 <span className="inline-flex items-center gap-1.5">
 <CalendarDays className="w-4 h-4 text-text-secondary" />
 Status
 </span>
 </label>
 <select
 id="status"
 value={form.status}
 onChange={(e) => updateForm({ status: e.target.value })}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-surface-raised text-text-primary transition-colors"
 >
 {STATUS_OPTIONS.map((opt) => (
 <option key={opt.value} value={opt.value}>
 {opt.label}
 </option>
 ))}
 </select>
 <p className="mt-1.5 text-xs text-text-secondary">
 {STATUS_OPTIONS.find((s) => s.value === form.status)?.helper}
 </p>
 </div>

 <div className="flex items-center gap-3 py-3">
 <input
 type="checkbox"
 id="instant_book"
 checked={form.is_instant_book}
 onChange={(e) => updateForm({ is_instant_book: e.target.checked })}
 className="w-5 h-5 rounded border-border text-text-primary focus:ring-accent cursor-pointer"
 />
 <label htmlFor="instant_book" className="text-sm text-text-primary cursor-pointer select-none">
 Instant book
 </label>
 </div>

 <div className="sm:col-span-2">
 <label className="block text-sm font-medium text-text-primary mb-2">
 <span className="inline-flex items-center gap-1.5">
 <Globe className="w-4 h-4 text-text-secondary" />
 Spoken languages
 </span>
 </label>
 <div className="flex flex-wrap gap-3">
 {LANGUAGE_OPTIONS.map((lang) => {
 const selected = form.spoken_languages.includes(lang.value);
 return (
 <label
 key={lang.value}
 className={cn(
 'inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm transition-colors select-none',
 selected
 ? 'border-accent bg-accent/10 text-text-primary'
 : 'border-border text-text-secondary hover:border-border'
 )}
 >
 <input
 type="checkbox"
 checked={selected}
 onChange={() => toggleLanguage(lang.value)}
 className="hidden"
 />
 {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
 {lang.label}
 </label>
 );
 })}
 </div>
 </div>

 <div className="sm:col-span-2">
 <label htmlFor="meeting_point_address" className="block text-sm font-medium text-text-primary mb-1.5">
 <span className="inline-flex items-center gap-1.5">
 <MapPin className="w-4 h-4 text-text-secondary" />
 Meeting point address
 </span>
 </label>
 <input
 id="meeting_point_address"
 type="text"
 value={form.meeting_point_address}
 onChange={(e) => updateForm({ meeting_point_address: e.target.value })}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
 placeholder="e.g. Pub Street, Siem Reap"
 />
 </div>

 <div className="sm:col-span-2">
 <label htmlFor="inclusions" className="block text-sm font-medium text-text-primary mb-1.5">Inclusions</label>
 <textarea
 id="inclusions"
 value={form.inclusions}
 onChange={(e) => updateForm({ inclusions: e.target.value })}
 rows={4}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none transition-colors"
 placeholder="One item per line, e.g.&#10;Hotel pickup&#10;English-speaking guide&#10;Bottled water"
 />
 {form.inclusions.trim() && (
 <div className="mt-2 bg-surface rounded-md p-3">
 <p className="text-xs font-medium text-text-secondary mb-1.5">Preview</p>
 <ul className="space-y-1">
 {bulletPreview(form.inclusions).map((item, i) => (
 <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
 <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
 {item}
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>

 <div className="sm:col-span-2">
 <label htmlFor="exclusions" className="block text-sm font-medium text-text-primary mb-1.5">Exclusions</label>
 <textarea
 id="exclusions"
 value={form.exclusions}
 onChange={(e) => updateForm({ exclusions: e.target.value })}
 rows={4}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none transition-colors"
 placeholder="One item per line, e.g.&#10;Angkor pass&#10;Meals&#10;Tips"
 />
 {form.exclusions.trim() && (
 <div className="mt-2 bg-surface rounded-md p-3">
 <p className="text-xs font-medium text-text-secondary mb-1.5">Preview</p>
 <ul className="space-y-1">
 {bulletPreview(form.exclusions).map((item, i) => (
 <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
 <span className="w-4 h-4 rounded-full border-2 border-error shrink-0 mt-0.5" />
 {item}
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>
 </div>
 </section>

 <section ref={(el) => { sectionRefs.current.photos = el; }} data-section="photos" className="bg-surface-raised rounded-md border border-border p-4 sm:p-4">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-10 h-10 rounded-md bg-accent/10 text-text-primary flex items-center justify-center">
 <FileImage className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-text-primary">Photos</h2>
 <p className="text-xs text-text-secondary">Add a hero image and up to {MAX_GALLERY_FILES} gallery photos.</p>
 </div>
 </div>

 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-text-primary mb-2">Hero image</label>
 <input
 ref={fileInputRef}
 type="file"
 accept="image/*"
 onChange={(e) => handleHeroChange(e.target.files)}
 className="hidden"
 />
 {heroPreview ? (
 <div className="relative rounded-md overflow-hidden border border-border aspect-video max-h-80 bg-surface group">
 <img src={heroPreview} alt="Hero preview" className="w-full h-full object-cover" />
 <div className="absolute inset-0 bg-surface/0 group-hover:bg-surface/20 transition-colors" />
 <button
 type="button"
 onClick={clearHero}
 className="absolute top-3 right-3 p-2 bg-surface-raised text-error rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-accent text-accent-inverse text-xs font-bold">
 Hero
 </span>
 </div>
 ) : (
 <button
 type="button"
 onClick={() => fileInputRef.current?.click()}
 className="w-full flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border px-4 py-10 text-text-secondary hover:border-accent hover:text-text-primary hover:bg-accent/5 transition-colors"
 >
 <div className="w-12 h-12 rounded-full bg-accent/10 text-text-primary flex items-center justify-center">
 <ImageIcon className="w-6 h-6" />
 </div>
 <div className="text-center">
 <p className="text-sm font-medium">Click to upload hero image</p>
 <p className="text-xs mt-1">JPG, PNG, WebP · Max {MAX_FILE_SIZE_MB} MB</p>
 </div>
 </button>
 )}
 </div>

 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="block text-sm font-medium text-text-primary">Gallery images</label>
 <span className="text-xs text-text-secondary">
 {((existingGallery?.length ?? 0) + galleryFiles.length)} / {MAX_GALLERY_FILES}
 </span>
 </div>
 <input
 ref={galleryInputRef}
 type="file"
 accept="image/*"
 multiple
 onChange={(e) => handleGalleryFiles(e.target.files)}
 className="hidden"
 />
 <div
 onClick={() => galleryInputRef.current?.click()}
 onDragOver={(e) => {
 e.preventDefault();
 e.currentTarget.classList.add('border-accent', 'bg-accent/5');
 }}
 onDragLeave={(e) => {
 e.currentTarget.classList.remove('border-accent', 'bg-accent/5');
 }}
 onDrop={(e) => {
 e.preventDefault();
 e.currentTarget.classList.remove('border-accent', 'bg-accent/5');
 handleGalleryFiles(e.dataTransfer.files);
 }}
 className="w-full cursor-pointer flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border px-4 py-4 text-text-secondary hover:border-accent hover:text-text-primary hover:bg-accent/5 transition-colors"
 >
 <div className="w-12 h-12 rounded-full bg-accent/10 text-text-primary flex items-center justify-center">
 <Upload className="w-6 h-6" />
 </div>
 <div className="text-center">
 <p className="text-sm font-medium">
 Drag & drop photos here, or click to browse
 </p>
 <p className="text-xs mt-1">
 Up to {MAX_GALLERY_FILES} images · JPG, PNG, WebP · Max {MAX_FILE_SIZE_MB} MB each
 </p>
 </div>
 </div>

 {((existingGallery?.length ?? 0) > 0 || galleryFiles.length > 0) && (
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-5">
 {existingGallery?.map((img) => (
 <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border border-border group bg-surface">
 <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
 <button
 type="button"
 onClick={() => removeExistingGallery(img.id)}
 className="absolute top-2 right-2 p-1.5 bg-surface-raised text-error rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
 >
 <X className="w-4 h-4" />
 </button>
 {img.is_hero && (
 <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-accent text-accent-inverse text-[10px] font-bold">
 HERO
 </span>
 )}
 </div>
 ))}
 {galleryFiles.map((img) => (
 <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border border-border group bg-surface">
 <img src={img.preview} alt={img.file.name} className="w-full h-full object-cover" />
 <button
 type="button"
 onClick={() => removeNewGalleryFile(img.id)}
 className="absolute top-2 right-2 p-1.5 bg-surface-raised text-error rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
 >
 <X className="w-4 h-4" />
 </button>
 <span className="absolute bottom-0 left-0 right-0 bg-surface/60 text-text-primary text-[10px] px-2 py-1 truncate">
 {formatBytes(img.file.size)}
 </span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </section>

 <section ref={(el) => { sectionRefs.current.itinerary = el; }} data-section="itinerary" className="bg-surface-raised rounded-md border border-border p-4 sm:p-4">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-10 h-10 rounded-md bg-accent/10 text-text-primary flex items-center justify-center">
 <ListOrdered className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-text-primary">Itinerary</h2>
 <p className="text-xs text-text-secondary">Add stops or highlights of the experience.</p>
 </div>
 </div>

 <div className="space-y-4">
 {form.itinerary.map((item, index) => (
 <div
 key={index}
 className="flex flex-col sm:flex-row gap-3 p-4 rounded-md border border-border bg-surface/50"
 >
 <div className="flex items-center gap-3 sm:w-auto">
 <span className="w-7 h-7 rounded-full bg-accent text-accent-inverse text-xs font-bold flex items-center justify-center shrink-0">
 {index + 1}
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 flex-1">
 <div className="sm:col-span-3">
 <label className="block text-xs font-medium text-text-secondary mb-1">Time</label>
 <input
 type="text"
 value={item.time}
 onChange={(e) => updateItinerary(index, 'time', e.target.value)}
 placeholder="e.g. 08:00"
 className="w-full rounded-md border border-border px-3 py-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-colors"
 />
 </div>
 <div className="sm:col-span-9">
 <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
 <input
 type="text"
 value={item.description}
 onChange={(e) => updateItinerary(index, 'description', e.target.value)}
 placeholder="What happens at this stop?"
 className="w-full rounded-md border border-border px-3 py-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-colors"
 />
 </div>
 </div>
 {form.itinerary.length > 1 && (
 <button
 type="button"
 onClick={() => removeItineraryItem(index)}
 className="p-2 rounded-md border border-border text-text-secondary hover:text-error hover:border-error self-start sm:self-center transition-colors"
 aria-label="Remove stop"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 )}
 </div>
 ))}
 <button
 type="button"
 onClick={addItineraryItem}
 className="flex items-center gap-2 text-sm text-text-primary font-medium hover:text-text-primary-dark transition-colors"
 >
 <Plus className="w-4 h-4" /> Add another stop
 </button>
 </div>
 </section>

 <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 sticky bottom-0 bg-surface py-4 sm:static">
 <button
 type="button"
 onClick={() => navigate('/listings')}
 className="px-4 py-3 rounded-md border border-border text-text-primary font-medium hover:bg-surface-elevated transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={saving}
 className="flex-1 bg-accent text-accent-inverse px-4 py-3 rounded-md font-medium hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors "
 >
 {saving && <Loader2 className="w-4 h-4 animate-spin" />}
 <Sparkles className="w-4 h-4" />
 {isEdit ? 'Save changes' : 'Create listing'}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 );
}
