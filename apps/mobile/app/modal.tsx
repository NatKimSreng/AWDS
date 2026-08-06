import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ModalScreen() {
  return (
    <View className="flex-1 bg-gyg-bg items-center justify-center px-6">
      <View className="w-20 h-20 rounded-full bg-gyg-light items-center justify-center mb-6">
        <FontAwesome name="info" size={32} color="#000C3B" />
      </View>
      <Text className="font-heading text-2xl text-gyg-text mb-2">Modal</Text>
      <Text className="font-body text-gyg-muted text-center mb-6">
        This is a placeholder modal screen. Replace it with your own content.
      </Text>
      <Link href="/" asChild>
        <Pressable className="bg-gyg-navy rounded-xl px-6 py-3.5 active:bg-black">
          <Text className="font-body text-white font-semibold">Go back home</Text>
        </Pressable>
      </Link>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
