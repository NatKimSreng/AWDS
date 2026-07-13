import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/lib/authApi';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Avatar } from '@/components/ImageWithFallback';

interface MenuRowProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  onPress: () => void;
  color?: string;
}

function MenuRow({ icon, label, onPress, color = '#2B2622' }: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-3.5 border-b border-stone-gray/10 last:border-b-0 active:bg-stone-gray/5"
    >
      <View className="flex-row items-center">
        <FontAwesome name={icon} size={18} color={color} className="w-7" />
        <Text className="font-body text-base text-stone-charcoal ml-3">{label}</Text>
      </View>
      <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      await clearAuth();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <ScrollView className="flex-1 px-5 py-4">
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4 flex-row items-center">
          <Avatar uri={user?.avatar_url} name={user?.name ?? 'Guest'} size={64} />
          <View className="ml-4 flex-1">
            <Text className="font-heading text-2xl text-stone-charcoal mb-1">
              {user?.name ?? 'Guest'}
            </Text>
            <Text className="font-body text-stone-gray">{user?.email ?? 'Not signed in'}</Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <Text className="font-heading text-lg text-stone-charcoal mb-4">Preferences</Text>
          <View className="mb-4">
            <Text className="font-body text-stone-gray text-sm mb-2">Currency</Text>
            <CurrencyToggle />
          </View>
          <View>
            <Text className="font-body text-stone-gray text-sm mb-2">Language</Text>
            <LanguageToggle />
          </View>
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <Text className="font-heading text-lg text-stone-charcoal mb-2">Account</Text>
          <MenuRow icon="ticket" label="My Bookings" onPress={() => router.push('/bookings')} />
          <MenuRow icon="comments" label="Messages" onPress={() => router.push('/messages')} />
          <MenuRow icon="heart" label="Favorites" onPress={() => router.push('/favorites')} />
        </View>

        <Pressable
          onPress={handleLogout}
          className="rounded-xl bg-error-red py-3.5 items-center active:bg-error-red/80"
        >
          <Text className="font-body text-base font-semibold text-white">Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
