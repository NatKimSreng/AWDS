import { Stack } from 'expo-router';

export default function MessagesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Messages', headerShown: true }}
      />
      <Stack.Screen
        name="[threadId]"
        options={{ title: 'Conversation', headerShown: true }}
      />
    </Stack>
  );
}
