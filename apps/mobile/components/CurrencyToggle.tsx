import { View, Text, Pressable } from 'react-native';

import { useSettingsStore } from '@/stores/settingsStore';

export function CurrencyToggle() {
  const { currency, availableCurrencies, setCurrency } = useSettingsStore((state) => ({
    currency: state.currency,
    availableCurrencies: state.availableCurrencies,
    setCurrency: state.setCurrency,
  }));

  const codes = availableCurrencies.length
    ? availableCurrencies.map((c) => c.code)
    : (['USD', 'KHR'] as const);

  return (
    <View className="flex-row bg-white rounded-xl p-1 shadow-sm">
      {codes.map((code) => {
        const active = currency === code;
        return (
          <Pressable
            key={code}
            onPress={() => setCurrency(code as 'USD' | 'KHR')}
            className={`flex-1 rounded-lg py-2 items-center ${active ? 'bg-angkor-orange' : ''}`}
          >
            <Text
              className={`font-body font-semibold ${
                active ? 'text-white' : 'text-stone-charcoal'
              }`}
            >
              {code}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
