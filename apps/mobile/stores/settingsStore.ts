import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrencyCode = 'USD' | 'KHR';
export type LanguageCode = 'en' | 'km';

export interface Currency {
  code: CurrencyCode;
  label: string;
  symbol: string;
  exchange_rate_to_usd: string;
  is_default: boolean;
}

export interface Language {
  code: LanguageCode;
  label: string;
  native_label: string;
}

interface SettingsState {
  currency: CurrencyCode;
  language: LanguageCode;
  availableCurrencies: Currency[];
  availableLanguages: Language[];
  setCurrency: (code: CurrencyCode) => void;
  setLanguage: (code: LanguageCode) => void;
  setAvailableCurrencies: (currencies: Currency[]) => void;
  setAvailableLanguages: (languages: Language[]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      language: 'en',
      availableCurrencies: [],
      availableLanguages: [],

      setCurrency: (code) => set({ currency: code }),
      setLanguage: (code) => set({ language: code }),

      setAvailableCurrencies: (currencies) => {
        const defaultCurrency = currencies.find((c) => c.is_default);
        const current = get().currency;
        const hasCurrent = currencies.some((c) => c.code === current);

        set({
          availableCurrencies: currencies,
          currency: hasCurrent ? current : (defaultCurrency?.code ?? 'USD'),
        });
      },

      setAvailableLanguages: (languages) => {
        const current = get().language;
        const hasCurrent = languages.some((l) => l.code === current);

        set({
          availableLanguages: languages,
          language: hasCurrent ? current : (languages[0]?.code ?? 'en'),
        });
      },
    }),
    {
      name: 'mobile-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ currency: state.currency, language: state.language }),
    }
  )
);
