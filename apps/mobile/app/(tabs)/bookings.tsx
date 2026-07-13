import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center px-6">
      <Text className="font-heading text-2xl text-stone-charcoal mb-2">
        My Bookings
      </Text>
      <Text className="font-body text-stone-gray text-center">
        Bookings will appear here once the booking flow is built in Step 15.
      </Text>
    </SafeAreaView>
  );
}
