import { useLocalSearchParams } from 'expo-router';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Placeholder until a provider public API is added in later steps.
  const isLoading = false;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator color="#C8530A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-bg px-6">
      <View className="py-4 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-3">
          <FontAwesome name="arrow-left" size={22} color="#2B2622" />
        </Pressable>
        <Text className="font-heading text-xl text-stone-charcoal">Provider Profile</Text>
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-sm">
        <View className="w-20 h-20 rounded-full bg-stone-gray/20 self-center mb-4" />
        <Text className="font-heading text-xl text-stone-charcoal text-center mb-1">
          Provider #{id}
        </Text>
        <Text className="font-body text-stone-gray text-center">
          Full provider profile and activity listing will be wired once the provider public API is built.
        </Text>
      </View>
    </SafeAreaView>
  );
}
