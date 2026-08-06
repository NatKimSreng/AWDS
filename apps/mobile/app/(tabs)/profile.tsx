import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/lib/authApi';
import { fetchProfile, type Profile } from '@/lib/profileApi';
import { rewriteAssetUrl } from '@/lib/assetUrl';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Avatar } from '@/components/ImageWithFallback';

interface MenuRowProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  onPress: () => void;
  badge?: number;
  color?: string;
}

function MenuRow({ icon, label, onPress, badge, color = '#1A1A1A' }: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-3.5 border-b border-gyg-border last:border-b-0 active:bg-gyg-bg"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-9 h-9 rounded-xl bg-gyg-bg items-center justify-center mr-3">
          <FontAwesome name={icon} size={17} color={color} />
        </View>
        <Text className="font-body text-base text-gyg-text">{label}</Text>
      </View>
      <View className="flex-row items-center">
        {badge ? (
          <View className="bg-gyg-navy rounded-full min-w-[24px] h-[24px] px-1.5 items-center justify-center mr-2">
            <Text className="font-body text-xs text-white font-semibold">{badge > 99 ? '99+' : badge}</Text>
          </View>
        ) : null}
        <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

function StatCard({
  icon,
  value,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  value: number | string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-1 bg-white rounded-2xl p-3 shadow-card border border-gyg-border items-center active:bg-gyg-bg"
    >
      <View className="w-10 h-10 rounded-full bg-gyg-blue/10 items-center justify-center mb-1.5">
        <FontAwesome name={icon} size={16} color="#000C3B" />
      </View>
      <Text className="font-heading text-xl text-gyg-text">{value != null ? value : 0}</Text>
      <Text className="font-body text-xs text-gyg-muted text-center">{label}</Text>
    </Pressable>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
}) {
  if (!value) return null;

  return (
    <View className="flex-row items-center justify-between py-2.5 border-b border-gyg-border last:border-b-0">
      <View className="flex-row items-center flex-1">
        <FontAwesome name={icon} size={14} color="#6B7280" />
        <Text className="font-body text-sm text-gyg-muted ml-2.5">{label}</Text>
      </View>
      <Text className="font-body text-sm text-gyg-text flex-1 text-right ml-4" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function formatMemberSince(date?: string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });
}

function getRoleName(role: unknown): string {
  if (typeof role === 'string') return role;
  if (role && typeof role === 'object' && 'name' in role && typeof role.name === 'string') {
    return role.name;
  }
  return 'Member';
}

function SkeletonLine({ width = '100%' }: { width?: `${number}%` | number }) {
  return (
    <View
      className="h-4 bg-gyg-light rounded mb-3"
      style={{ width }}
    />
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: profile,
    isLoading,
    refetch,
  } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: !!user,
  });

  useFocusEffect(
    useCallback(() => {
      if (user) {
        refetch();
      }
    }, [user, refetch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLogout = async () => {
    Alert.alert('Log out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } finally {
            await clearAuth();
          }
        },
      },
    ]);
  };

  const displayUser = profile ? { ...user, ...profile } : user;
  const stats = displayUser?.stats;
  const isVerified = !!displayUser?.email_verified_at;

  if (isLoading && !displayUser) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg px-5 py-4">
        <View className="bg-gyg-navy rounded-3xl p-5 shadow-card mb-5 overflow-hidden">
          <View className="flex-row items-center">
            <View className="w-20 h-20 rounded-full bg-white/10" />
            <View className="ml-4 flex-1">
              <SkeletonLine width="60%" />
              <SkeletonLine width="80%" />
            </View>
          </View>
          <View className="mt-5 h-10 bg-white/10 rounded-xl" />
        </View>

        <View className="flex-row gap-3 mb-5">
          {[1, 2, 3].map((i) => (
            <View key={i} className="flex-1 bg-white rounded-2xl p-3 shadow-card border border-gyg-border items-center">
              <View className="w-10 h-10 rounded-full bg-gyg-bg mb-1.5" />
              <View className="w-8 h-5 bg-gyg-light rounded mb-1" />
              <View className="w-12 h-3 bg-gyg-light rounded" />
            </View>
          ))}
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-card border border-gyg-border mb-4">
          <SkeletonLine width="40%" />
          <SkeletonLine />
          <SkeletonLine />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <ScrollView
        className="flex-1 px-5 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000C3B" />
        }
      >
        {displayUser ? (
          <View className="bg-gyg-navy rounded-3xl p-5 shadow-card mb-5 overflow-hidden">
            <View className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-12 -mt-12" />
            <View className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full -ml-10 -mb-10" />

            <View className="flex-row items-center">
              <Avatar uri={rewriteAssetUrl(displayUser.avatar_url)} name={displayUser.name} size={84} />
              <View className="ml-4 flex-1">
                <View className="flex-row items-center">
                  <Text className="font-heading text-xl text-white mb-0.5 mr-2">
                    {displayUser.name}
                  </Text>
                  {isVerified && (
                    <View className="w-5 h-5 rounded-full bg-gyg-blue items-center justify-center mb-0.5">
                      <FontAwesome name="check" size={11} color="#fff" />
                    </View>
                  )}
                </View>
                <Text className="font-body text-sm text-white/70">{displayUser.email}</Text>
                <View className="flex-row items-center mt-2.5 flex-wrap gap-2">
                  <View className="bg-white/20 rounded-full px-3 py-1">
                    <Text className="font-body text-xs text-white font-semibold capitalize">
                      {getRoleName(displayUser.role)}
                    </Text>
                  </View>
                  {displayUser.created_at && (
                    <Text className="font-body text-xs text-white/60">
                      Since {formatMemberSince(displayUser.created_at)}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <Pressable
              onPress={() => router.push('/profile/edit' as never)}
              className="mt-5 rounded-xl bg-white py-3.5 items-center flex-row justify-center active:bg-gyg-bg"
            >
              <FontAwesome name="pencil" size={14} color="#000C3B" />
              <Text className="font-body text-sm font-semibold text-gyg-navy ml-2">Edit profile</Text>
            </Pressable>
          </View>
        ) : (
          <View className="bg-white rounded-2xl p-5 shadow-card border border-gyg-border mb-5 flex-row items-center">
            <Avatar name="Guest" size={64} />
            <View className="ml-4 flex-1">
              <Text className="font-heading text-xl text-gyg-text mb-0.5">Guest</Text>
              <Text className="font-body text-sm text-gyg-muted">Sign in to view your bookings and favorites</Text>
            </View>
            <Pressable
              onPress={() => router.push('/login')}
              className="bg-gyg-navy rounded-xl px-5 py-2.5 active:opacity-90"
            >
              <Text className="font-body text-sm text-white font-semibold">Sign in</Text>
            </Pressable>
          </View>
        )}

        <View className="mb-5">
          <Text className="font-heading text-lg text-gyg-text mb-3">Your stats</Text>
          <View className="flex-row gap-3">
            <StatCard
              icon="ticket"
              value={stats?.total_bookings ?? 0}
              label="Bookings"
              onPress={() => router.push('/(tabs)/bookings')}
            />
            <StatCard
              icon="plane"
              value={stats?.upcoming_bookings ?? 0}
              label="Upcoming"
              onPress={() => router.push('/(tabs)/bookings')}
            />
            <StatCard
              icon="heart"
              value={stats?.favorites_count ?? 0}
              label="Favorites"
              onPress={() => router.push('/favorites')}
            />
          </View>
        </View>

        {displayUser ? (
          <View className="bg-white rounded-2xl p-5 shadow-card border border-gyg-border mb-4">
            <Text className="font-heading text-lg text-gyg-text mb-3">Traveler details</Text>
            {displayUser.bio ? (
              <View className="mb-3 pb-3 border-b border-gyg-border">
                <Text className="font-body text-sm text-gyg-text leading-5">{displayUser.bio}</Text>
              </View>
            ) : null}
            <InfoRow label="Phone" value={displayUser.phone ?? undefined} icon="phone" />
            <InfoRow label="Date of birth" value={displayUser.date_of_birth ?? undefined} icon="calendar" />
            <InfoRow label="Country" value={displayUser.country ?? undefined} icon="globe" />
            <InfoRow label="Nationality" value={displayUser.nationality ?? undefined} icon="flag" />
            <InfoRow label="Address" value={displayUser.address ?? undefined} icon="map-marker" />
            <InfoRow
              label="Emergency contact"
              value={
                displayUser.emergency_contact_name && displayUser.emergency_contact_phone
                  ? `${displayUser.emergency_contact_name} · ${displayUser.emergency_contact_phone}`
                  : displayUser.emergency_contact_name ?? undefined
              }
              icon="user"
            />
          </View>
        ) : null}

        <View className="bg-white rounded-2xl p-5 shadow-card border border-gyg-border mb-4">
          <Text className="font-heading text-lg text-gyg-text mb-4">Preferences</Text>
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-body text-sm text-gyg-muted">Currency</Text>
              <FontAwesome name="dollar" size={12} color="#6B7280" />
            </View>
            <CurrencyToggle />
          </View>
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-body text-sm text-gyg-muted">Language</Text>
              <FontAwesome name="language" size={12} color="#6B7280" />
            </View>
            <LanguageToggle />
          </View>
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-card border border-gyg-border mb-4">
          <Text className="font-heading text-lg text-gyg-text mb-2">Account</Text>
          <MenuRow icon="ticket" label="My Bookings" onPress={() => router.push('/(tabs)/bookings')} />
          <MenuRow
            icon="comments"
            label="Messages"
            onPress={() => router.push('/(tabs)/messages')}
            badge={stats?.unread_messages_count}
          />
          <MenuRow icon="heart" label="Favorites" onPress={() => router.push('/favorites')} />
          <MenuRow icon="question-circle" label="Support / AI Chat" onPress={() => router.push('/support' as never)} />
        </View>

        {displayUser ? (
          <Pressable
            onPress={handleLogout}
            className="rounded-2xl bg-white border border-error-red py-3.5 items-center active:bg-error-red/5 shadow-card mb-6"
          >
            <View className="flex-row items-center">
              <FontAwesome name="sign-out" size={18} color="#B3261E" />
              <Text className="font-body text-base font-semibold text-error-red ml-2">Log out</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push('/login')}
            className="rounded-2xl bg-gyg-navy py-3.5 items-center active:bg-gyg-navy/80 shadow-card mb-6"
          >
            <Text className="font-body text-base font-semibold text-white">Sign in</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
