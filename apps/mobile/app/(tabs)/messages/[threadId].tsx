import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchThread, sendMessage, markMessageAsRead, type Message } from '@/lib/messageApi';
import { useAuthStore } from '@/stores/authStore';

export default function ThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const id = Number(threadId);
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  const [messageBody, setMessageBody] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: 'none' } });

    return () => {
      navigation.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  const { data: thread, isLoading } = useQuery({
    queryKey: ['message-thread', id],
    queryFn: () => fetchThread(id),
    enabled: !Number.isNaN(id),
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendMessage(id, body),
    onSuccess: () => {
      setMessageBody('');
      queryClient.invalidateQueries({ queryKey: ['message-thread', id] });
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
    },
  });

  const markAsRead = useCallback(
    async (message: Message) => {
      if (
        message.read_at ||
        message.sender_id === userId ||
        message.sender_type !== 'provider'
      ) {
        return;
      }
      await markMessageAsRead(id, message.id);
      queryClient.invalidateQueries({ queryKey: ['message-thread', id] });
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
    },
    [id, queryClient, userId]
  );

  useEffect(() => {
    if (!thread?.messages) return;
    thread.messages.forEach((message) => markAsRead(message));
  }, [thread?.messages, markAsRead]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center">
        <ActivityIndicator color="#000C3B" />
      </SafeAreaView>
    );
  }

  if (!thread) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center px-6">
        <Text className="font-body text-gyg-muted">Conversation not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-5 py-4 flex-row items-center bg-white border-b border-gyg-border">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-gyg-bg mr-2"
          >
            <FontAwesome name="arrow-left" size={20} color="#000C3B" />
          </Pressable>
          <View className="flex-1">
            <Text className="font-heading text-lg text-gyg-text" numberOfLines={1}>
              {thread.subject}
            </Text>
            <Text className="font-body text-gyg-muted text-xs">
              {thread.provider?.name ?? 'Provider'}
            </Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-4"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          <View className="bg-gyg-light rounded-xl p-3 mb-4 self-center">
            <Text className="font-body text-gyg-muted text-xs text-center">
              {thread.subject}
            </Text>
          </View>

          {thread.messages.map((message) => {
            const isMe =
              message.sender_type === 'user' && message.sender_id === userId;

            return (
              <View
                key={message.id}
                className={`mb-3 max-w-[82%] ${
                  isMe ? 'self-end' : 'self-start'
                }`}
              >
                <View
                  className={`rounded-2xl px-4 py-3 ${
                    isMe
                      ? 'bg-gyg-navy rounded-br-md'
                      : 'bg-white border border-gyg-border rounded-bl-md'
                  }`}
                >
                  <Text
                    className={`font-body text-sm leading-5 ${
                      isMe ? 'text-white' : 'text-gyg-text'
                    }`}
                  >
                    {message.body}
                  </Text>
                </View>
                <Text className="font-body text-gyg-muted text-xs mt-1 px-1">
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {isMe && message.read_at && ' · Read'}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View className="bg-white border-t border-gyg-border p-3 flex-row items-end">
          <TextInput
            value={messageBody}
            onChangeText={setMessageBody}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            multiline
            className="flex-1 bg-gyg-bg rounded-xl px-4 py-3 font-body text-gyg-text max-h-32 border border-gyg-border"
          />
          <Pressable
            onPress={() => {
              const body = messageBody.trim();
              if (body) sendMutation.mutate(body);
            }}
            disabled={!messageBody.trim() || sendMutation.isPending}
            className={`ml-3 w-11 h-11 rounded-full items-center justify-center ${
              !messageBody.trim() || sendMutation.isPending
                ? 'bg-gyg-border'
                : 'bg-gyg-navy active:bg-black'
            }`}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <FontAwesome name="send" size={18} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
