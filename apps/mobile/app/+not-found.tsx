import { Link, Stack } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!', headerShown: false }} />
      <View className="flex-1 bg-gyg-bg items-center justify-center px-6">
        <View className="w-24 h-24 rounded-full bg-gyg-light items-center justify-center mb-6">
          <FontAwesome name="question" size={40} color="#000C3B" />
        </View>
        <Text className="font-heading text-2xl text-gyg-text mb-2 text-center">This screen doesn't exist.</Text>
        <Text className="font-body text-gyg-muted text-center mb-6">
          The page you're looking for may have moved or been removed.
        </Text>
        <Link href="/" asChild>
          <Pressable className="bg-gyg-navy rounded-xl px-6 py-3.5 active:bg-black">
            <Text className="font-body text-white font-semibold">Go to home screen</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}
