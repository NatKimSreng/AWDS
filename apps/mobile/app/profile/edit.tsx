import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';

import { useAuthStore, type User } from '@/stores/authStore';
import { AuthInput } from '@/components/AuthInput';
import { Avatar } from '@/components/ImageWithFallback';
import { updateProfile, uploadAvatar, type ProfileUpdatePayload } from '@/lib/profileApi';
import { rewriteAssetUrl } from '@/lib/assetUrl';

interface FormState {
  name: string;
  phone: string;
  date_of_birth: string;
  country: string;
  nationality: string;
  address: string;
  bio: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

function getInitialForm(user: User | null): FormState {
  return {
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    date_of_birth: user?.date_of_birth ?? '',
    country: user?.country ?? '',
    nationality: user?.nationality ?? '',
    address: user?.address ?? '',
    bio: user?.bio ?? '',
    emergency_contact_name: user?.emergency_contact_name ?? '',
    emergency_contact_phone: user?.emergency_contact_phone ?? '',
  };
}

function isValidDate(value: string): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && date <= new Date();
}

export default function EditProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [form, setForm] = useState<FormState>(getInitialForm(user));
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar_url ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const displayAvatarUri = avatarUri ? rewriteAssetUrl(avatarUri) : null;
  const isLocalAvatar = avatarUri?.startsWith('file://') ?? false;

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }, [errors]);

  const pickAvatar = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to photos to change your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    setAvatarUri(result.assets[0].uri);
  }, []);

  const validate = useCallback((): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required.';
    }
    if (form.date_of_birth && !isValidDate(form.date_of_birth)) {
      nextErrors.date_of_birth = 'Enter a valid date in YYYY-MM-DD format.';
    }
    if (form.bio && form.bio.length > 500) {
      nextErrors.bio = 'Bio must be 500 characters or less.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    if (!user) return;

    setIsSubmitting(true);
    try {
      let nextAvatarUrl = user.avatar_url;

      if (isLocalAvatar && avatarUri) {
        nextAvatarUrl = await uploadAvatar(avatarUri);
      }

      const payload: ProfileUpdatePayload = {};
      (Object.keys(form) as Array<keyof FormState>).forEach((key) => {
        const rawValue = form[key];
        const trimmedValue = rawValue.trim();
        const userValue = (user[key as keyof typeof user] ?? '').toString();

        if (trimmedValue !== userValue) {
          (payload as Record<string, string | null>)[key] = trimmedValue || null;
        }
      });

      if (nextAvatarUrl !== user.avatar_url) {
        payload.avatar_url = nextAvatarUrl ?? null;
      }

      const updated = await updateProfile(payload);
      setUser({ ...user, ...updated, stats: updated.stats ?? user.stats });
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save profile.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, user, avatarUri, setUser, validate]);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center">
        <Text className="font-body text-gyg-muted">Please sign in to edit your profile.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gyg-border">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 active:opacity-60">
            <FontAwesome name="arrow-left" size={20} color="#1A1A1A" />
          </Pressable>
          <Text className="font-heading text-lg text-gyg-text">Edit Profile</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView className="flex-1 px-5 py-4" keyboardShouldPersistTaps="handled">
          <Pressable onPress={pickAvatar} className="items-center mb-6 active:opacity-80">
            <View className="relative">
              <Avatar uri={displayAvatarUri} name={form.name} size={96} />
              <View className="absolute bottom-0 right-0 bg-gyg-blue rounded-full p-2 border-2 border-white">
                <FontAwesome name="camera" size={14} color="#FFFFFF" />
              </View>
            </View>
            <Text className="font-body text-sm text-gyg-blue mt-2 font-semibold">
              Change photo
            </Text>
          </Pressable>

          <View className="bg-white rounded-2xl p-5 shadow-card mb-4">
            <Text className="font-heading text-lg text-gyg-text mb-4">Basic Info</Text>
            <AuthInput
              label="Full name"
              value={form.name}
              onChangeText={(text) => updateField('name', text)}
              error={errors.name}
            />
            <AuthInput
              label="Phone"
              value={form.phone}
              onChangeText={(text) => updateField('phone', text)}
              keyboardType="phone-pad"
            />
            <AuthInput
              label="Date of birth (YYYY-MM-DD)"
              value={form.date_of_birth}
              onChangeText={(text) => updateField('date_of_birth', text)}
              placeholder="1990-01-01"
              keyboardType="number-pad"
              error={errors.date_of_birth}
            />
          </View>

          <View className="bg-white rounded-2xl p-5 shadow-card mb-4">
            <Text className="font-heading text-lg text-gyg-text mb-4">Location</Text>
            <AuthInput
              label="Country of residence"
              value={form.country}
              onChangeText={(text) => updateField('country', text)}
              placeholder="e.g. Cambodia"
            />
            <AuthInput
              label="Nationality"
              value={form.nationality}
              onChangeText={(text) => updateField('nationality', text)}
              placeholder="e.g. Cambodian"
            />
            <AuthInput
              label="Address"
              value={form.address}
              onChangeText={(text) => updateField('address', text)}
              placeholder="Street, city, postal code"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ minHeight: 80 }}
            />
          </View>

          <View className="bg-white rounded-2xl p-5 shadow-card mb-4">
            <Text className="font-heading text-lg text-gyg-text mb-4">About you</Text>
            <AuthInput
              label="Bio"
              value={form.bio}
              onChangeText={(text) => updateField('bio', text)}
              placeholder="Tell us a little about yourself..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 100 }}
              error={errors.bio}
            />
          </View>

          <View className="bg-white rounded-2xl p-5 shadow-card mb-4">
            <Text className="font-heading text-lg text-gyg-text mb-4">Emergency Contact</Text>
            <AuthInput
              label="Contact name"
              value={form.emergency_contact_name}
              onChangeText={(text) => updateField('emergency_contact_name', text)}
            />
            <AuthInput
              label="Contact phone"
              value={form.emergency_contact_phone}
              onChangeText={(text) => updateField('emergency_contact_phone', text)}
              keyboardType="phone-pad"
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={isSubmitting}
            className={`rounded-2xl py-4 items-center mb-6 ${
              isSubmitting ? 'bg-gyg-navy/50' : 'bg-gyg-navy active:bg-gyg-navy/80'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-body text-base font-semibold text-white">Save changes</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
