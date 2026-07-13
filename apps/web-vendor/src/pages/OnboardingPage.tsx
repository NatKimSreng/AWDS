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
      <div className="min-h-screen flex items-center justify-center bg-sand-bg">
        <Loader2 className="w-8 h-8 text-angkor-orange animate-spin" />
      </div>
    );
  }

  const isReadOnly =
    application?.onboarding_status === 'submitted' ||
    application?.onboarding_status === 'approved' ||
    application?.onboarding_status === 'rejected';

  if (isReadOnly) {
    return (
      <div className="min-h-screen bg-sand-bg p-6">
        <div className="max-w-2xl mx-auto bg-card-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            {application.onboarding_status === 'approved' ? (
              <>
                <CheckCircle className="w-16 h-16 text-success-green mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-stone-charcoal mb-2">You're approved!</h1>
                <p className="text-stone-gray">Your provider account has been approved. The full dashboard will be available soon.</p>
              </>
            ) : application.onboarding_status === 'rejected' ? (
              <>
                <AlertCircle className="w-16 h-16 text-error-red mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-stone-charcoal mb-2">Application not approved</h1>
                <p className="text-stone-gray">Please contact support for more information.</p>
              </>
            ) : (
              <>
                <FileText className="w-16 h-16 text-angkor-orange mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-stone-charcoal mb-2">Application submitted</h1>
                <p className="text-stone-gray">We're reviewing your details. You'll be notified once the review is complete.</p>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-sand-bg rounded-xl p-4">
              <p className="text-sm text-stone-gray mb-1">Business name</p>
              <p className="font-medium text-stone-charcoal">{application?.business_name || '-'}</p>
            </div>
            <div className="bg-sand-bg rounded-xl p-4">
              <p className="text-sm text-stone-gray mb-1">Service area</p>
              <p className="font-medium text-stone-charcoal">{application?.service_area || '-'}</p>
            </div>
            <div className="bg-sand-bg rounded-xl p-4">
              <p className="text-sm text-stone-gray mb-1">Status</p>
              <p className="font-medium text-stone-charcoal capitalize">{application?.onboarding_status}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-bg p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-stone-charcoal mb-2">Become a Provider</h1>
          <p className="text-stone-gray">Complete the steps below to list your tours on AngkorWatDayTour.</p>
        </div>

        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, index) => {
            const Icon = s.icon;
            const isActive = index === step;
            const isCompleted = index < step;

            return (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    isActive
                      ? 'bg-angkor-orange text-white'
                      : isCompleted
                        ? 'bg-success-green/10 text-success-green'
                        : 'bg-stone-gray/10 text-stone-gray'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-stone-gray mx-2" />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-error-red/10 text-error-red rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-card-white rounded-2xl shadow-lg p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-stone-charcoal">Business Information</h2>

              <div>
                <label className="block text-sm font-medium text-stone-gray mb-1">Business name *</label>
                <input
                  type="text"
                  value={business.business_name}
                  onChange={(e) => setBusiness({ ...business, business_name: e.target.value })}
                  className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
                  placeholder="e.g. Angkor Sunrise Tours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-gray mb-1">Bio / About</label>
                <textarea
                  value={business.bio}
                  onChange={(e) => setBusiness({ ...business, bio: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none resize-none"
                  placeholder="Tell us about your experience and tours..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-gray mb-1">Service area</label>
                <input
                  type="text"
                  value={business.service_area}
                  onChange={(e) => setBusiness({ ...business, service_area: e.target.value })}
                  className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
                  placeholder="e.g. Siem Reap, Angkor Park"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveBusiness}
                  disabled={saving || !business.business_name.trim()}
                  className="w-full sm:w-auto bg-angkor-orange text-white font-medium px-6 py-3 rounded-xl hover:bg-angkor-orange-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <h2 className="text-xl font-bold text-stone-charcoal">Verification Documents</h2>

              <div>
                <label className="block text-sm font-medium text-stone-gray mb-1">ID document *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-stone-gray file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-angkor-orange/10 file:text-angkor-orange file:font-medium"
                />
                {application?.id_document_url && !idFile && (
                  <p className="text-xs text-stone-gray mt-2">Already uploaded. Choose a new file to replace it.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-gray mb-1">Business license document</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-stone-gray file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-angkor-orange/10 file:text-angkor-orange file:font-medium"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setStep(0)}
                  className="px-6 py-3 rounded-xl border border-stone-gray/20 text-stone-charcoal font-medium hover:bg-stone-gray/5 flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleSaveDocuments}
                  disabled={saving}
                  className="flex-1 bg-angkor-orange text-white font-medium px-6 py-3 rounded-xl hover:bg-angkor-orange-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <h2 className="text-xl font-bold text-stone-charcoal">Payout Account</h2>

              <div>
                <label className="block text-sm font-medium text-stone-gray mb-1">Payout method *</label>
                <select
                  value={payout.method}
                  onChange={(e) => setPayout({ ...payout, method: e.target.value })}
                  className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none bg-white"
                >
                  {METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-gray mb-1">Account holder name *</label>
                <input
                  type="text"
                  value={payout.account_name}
                  onChange={(e) => setPayout({ ...payout, account_name: e.target.value })}
                  className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
                  placeholder="Full name on the account"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-gray mb-1">Account number *</label>
                <input
                  type="text"
                  value={payout.account_number}
                  onChange={(e) => setPayout({ ...payout, account_number: e.target.value })}
                  className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
                  placeholder="Account or phone number"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-stone-gray/20 text-stone-charcoal font-medium hover:bg-stone-gray/5 flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleSavePayout}
                  disabled={saving || !payout.account_name.trim() || !payout.account_number.trim()}
                  className="flex-1 bg-angkor-orange text-white font-medium px-6 py-3 rounded-xl hover:bg-angkor-orange-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <h2 className="text-xl font-bold text-stone-charcoal">Review & Submit</h2>

              <div className="bg-sand-bg rounded-xl p-5 space-y-3">
                <div>
                  <p className="text-sm text-stone-gray">Business name</p>
                  <p className="font-medium text-stone-charcoal">{application?.business_name || business.business_name}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-gray">Service area</p>
                  <p className="font-medium text-stone-charcoal">{application?.service_area || business.service_area || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-gray">ID document</p>
                  <p className="font-medium text-stone-charcoal">{application?.id_document_url ? 'Uploaded' : 'Not uploaded'}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-gray">Payout account</p>
                  <p className="font-medium text-stone-charcoal">
                    {payout.method.toUpperCase()} · {payout.account_name} · {payout.account_number}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl border border-stone-gray/20 text-stone-charcoal font-medium hover:bg-stone-gray/5 flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 bg-success-green text-white font-medium px-6 py-3 rounded-xl hover:bg-success-green/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
