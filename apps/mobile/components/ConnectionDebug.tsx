import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { testApiConnection } from '@/lib/api';
import { API_URL } from '@/constants/api';

export function ConnectionDebug() {
  const [status, setStatus] = useState<{ ok?: boolean; message: string } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const check = async () => {
    setStatus({ message: 'Checking connection...' });
    const result = await testApiConnection();
    setStatus({ ok: result.ok, message: result.ok ? 'Connected to API' : result.message });
  };

  useEffect(() => {
    check();
  }, []);

  const isError = status?.ok === false;

  return (
    <View
      className={`mx-4 mb-4 rounded-2xl border p-4 shadow-soft ${
        isError ? 'bg-error-red/5 border-error-red/20' : 'bg-white border-gyg-border'
      }`}
    >
      <Pressable
        onPress={() => setExpanded((s) => !s)}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-2.5 flex-1">
          <View
            className={`w-2.5 h-2.5 rounded-full ${
              status?.ok ? 'bg-success-green' : isError ? 'bg-error-red' : 'bg-gyg-muted'
            }`}
          />
          <Text
            className={`font-body text-sm flex-1 ${
              isError ? 'text-error-red font-semibold' : 'text-gyg-text'
            }`}
          >
            {status?.message ?? 'Checking API...'}
          </Text>
        </View>
        <Text className="font-body text-xs text-gyg-navy font-semibold ml-2">
          {expanded ? 'Hide' : 'Fix'}
        </Text>
      </Pressable>

      {expanded && (
        <View className="mt-3 pt-3 border-t border-gyg-border/60">
          <Text className="font-body text-xs text-gyg-muted mb-1">API URL</Text>
          <Text className="font-body text-sm text-gyg-text mb-3 font-medium">{API_URL}</Text>

          {isError ? (
            <View className="mb-3">
              <Text className="font-body text-xs text-error-red font-semibold mb-1">
                Mobile can’t reach the backend
              </Text>
              <Text className="font-body text-xs text-gyg-muted leading-relaxed">
                1. Make sure your phone is on the same Wi-Fi as this computer.{'\n'}
                2. Update EXPO_PUBLIC_API_URL in apps/mobile/.env to this computer’s LAN IP.{'\n'}
                3. Restart the Expo dev server (press r in the terminal, or stop and run npm start again).{'\n'}
                4. Reload the app with Ctrl+Shift+R / Cmd+R.
              </Text>
            </View>
          ) : (
            <Text className="font-body text-xs text-gyg-muted leading-relaxed mb-3">
              If no tours appear, make sure the Laravel API is running and your device is on the same network as this computer.
            </Text>
          )}

          <Pressable
            onPress={check}
            className="bg-gyg-navy rounded-xl py-2.5 items-center active:bg-black"
          >
            <Text className="font-body text-white font-semibold text-sm">Test connection again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
