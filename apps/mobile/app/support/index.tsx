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

function ConversationItem({ conversation }: { conversation: AiConversation }) {
  const isEscalated = conversation.status === 'escalated';

  return (
    <Pressable
      onPress={() => router.push(`/support/${conversation.id}` as never)}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm active:bg-stone-gray/10"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <Text className="font-heading text-base text-stone-charcoal mb-1" numberOfLines={1}>
            {conversation.title ?? 'Support chat'}
          </Text>
          <Text className="font-body text-stone-gray text-sm">
            {conversation.messages_count} message{conversation.messages_count === 1 ? '' : 's'}
          </Text>
        </View>
        {isEscalated && (
          <View className="bg-angkor-orange/10 rounded-full px-2.5 py-1">
            <Text className="font-body text-xs text-angkor-orange font-semibold">Escalated</Text>
          </View>
        )}
      </View>
      <Text className="font-body text-stone-gray text-xs mt-2">
        {new Date(conversation.updated_at).toLocaleDateString()}
      </Text>
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
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator color="#C8530A" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg px-6">
        <EmptyState
          icon="exclamation-circle"
          title="Could not load support chats"
          subtitle="Pull down to retry or check your connection."
        />
        <Pressable onPress={() => refetch()} className="mt-4 self-center">
          <Text className="font-body text-angkor-orange font-semibold">Try again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="mr-3">
            <FontAwesome name="arrow-left" size={22} color="#2B2622" />
          </Pressable>
          <Text className="font-heading text-xl text-stone-charcoal">Support</Text>
        </View>

        <Pressable
          onPress={() => router.push('/support/new' as never)}
          className="bg-angkor-orange rounded-2xl p-4 flex-row items-center justify-center active:bg-angkor-orange-dark mb-2"
        >
          <FontAwesome name="plus" size={16} color="#FFFFFF" className="mr-2" />
          <Text className="font-body text-white font-semibold ml-2">Start new chat</Text>
        </Pressable>
      </View>

      <FlatList
        data={conversations ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ConversationItem conversation={item} />}
        contentContainerClassName="px-4 pb-6"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#C8530A" />
        }
        ListEmptyComponent={
          <EmptyState
            icon="comments-o"
            title="No support chats yet"
            subtitle="Start a new chat to ask about bookings, tours, or account help."
          />
        }
      />
    </SafeAreaView>
  );
}
