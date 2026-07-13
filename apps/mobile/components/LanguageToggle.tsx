import { View, Text, Pressable } from 'react-native';

import { useSettingsStore } from '@/stores/settingsStore';

const LABELS: Record<string, string> = {
  en: 'English',
  km: 'ខ្មែរ',
};

export function LanguageToggle() {
  const { language, availableLanguages, setLanguage } = useSettingsStore((state) => ({
    language: state.language,
    availableLanguages: state.availableLanguages,
    setLanguage: state.setLanguage,
  }));

  const codes = availableLanguages.length
    ? availableLanguages.map((l) => l.code)
    : (['en', 'km'] as const);

  return (
    <View className="flex-row bg-white rounded-xl p-1 shadow-sm">
      {codes.map((code) => {
        const active = language === code;
        return (
          <Pressable
            key={code}
            onPress={() => setLanguage(code as 'en' | 'km')}
            className={`flex-1 rounded-lg py-2 items-center ${active ? 'bg-angkor-orange' : ''}`}
          >
            <Text
              className={`font-body font-semibold ${
                active ? 'text-white' : 'text-stone-charcoal'
              }`}
            >
              {LABELS[code] ?? code.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
