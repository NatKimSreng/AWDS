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

import { fetchAiConversations, type AiConversation } from '@/lib/aiChatApi';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

function ConversationItem({ conversation }: { conversation: AiConversation }) {
  const isEscalated = conversation.status === 'escalated';

  return (
    <Pressable
      onPress={() => router.push(`/support/${conversation.id}` as never)}
      className="bg-white rounded-2xl p-4 mb-3 shadow-card border border-gyg-border active:bg-gyg-bg"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <Text className="font-heading text-base text-gyg-text mb-1" numberOfLines={1}>
            {conversation.title ?? 'Support chat'}
          </Text>
          <View className="flex-row items-center">
            <FontAwesome name="comments" size={12} color="#6B7280" />
            <Text className="font-body text-gyg-muted text-sm ml-1.5">
              {conversation.messages_count} message{conversation.messages_count === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
        {isEscalated && (
          <View className="bg-amber-100 rounded-full px-2.5 py-1">
            <Text className="font-body text-xs text-amber-800 font-semibold">Escalated</Text>
          </View>
        )}
      </View>
      <View className="flex-row items-center mt-2">
        <FontAwesome name="clock-o" size={12} color="#9CA3AF" />
        <Text className="font-body text-gyg-muted text-xs ml-1.5">
          {new Date(conversation.updated_at).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
}

export default function SupportScreen() {
  const { data: conversations, isLoading, error, refetch } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: fetchAiConversations,
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
          <Text className="font-heading text-2xl text-gyg-text">Support</Text>
        </View>
        <ErrorState
          title="Could not load support chats"
          error={error}
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center mb-4">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-gyg-light mr-2"
          >
            <FontAwesome name="arrow-left" size={20} color="#000C3B" />
          </Pressable>
          <View>
            <Text className="font-heading text-2xl text-gyg-text">Support</Text>
            <Text className="font-body text-sm text-gyg-muted">Get help from AI or a human agent</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/support/new' as never)}
          className="bg-gyg-navy rounded-2xl p-4 flex-row items-center justify-center active:bg-black shadow-card mb-2"
        >
          <FontAwesome name="plus" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text className="font-body text-white font-semibold">Start new chat</Text>
        </Pressable>
      </View>

      <FlatList
        data={conversations ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ConversationItem conversation={item} />}
        contentContainerClassName="px-4 pb-6"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#000C3B" />
        }
        ListEmptyComponent={
          <View className="py-12">
            <EmptyState
              icon="comments-o"
              title="No support chats yet"
              subtitle="Start a new chat to ask about bookings, tours, or account help."
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}
