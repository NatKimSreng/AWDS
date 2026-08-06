import { apiFetch, apiFetchMultipart } from '@/lib/api';
import type { User } from '@/stores/authStore';

export interface Profile extends User {
  stats: {
    total_bookings: number;
    upcoming_bookings: number;
    completed_bookings: number;
    favorites_count: number;
    unread_messages_count: number;
  } | null;
}

export type ProfileUpdatePayload = Partial<
  Omit<Profile, 'id' | 'email' | 'role' | 'created_at' | 'stats'>
>;

export async function fetchProfile(): Promise<Profile> {
  const response = await apiFetch('/profile');
  return (response as { data: Profile }).data;
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<Profile> {
  const response = await apiFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return (response as { data: Profile }).data;
}

export async function uploadAvatar(fileUri: string): Promise<string> {
  const formData = new FormData();
  formData.append('avatar', {
    uri: fileUri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const response = await apiFetchMultipart('/profile/avatar', {
    method: 'POST',
    body: formData as unknown as BodyInit,
  });

  return (response as { data: { avatar_url: string } }).data.avatar_url;
}
