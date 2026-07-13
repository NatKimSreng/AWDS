import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/lib/authApi';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function ProfileScreen() {
  const { user, clearAuth } = useAuthStore((state) => ({
    user: state.user,
    clearAuth: state.clearAuth,
  }));

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      await clearAuth();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-bg px-6 py-4">
      <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <Text className="font-heading text-2xl text-stone-charcoal mb-1">
          {user?.name ?? 'Guest'}
        </Text>
        <Text className="font-body text-stone-gray">{user?.email ?? 'Not signed in'}</Text>
      </View>

      <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <Text className="font-heading text-lg text-stone-charcoal mb-3">Preferences</Text>
        <Text className="font-body text-stone-gray text-sm mb-2">Currency</Text>
        <CurrencyToggle />
        <Text className="font-body text-stone-gray text-sm mb-2 mt-4">Language</Text>
        <LanguageToggle />
      </View>

      <Pressable
        onPress={handleLogout}
        className="rounded-xl bg-error-red py-3.5 items-center active:bg-error-red/80"
      >
        <Text className="font-body text-base font-semibold text-white">Log out</Text>
      </Pressable>
    </SafeAreaView>
  );
}
