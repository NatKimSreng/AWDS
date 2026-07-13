import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/lib/authApi';

export default function HomeScreen() {
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
    <SafeAreaView className="flex-1 bg-sand-bg px-6 justify-center">
      <View className="bg-white rounded-2xl p-6 shadow-sm">
        <Text className="font-heading text-2xl text-stone-charcoal mb-2">
          Welcome, {user?.name ?? 'Guest'}
        </Text>
        <Text className="font-body text-stone-gray mb-6">
          {user?.email ?? 'Not signed in'}
        </Text>

        <TouchableOpacity
          onPress={handleLogout}
          className="rounded-xl bg-angkor-orange py-3.5 items-center active:bg-angkor-orange-dark"
        >
          <Text className="font-body text-base font-semibold text-white">Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
