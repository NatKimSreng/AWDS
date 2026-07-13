import { apiFetch } from '@/lib/api';
import type { Currency, Language } from '@/stores/settingsStore';

export interface SettingsResponse {
  currencies: Currency[];
  languages: Language[];
  defaults: {
    currency: string;
    language: string;
  };
}

export async function fetchSettings(): Promise<SettingsResponse> {
  const response = await apiFetch('/public/settings');
  return (response as { data: SettingsResponse }).data;
}

export interface ConvertResponse {
  amount: number;
  from: string;
  to: string;
  rate: number;
}

export async function convertAmount(
  amount: number,
  from: string,
  to: string
): Promise<ConvertResponse> {
  const response = await apiFetch('/public/exchange/convert', {
    method: 'POST',
    body: JSON.stringify({ amount, from, to }),
  });
  return (response as { data: ConvertResponse }).data;
}
