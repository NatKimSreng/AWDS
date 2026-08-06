import { Platform } from 'react-native';

function getDefaultApiUrl(): string {
  // Expo Public env takes precedence.
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // Android emulator: 10.0.2.2 maps to the host machine's localhost.
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  // iOS simulator can reach host localhost, physical devices need a LAN IP.
  return 'http://127.0.0.1:8000';
}

export const API_URL = getDefaultApiUrl();
export const API_TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT ?? '30000');
