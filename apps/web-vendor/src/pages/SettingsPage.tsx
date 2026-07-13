import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';

import { getSettings, updatePayoutAccount, updateSettings, type VendorSettings } from '../lib/api';

const PAYOUT_METHODS = [
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'aba', label: 'ABA Bank' },
  { value: 'acleda', label: 'ACLEDA Bank' },
  { value: 'bakong', label: 'Bakong' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<VendorSettings | null>(null);
  const [form, setForm] = useState({
    business_name: '',
    bio: '',
    service_area: '',
  });
  const [payoutForm, setPayoutForm] = useState({
    method: 'bank_transfer',
    account_name: '',
    account_number: '',
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPayout, setSavingPayout] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await getSettings();
      setSettings(res);
      setForm({
        business_name: res.business_name,
        bio: res.bio ?? '',
        service_area: res.service_area ?? '',
      });
      if (res.payout_account) {
        setPayoutForm({
          method: res.payout_account.method,
          account_name: res.payout_account.account_name,
          account_number: res.payout_account.account_number,
        });
      }
    } catch {
      setError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setError(null);
    setMessage(null);
    try {
      const res = await updateSettings(form);
      setSettings(res);
      setMessage('Profile saved successfully.');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to save profile.');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-angkor-orange animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-charcoal">Settings</h1>
        <p className="text-sm text-stone-gray mt-1">Update your business profile and payout details.</p>
      </div>

      {message && (
        <div className="bg-success-green/10 text-success-green rounded-xl p-4 text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-error-red/10 text-error-red rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSaveProfile}
        className="bg-card-white rounded-2xl shadow-sm border border-stone-gray/10 p-6 sm:p-8 space-y-5"
      >
        <h2 className="text-lg font-bold text-stone-charcoal">Business profile</h2>
        <div>
          <label className="block text-sm font-medium text-stone-gray mb-1">Business name</label>
          <input
            type="text"
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
            className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-gray mb-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-gray mb-1">Service area</label>
          <input
            type="text"
            value={form.service_area}
            onChange={(e) => setForm({ ...form, service_area: e.target.value })}
            className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-stone-gray">
            Commission rate: <span className="font-medium text-stone-charcoal">{settings?.commission_rate}%</span>
          </p>
          <button
            type="submit"
            disabled={savingProfile}
            className="bg-angkor-orange text-white px-6 py-2.5 rounded-xl font-medium hover:bg-angkor-orange-dark disabled:opacity-50 flex items-center gap-2"
          >
            {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" /> Save profile
          </button>
        </div>
      </form>

      <form
        onSubmit={handleSavePayout}
        className="bg-card-white rounded-2xl shadow-sm border border-stone-gray/10 p-6 sm:p-8 space-y-5"
      >
        <h2 className="text-lg font-bold text-stone-charcoal">Payout account</h2>
        <div>
          <label className="block text-sm font-medium text-stone-gray mb-1">Method</label>
          <select
            value={payoutForm.method}
            onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })}
            className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none bg-white"
          >
            {PAYOUT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-gray mb-1">Account name</label>
          <input
            type="text"
            value={payoutForm.account_name}
            onChange={(e) => setPayoutForm({ ...payoutForm, account_name: e.target.value })}
            className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-gray mb-1">Account number</label>
          <input
            type="text"
            value={payoutForm.account_number}
            onChange={(e) => setPayoutForm({ ...payoutForm, account_number: e.target.value })}
            className="w-full rounded-xl border border-stone-gray/20 px-4 py-3 focus:border-angkor-orange focus:ring-1 focus:ring-angkor-orange outline-none"
            required
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingPayout}
            className="bg-angkor-orange text-white px-6 py-2.5 rounded-xl font-medium hover:bg-angkor-orange-dark disabled:opacity-50 flex items-center gap-2"
          >
            {savingPayout && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" /> Save payout
          </button>
        </div>
      </form>
    </div>
  );
}
