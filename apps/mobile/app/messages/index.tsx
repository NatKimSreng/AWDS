import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';

import { fetchThreads, type MessageThread } from '@/lib/messageApi';

function ThreadItem({ thread }: { thread: MessageThread }) {
  const otherName = thread.provider?.name ?? 'Provider';

  return (
    <Pressable
      onPress={() => router.push(`/messages/${thread.id}` as never)}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm active:bg-stone-gray/10"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="font-heading text-base text-stone-charcoal mb-1">
            {thread.subject}
          </Text>
          <Text className="font-body text-stone-gray text-sm">
            with {otherName}
          </Text>
        </View>
        {thread.unread_count > 0 && (
          <View className="bg-angkor-orange rounded-full min-w-[24px] h-6 px-2 items-center justify-center">
            <Text className="font-body text-xs text-white font-semibold">
              {thread.unread_count}
            </Text>
          </View>
        )}
      </View>
      {thread.last_message_at && (
        <Text className="font-body text-stone-gray text-xs mt-2">
          {new Date(thread.last_message_at).toLocaleDateString()}
        </Text>
      )}
    </Pressable>
  );
}

export default function MessagesScreen() {
  const { data: threads, isLoading, error } = useQuery({
    queryKey: ['message-threads'],
    queryFn: fetchThreads,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator color="#C8530A" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center px-6">
        <Text className="font-body text-stone-gray">Could not load messages.</Text>
      </SafeAreaView>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center px-6">
        <FontAwesome name="comments-o" size={48} color="#9CA3AF" />
        <Text className="font-heading text-lg text-stone-charcoal mt-4">
          No messages yet
        </Text>
        <Text className="font-body text-stone-gray text-center mt-2">
          Start a conversation from any confirmed booking.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <FlatList
        data={threads}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ThreadItem thread={item} />}
        contentContainerClassName="p-4"
      />
    </SafeAreaView>
  );
}
