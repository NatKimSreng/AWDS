import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { API_URL } from '@/constants/api';

interface ErrorStateProps {
  title?: string;
  error: Error | unknown;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  error,
  onRetry,
}: ErrorStateProps) {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  const isConnectionError = message.includes('Cannot connect') || message.includes('timed out');

  return (
    <View className="py-12 px-8 items-center">
      <View className="w-20 h-20 rounded-full bg-error-red/10 items-center justify-center mb-4">
        <FontAwesome name="exclamation-circle" size={32} color="#B3261E" />
      </View>
      <Text className="font-heading text-lg text-gyg-text mb-2 text-center">
        {title}
      </Text>
      <Text className="font-body text-gyg-muted text-center mb-2">
        {message}
      </Text>
      {isConnectionError && (
        <View className="bg-gyg-light rounded-xl p-4 mb-4 w-full max-w-sm">
          <Text className="font-body text-xs text-gyg-muted mb-1">Cannot reach API at</Text>
          <Text className="font-body text-sm text-gyg-text mb-2">{API_URL}</Text>
          <Text className="font-body text-xs text-gyg-muted leading-relaxed">
            1. Make sure Laravel is running: php artisan serve --host=0.0.0.0{'\n'}
            2. Use your computer&apos;s LAN IP in .env{'\n'}
            3. Keep device on the same Wi-Fi
          </Text>
        </View>
      )}
      {!isConnectionError && (
        <Text className="font-body text-gyg-muted text-center text-xs mb-5">
          API: {API_URL}
        </Text>
      )}
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="bg-gyg-navy rounded-xl px-6 py-3 active:bg-black"
        >
          <Text className="font-body text-white font-semibold">Try again</Text>
        </Pressable>
      )}
    </View>
  );
}
