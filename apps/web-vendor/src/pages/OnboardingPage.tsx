import { useEffect, useState } from 'react';
import {
 Building2,
 Upload,
 CreditCard,
 CheckCircle,
 AlertCircle,
 ChevronRight,
 ChevronLeft,
 Loader2,
 FileText,
} from 'lucide-react';

import {
 getOnboardingApplication,
 saveBusinessInfo,
 saveDocuments,
 savePayoutAccount,
 submitApplication,
 type ProviderApplication,
} from '../lib/api';

const STEPS = [
 { id: 'business', label: 'Business', icon: Building2 },
 { id: 'documents', label: 'Documents', icon: Upload },
 { id: 'payout', label: 'Payout', icon: CreditCard },
];

const METHODS = [
 { value: 'bank', label: 'Bank Transfer' },
 { value: 'aba', label: 'ABA Pay' },
 { value: 'wing', label: 'Wing' },
];

export default function OnboardingPage() {
 const [application, setApplication] = useState<ProviderApplication | null>(null);
 const [step, setStep] = useState(0);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const [business, setBusiness] = useState({
 business_name: '',
 bio: '',
 service_area: '',
 });
 const [idFile, setIdFile] = useState<File | null>(null);
 const [licenseFile, setLicenseFile] = useState<File | null>(null);
 const [payout, setPayout] = useState({
 method: 'aba',
 account_name: '',
 account_number: '',
 });

 useEffect(() => {
 loadApplication();
 }, []);

 const loadApplication = async () => {
 try {
 setLoading(true);
 const data = await getOnboardingApplication();
 setApplication(data);
 setBusiness({
 business_name: data.business_name ?? '',
 bio: data.bio ?? '',
 service_area: data.service_area ?? '',
 });
 const defaultPayout = data.payout_accounts?.find((a) => a.is_default);
 if (defaultPayout) {
 setPayout({
 method: defaultPayout.method,
 account_name: defaultPayout.account_name,
 account_number: defaultPayout.account_number,
 });
 }
 } catch (err) {
 setError('Could not load your application. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 const handleSaveBusiness = async () => {
 try {
 setSaving(true);
 setError(null);
 const data = await saveBusinessInfo(business);
 setApplication(data);
 setStep(1);
 } catch (err) {
 setError('Failed to save business information.');
 } finally {
 setSaving(false);
 }
 };

 const handleSaveDocuments = async () => {
 if (!idFile) {
 setError('Please upload an ID document.');
 return;
 }

 try {
 setSaving(true);
 setError(null);
 const data = await saveDocuments({ id_document: idFile, license_document: licenseFile });
 setApplication(data);
 setStep(2);
 } catch (err) {
 setError('Failed to upload documents.');
 } finally {
 setSaving(false);
 }
 };

 const handleSavePayout = async () => {
 try {
 setSaving(true);
 setError(null);
 const data = await savePayoutAccount(payout);
 setApplication(data);
 setStep(3);
 } catch (err) {
 setError('Failed to save payout account.');
 } finally {
 setSaving(false);
 }
 };

 const handleSubmit = async () => {
 try {
 setSaving(true);
 setError(null);
 const data = await submitApplication();
 setApplication(data);
 } catch (err: any) {
 const message = err?.response?.data?.message ?? 'Failed to submit application.';
 const errors = err?.response?.data?.errors;
 const detail = errors ? Object.values(errors).flat().join(' ') : '';
 setError(`${message} ${detail}`.trim());
 } finally {
 setSaving(false);
 }
 };

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-surface">
 <Loader2 className="w-8 h-8 text-text-primary animate-spin" />
 </div>
 );
 }

 const isReadOnly =
 application?.onboarding_status === 'submitted' ||
 application?.onboarding_status === 'approved' ||
 application?.onboarding_status === 'rejected';

 if (isReadOnly) {
 return (
 <div className="min-h-screen bg-surface p-4">
 <div className="max-w-2xl mx-auto bg-surface-raised rounded-md p-4">
 <div className="text-center mb-4">
 {application.onboarding_status === 'approved' ? (
 <>
 <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
 <h1 className="text-2xl font-bold text-text-primary mb-2">You're approved!</h1>
 <p className="text-text-secondary">Your provider account has been approved. The full dashboard will be available soon.</p>
 </>
 ) : application.onboarding_status === 'rejected' ? (
 <>
 <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
 <h1 className="text-2xl font-bold text-text-primary mb-2">Application not approved</h1>
 <p className="text-text-secondary">Please contact support for more information.</p>
 </>
 ) : (
 <>
 <FileText className="w-16 h-16 text-text-primary mx-auto mb-4" />
 <h1 className="text-2xl font-bold text-text-primary mb-2">Application submitted</h1>
 <p className="text-text-secondary">We're reviewing your details. You'll be notified once the review is complete.</p>
 </>
 )}
 </div>

 <div className="space-y-4">
 <div className="bg-surface rounded-md p-4">
 <p className="text-sm text-text-secondary mb-1">Business name</p>
 <p className="font-medium text-text-primary">{application?.business_name || '-'}</p>
 </div>
 <div className="bg-surface rounded-md p-4">
 <p className="text-sm text-text-secondary mb-1">Service area</p>
 <p className="font-medium text-text-primary">{application?.service_area || '-'}</p>
 </div>
 <div className="bg-surface rounded-md p-4">
 <p className="text-sm text-text-secondary mb-1">Status</p>
 <p className="font-medium text-text-primary capitalize">{application?.onboarding_status}</p>
 </div>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-surface p-4">
 <div className="max-w-3xl mx-auto">
 <div className="mb-4 text-center">
 <h1 className="text-3xl font-bold text-text-primary mb-2">Become a Provider</h1>
 <p className="text-text-secondary">Complete the steps below to list your tours on AngkorWatDayTour.</p>
 </div>

 <div className="flex items-center justify-between mb-4">
 {STEPS.map((s, index) => {
 const Icon = s.icon;
 const isActive = index === step;
 const isCompleted = index < step;

 return (
 <div key={s.id} className="flex items-center">
 <div
 className={`flex items-center gap-2 px-4 py-2 rounded-full ${
 isActive
 ? 'bg-accent text-accent-inverse'
 : isCompleted
 ? 'bg-success/10 text-success'
 : 'bg-surface-elevated text-text-secondary'
 }`}
 >
 <Icon className="w-4 h-4" />
 <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
 </div>
 {index < STEPS.length - 1 && (
 <ChevronRight className="w-4 h-4 text-text-secondary mx-2" />
 )}
 </div>
 );
 })}
 </div>

 {error && (
 <div className="bg-error/10 text-error rounded-md p-4 mb-3 flex items-start gap-3">
 <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
 <p className="text-sm">{error}</p>
 </div>
 )}

 <div className="bg-surface-raised rounded-md p-4 sm:p-4">
 {step === 0 && (
 <div className="space-y-5">
 <h2 className="text-xl font-bold text-text-primary">Business Information</h2>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Business name *</label>
 <input
 type="text"
 value={business.business_name}
 onChange={(e) => setBusiness({ ...business, business_name: e.target.value })}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 placeholder="e.g. Angkor Sunrise Tours"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Bio / About</label>
 <textarea
 value={business.bio}
 onChange={(e) => setBusiness({ ...business, bio: e.target.value })}
 rows={4}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none"
 placeholder="Tell us about your experience and tours..."
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Service area</label>
 <input
 type="text"
 value={business.service_area}
 onChange={(e) => setBusiness({ ...business, service_area: e.target.value })}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 placeholder="e.g. Siem Reap, Angkor Park"
 />
 </div>

 <div className="pt-2">
 <button
 onClick={handleSaveBusiness}
 disabled={saving || !business.business_name.trim()}
 className="w-full sm:w-auto bg-accent text-accent-inverse font-medium px-4 py-3 rounded-md hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
 Save & continue
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 )}

 {step === 1 && (
 <div className="space-y-5">
 <h2 className="text-xl font-bold text-text-primary">Verification Documents</h2>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">ID document *</label>
 <input
 type="file"
 accept="image/*"
 onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
 className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent/10 file:text-text-primary file:font-medium"
 />
 {application?.id_document_url && !idFile && (
 <p className="text-xs text-text-secondary mt-2">Already uploaded. Choose a new file to replace it.</p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Business license document</label>
 <input
 type="file"
 accept="image/*"
 onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)}
 className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent/10 file:text-text-primary file:font-medium"
 />
 </div>

 <div className="flex flex-col sm:flex-row gap-3 pt-2">
 <button
 onClick={() => setStep(0)}
 className="px-4 py-3 rounded-md border border-border text-text-primary font-medium hover:bg-surface-elevated flex items-center justify-center gap-2"
 >
 <ChevronLeft className="w-4 h-4" />
 Back
 </button>
 <button
 onClick={handleSaveDocuments}
 disabled={saving}
 className="flex-1 bg-accent text-accent-inverse font-medium px-4 py-3 rounded-md hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
 Upload & continue
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 )}

 {step === 2 && (
 <div className="space-y-5">
 <h2 className="text-xl font-bold text-text-primary">Payout Account</h2>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Payout method *</label>
 <select
 value={payout.method}
 onChange={(e) => setPayout({ ...payout, method: e.target.value })}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-white"
 >
 {METHODS.map((m) => (
 <option key={m.value} value={m.value}>
 {m.label}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Account holder name *</label>
 <input
 type="text"
 value={payout.account_name}
 onChange={(e) => setPayout({ ...payout, account_name: e.target.value })}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 placeholder="Full name on the account"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Account number *</label>
 <input
 type="text"
 value={payout.account_number}
 onChange={(e) => setPayout({ ...payout, account_number: e.target.value })}
 className="w-full rounded-md border border-border px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 placeholder="Account or phone number"
 />
 </div>

 <div className="flex flex-col sm:flex-row gap-3 pt-2">
 <button
 onClick={() => setStep(1)}
 className="px-4 py-3 rounded-md border border-border text-text-primary font-medium hover:bg-surface-elevated flex items-center justify-center gap-2"
 >
 <ChevronLeft className="w-4 h-4" />
 Back
 </button>
 <button
 onClick={handleSavePayout}
 disabled={saving || !payout.account_name.trim() || !payout.account_number.trim()}
 className="flex-1 bg-accent text-accent-inverse font-medium px-4 py-3 rounded-md hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
 Save & review
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 )}

 {step === 3 && (
 <div className="space-y-5">
 <h2 className="text-xl font-bold text-text-primary">Review & Submit</h2>

 <div className="bg-surface rounded-md p-5 space-y-3">
 <div>
 <p className="text-sm text-text-secondary">Business name</p>
 <p className="font-medium text-text-primary">{application?.business_name || business.business_name}</p>
 </div>
 <div>
 <p className="text-sm text-text-secondary">Service area</p>
 <p className="font-medium text-text-primary">{application?.service_area || business.service_area || '-'}</p>
 </div>
 <div>
 <p className="text-sm text-text-secondary">ID document</p>
 <p className="font-medium text-text-primary">{application?.id_document_url ? 'Uploaded' : 'Not uploaded'}</p>
 </div>
 <div>
 <p className="text-sm text-text-secondary">Payout account</p>
 <p className="font-medium text-text-primary">
 {payout.method.toUpperCase()} · {payout.account_name} · {payout.account_number}
 </p>
 </div>
 </div>

 <div className="flex flex-col sm:flex-row gap-3 pt-2">
 <button
 onClick={() => setStep(2)}
 className="px-4 py-3 rounded-md border border-border text-text-primary font-medium hover:bg-surface-elevated flex items-center justify-center gap-2"
 >
 <ChevronLeft className="w-4 h-4" />
 Back
 </button>
 <button
 onClick={handleSubmit}
 disabled={saving}
 className="flex-1 bg-success text-accent-inverse font-medium px-4 py-3 rounded-md hover:bg-success disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
 Submit application
 <CheckCircle className="w-4 h-4" />
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
