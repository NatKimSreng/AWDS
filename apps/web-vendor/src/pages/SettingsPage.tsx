import { useEffect, useRef, useState } from 'react';
import { Loader2, Save, Camera, User, Phone, Globe, MapPin, FileText } from 'lucide-react';

import { useAuthStore } from '../stores/authStore';
import {
 getSettings,
 updatePayoutAccount,
 updateSettings,
 type VendorSettings,
 getUserProfile,
 updateUserProfile,
 uploadUserAvatar,
 type UserProfile,
} from '../lib/api';

const PAYOUT_METHODS = [
 { value: 'bank_transfer', label: 'Bank transfer' },
 { value: 'aba', label: 'ABA Bank' },
 { value: 'acleda', label: 'ACLEDA Bank' },
 { value: 'bakong', label: 'Bakong' },
];

interface PersonalForm {
 name: string;
 phone: string;
 date_of_birth: string;
 country: string;
 nationality: string;
 address: string;
 bio: string;
 emergency_contact_name: string;
 emergency_contact_phone: string;
}

function initialPersonalForm(profile: UserProfile | null): PersonalForm {
 return {
 name: profile?.name ?? '',
 phone: profile?.phone ?? '',
 date_of_birth: profile?.date_of_birth ?? '',
 country: profile?.country ?? '',
 nationality: profile?.nationality ?? '',
 address: profile?.address ?? '',
 bio: profile?.bio ?? '',
 emergency_contact_name: profile?.emergency_contact_name ?? '',
 emergency_contact_phone: profile?.emergency_contact_phone ?? '',
 };
}

