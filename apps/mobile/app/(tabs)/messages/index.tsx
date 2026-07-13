import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';

import { fetchThreads, type MessageThread } from '@/lib/messageApi';
import { EmptyState } from '@/components/EmptyState';

function ThreadItem({ thread }: { thread: MessageThread }) {
  const otherName = thread.provider?.name ?? 'Provider';
  const lastAt = thread.last_message_at
    ? new Date(thread.last_message_at).toLocaleDateString()
    : null;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/messages/${thread.id}` as never)}
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
      {lastAt && (
        <Text className="font-body text-stone-gray text-xs mt-2">{lastAt}</Text>
      )}
    </Pressable>
  );
}

export default function MessagesScreen() {
  const { data: threads, isLoading, error, refetch } = useQuery({
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
        <EmptyState
          icon="exclamation-circle"
          title="Could not load messages"
          subtitle="Pull down to retry or check your connection."
        />
        <Pressable onPress={() => refetch()} className="mt-4">
          <Text className="font-body text-angkor-orange font-semibold">Try again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <FlatList
        data={threads ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ThreadItem thread={item} />}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#C8530A" />
        }
        ListEmptyComponent={
          <EmptyState
            icon="comments-o"
            title="No messages yet"
            subtitle="Start a conversation from any confirmed booking."
          />
        }
      />
    </SafeAreaView>
  );
}
