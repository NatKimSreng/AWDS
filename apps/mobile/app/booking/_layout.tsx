import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F9FAFB' },
        animation: 'slide_from_right',
        animationDuration: 220,
      }}
    >
      <Stack.Screen name="date-time" />
      <Stack.Screen name="travelers" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="review/[bookingId]" />
    </Stack>
  );
}
