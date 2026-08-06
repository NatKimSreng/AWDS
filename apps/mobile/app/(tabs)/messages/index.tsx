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
import { ErrorState } from '@/components/ErrorState';

function ThreadItem({ thread }: { thread: MessageThread }) {
  const otherName = thread.provider?.name ?? 'Provider';
  const lastAt = thread.last_message_at
    ? new Date(thread.last_message_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/messages/${thread.id}` as never)}
      className="bg-white rounded-2xl p-4 mb-3 shadow-card border border-gyg-border active:bg-gyg-bg"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <Text className="font-heading text-base text-gyg-text mb-0.5" numberOfLines={1}>
            {thread.subject}
          </Text>
          <Text className="font-body text-gyg-muted text-sm">
            with {otherName}
          </Text>
        </View>
        {thread.unread_count > 0 && (
          <View className="bg-gyg-navy rounded-full min-w-[24px] h-6 px-2 items-center justify-center">
            <Text className="font-body text-xs text-white font-semibold">
              {thread.unread_count > 99 ? '99+' : thread.unread_count}
            </Text>
          </View>
        )}
      </View>
      {lastAt && (
        <View className="flex-row items-center mt-2">
          <FontAwesome name="clock-o" size={12} color="#9CA3AF" />
          <Text className="font-body text-gyg-muted text-xs ml-1.5">{lastAt}</Text>
        </View>
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
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center">
        <ActivityIndicator color="#000C3B" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg px-4">
        <View className="pt-4 pb-2">
          <Text className="font-heading text-2xl text-gyg-text">Messages</Text>
        </View>
        <ErrorState
          title="Could not load messages"
          error={error}
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <View className="px-4 pt-4 pb-2">
        <Text className="font-heading text-2xl text-gyg-text">Messages</Text>
        <Text className="font-body text-sm text-gyg-muted">Conversations with your providers</Text>
      </View>

      <FlatList
        data={threads ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ThreadItem thread={item} />}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#000C3B" />
        }
        ListEmptyComponent={
          <View className="py-12">
            <EmptyState
              icon="comments-o"
              title="No messages yet"
              subtitle="Start a conversation from any confirmed booking."
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}