export default function SettingsPage() {
 const user = useAuthStore((state) => state.user);
 const updateUser = useAuthStore((state) => state.updateUser);

 const [settings, setSettings] = useState<VendorSettings | null>(null);
 const [businessForm, setBusinessForm] = useState({
 business_name: '',
 bio: '',
 service_area: '',
 });
 const [payoutForm, setPayoutForm] = useState({
 method: 'bank_transfer',
 account_name: '',
 account_number: '',
 });
 const [personalProfile, setPersonalProfile] = useState<UserProfile | null>(null);
 const [personalForm, setPersonalForm] = useState<PersonalForm>(initialPersonalForm(null));

 const [loading, setLoading] = useState(true);
 const [savingProfile, setSavingProfile] = useState(false);
 const [savingPayout, setSavingPayout] = useState(false);
 const [savingPersonal, setSavingPersonal] = useState(false);
 const [uploadingAvatar, setUploadingAvatar] = useState(false);
 const [message, setMessage] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
 loadSettings();
 }, []);

 const loadSettings = async () => {
 try {
 const [vendorRes, profileRes] = await Promise.all([
 getSettings(),
 getUserProfile(),
 ]);
 setSettings(vendorRes);
 setBusinessForm({
 business_name: vendorRes.business_name,
 bio: vendorRes.bio ?? '',
 service_area: vendorRes.service_area ?? '',
 });
 if (vendorRes.payout_account) {
 setPayoutForm({
 method: vendorRes.payout_account.method,
 account_name: vendorRes.payout_account.account_name,
 account_number: vendorRes.payout_account.account_number,
 });
 }
 setPersonalProfile(profileRes);
 setPersonalForm(initialPersonalForm(profileRes));
 } catch {
 setError('Failed to load settings.');
 } finally {
 setLoading(false);
 }
 };

 const handleSaveBusiness = async (e: React.FormEvent) => {
 e.preventDefault();
 setSavingProfile(true);
 setError(null);
 setMessage(null);
 try {
 const res = await updateSettings(businessForm);
 setSettings(res);
 setMessage('Business profile saved successfully.');
 } catch (err: any) {
 setError(err?.response?.data?.message ?? 'Failed to save business profile.');
 } finally {
 setSavingProfile(false);
 }
 };

 const handleSavePayout = async (e: React.FormEvent) => {
 e.preventDefault();
 setSavingPayout(true);
 setError(null);
 setMessage(null);
 try {
 await updatePayoutAccount(payoutForm);
 setMessage('Payout account saved successfully.');
 loadSettings();
 } catch (err: any) {
 setError(err?.response?.data?.message ?? 'Failed to save payout account.');
 } finally {
 setSavingPayout(false);
 }
 };

 const updatePersonalField = <K extends keyof PersonalForm>(key: K, value: PersonalForm[K]) => {
 setPersonalForm((prev) => ({ ...prev, [key]: value }));
 };

 const handleSavePersonal = async (e: React.FormEvent) => {
 e.preventDefault();
 setSavingPersonal(true);
 setError(null);
 setMessage(null);

 const payload: Partial<PersonalForm> = {};
 (Object.keys(personalForm) as Array<keyof PersonalForm>).forEach((key) => {
 const value = personalForm[key].trim();
 const current = personalProfile?.[key] ?? '';
 if (value !== current.toString()) {
 (payload as Record<string, string | null>)[key] = value || null;
 }
 });

 try {
 const updated = await updateUserProfile(payload);
 setPersonalProfile(updated);
 setPersonalForm(initialPersonalForm(updated));
 updateUser({
 name: updated.name,
 phone: updated.phone,
 avatar_url: updated.avatar_url,
 date_of_birth: updated.date_of_birth,
 country: updated.country,
 nationality: updated.nationality,
 address: updated.address,
 bio: updated.bio,
 emergency_contact_name: updated.emergency_contact_name,
 emergency_contact_phone: updated.emergency_contact_phone,
 });
 setMessage('Personal profile saved successfully.');
 } catch (err: any) {
 setError(err?.response?.data?.message ?? 'Failed to save personal profile.');
 } finally {
 setSavingPersonal(false);
 }
 };

 const handleAvatarClick = () => {
 fileInputRef.current?.click();
 };

 const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setUploadingAvatar(true);
 setError(null);
 try {
 const avatarUrl = await uploadUserAvatar(file);
 const refreshed = await getUserProfile();
 setPersonalProfile(refreshed);
 updateUser({ avatar_url: avatarUrl, name: refreshed.name });
 setMessage('Avatar updated successfully.');
 } catch (err: any) {
 setError(err?.response?.data?.message ?? 'Failed to upload avatar.');
 } finally {
 setUploadingAvatar(false);
 if (fileInputRef.current) fileInputRef.current.value = '';
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <Loader2 className="w-8 h-8 text-text-primary animate-spin" />
 </div>
 );
 }

 return (
 <div className="max-w-3xl mx-auto space-y-3">
 <div className="mb-3">
 <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
 <p className="text-sm text-text-secondary mt-1">Update your personal profile, business details, and payout information.</p>
 </div>

 {message && (
 <div className="bg-success/10 text-success rounded-md p-4 text-sm">
 {message}
 </div>
 )}

 {error && (
 <div className="bg-error/10 text-error rounded-md p-4 text-sm">
 {error}
 </div>
 )}

 <form
 onSubmit={handleSavePersonal}
 className="bg-surface-raised rounded-md border border-border p-4 sm:p-4 space-y-5"
 >
 <div className="flex items-center gap-4 mb-2">
 <button
 type="button"
 onClick={handleAvatarClick}
 disabled={uploadingAvatar}
 className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
 >
 {user?.avatar_url ? (
 <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full bg-accent text-accent-inverse flex items-center justify-center text-xl font-bold">
 {user?.name?.charAt(0).toUpperCase() || 'P'}
 </div>
 )}
 <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
 {uploadingAvatar ? <Loader2 className="w-5 h-5 text-accent-inverse animate-spin" /> : <Camera className="w-5 h-5 text-accent-inverse" />}
 </div>
 </button>
 <input
 ref={fileInputRef}
 type="file"
 accept="image/jpeg,image/png,image/jpg,image/webp"
 className="hidden"
 onChange={handleAvatarChange}
 />
 <div>
 <h2 className="text-lg font-bold text-text-primary">Personal profile</h2>
 <p className="text-sm text-text-secondary">How guests see you across the platform.</p>
 </div>
 </div>

 <div className="grid sm:grid-cols-2 gap-5">
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Full name</label>
 <div className="relative">
 <User className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
 <input
 type="text"
 value={personalForm.name}
 onChange={(e) => updatePersonalField('name', e.target.value)}
 className="w-full rounded-md border border-border pl-10 pr-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 required
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
 <div className="relative">
 <Phone className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
 <input
 type="tel"
 value={personalForm.phone}
 onChange={(e) => updatePersonalField('phone', e.target.value)}
 className="w-full rounded-md border border-border pl-10 pr-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Date of birth</label>
 <input
 type="date"
 value={personalForm.date_of_birth}
 onChange={(e) => updatePersonalField('date_of_birth', e.target.value)}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Country of residence</label>
 <div className="relative">
 <Globe className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
 <input
 type="text"
 value={personalForm.country}
 onChange={(e) => updatePersonalField('country', e.target.value)}
 className="w-full rounded-md border border-border pl-10 pr-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Nationality</label>
 <div className="relative">
 <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
 <input
 type="text"
 value={personalForm.nationality}
 onChange={(e) => updatePersonalField('nationality', e.target.value)}
 className="w-full rounded-md border border-border pl-10 pr-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Emergency contact name</label>
 <input
 type="text"
 value={personalForm.emergency_contact_name}
 onChange={(e) => updatePersonalField('emergency_contact_name', e.target.value)}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Emergency contact phone</label>
 <input
 type="tel"
 value={personalForm.emergency_contact_phone}
 onChange={(e) => updatePersonalField('emergency_contact_phone', e.target.value)}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
 <div className="relative">
 <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
 <textarea
 value={personalForm.address}
 onChange={(e) => updatePersonalField('address', e.target.value)}
 rows={3}
 className="w-full rounded-md border border-border pl-10 pr-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
 <div className="relative">
 <FileText className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
 <textarea
 value={personalForm.bio}
 onChange={(e) => updatePersonalField('bio', e.target.value)}
 rows={4}
 maxLength={500}
 className="w-full rounded-md border border-border pl-10 pr-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none"
 />
 </div>
 <p className="text-xs text-text-secondary text-right mt-1">{personalForm.bio.length}/500</p>
 </div>

 <div className="flex justify-end pt-2">
 <button
 type="submit"
 disabled={savingPersonal}
 className="bg-accent text-accent-inverse px-4 py-2.5 rounded-md font-medium hover:bg-surface-elevated disabled:opacity-50 flex items-center gap-2"
 >
 {savingPersonal && <Loader2 className="w-4 h-4 animate-spin" />}
 <Save className="w-4 h-4" /> Save personal profile
 </button>
 </div>
 </form>

 <form
 onSubmit={handleSaveBusiness}
 className="bg-surface-raised rounded-md border border-border p-4 sm:p-4 space-y-5"
 >
 <h2 className="text-lg font-bold text-text-primary">Business profile</h2>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Business name</label>
 <input
 type="text"
 value={businessForm.business_name}
 onChange={(e) => setBusinessForm({ ...businessForm, business_name: e.target.value })}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 required
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
 <textarea
 value={businessForm.bio}
 onChange={(e) => setBusinessForm({ ...businessForm, bio: e.target.value })}
 rows={4}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Service area</label>
 <input
 type="text"
 value={businessForm.service_area}
 onChange={(e) => setBusinessForm({ ...businessForm, service_area: e.target.value })}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 <div className="flex items-center justify-between pt-2">
 <p className="text-sm text-text-secondary">
 Commission rate: <span className="font-medium text-text-primary">{settings?.commission_rate}%</span>
 </p>
 <button
 type="submit"
 disabled={savingProfile}
 className="bg-accent text-accent-inverse px-4 py-2.5 rounded-md font-medium hover:bg-surface-elevated disabled:opacity-50 flex items-center gap-2"
 >
 {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
 <Save className="w-4 h-4" /> Save business profile
 </button>
 </div>
 </form>

 <form
 onSubmit={handleSavePayout}
 className="bg-surface-raised rounded-md border border-border p-4 sm:p-4 space-y-5"
 >
 <h2 className="text-lg font-bold text-text-primary">Payout account</h2>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Method</label>
 <select
 value={payoutForm.method}
 onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-white"
 >
 {PAYOUT_METHODS.map((m) => (
 <option key={m.value} value={m.value}>
 {m.label}
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Account name</label>
 <input
 type="text"
 value={payoutForm.account_name}
 onChange={(e) => setPayoutForm({ ...payoutForm, account_name: e.target.value })}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 required
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Account number</label>
 <input
 type="text"
 value={payoutForm.account_number}
 onChange={(e) => setPayoutForm({ ...payoutForm, account_number: e.target.value })}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 required
 />
 </div>
 <div className="flex justify-end pt-2">
 <button
 type="submit"
 disabled={savingPayout}
 className="bg-accent text-accent-inverse px-4 py-2.5 rounded-md font-medium hover:bg-surface-elevated disabled:opacity-50 flex items-center gap-2"
 >
 {savingPayout && <Loader2 className="w-4 h-4 animate-spin" />}
 <Save className="w-4 h-4" /> Save payout
 </button>
 </div>
 </form>
 </div>
 );
}
