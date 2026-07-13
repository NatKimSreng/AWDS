import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="date-time" />
      <Stack.Screen name="travelers" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
