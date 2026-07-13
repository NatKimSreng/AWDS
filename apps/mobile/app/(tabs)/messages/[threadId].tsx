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
import { useLocalSearchParams, useNavigation } from 'expo-router';
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
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator color="#C8530A" />
      </SafeAreaView>
    );
  }

  if (!thread) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center px-6">
        <Text className="font-body text-stone-gray">Conversation not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-4"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          <View className="bg-stone-gray/10 rounded-xl p-3 mb-4 self-center">
            <Text className="font-body text-stone-gray text-xs text-center">
              {thread.subject}
            </Text>
          </View>

          {thread.messages.map((message) => {
            const isMe =
              message.sender_type === 'user' && message.sender_id === userId;

            return (
              <View
                key={message.id}
                className={`mb-3 max-w-[80%] ${
                  isMe ? 'self-end' : 'self-start'
                }`}
              >
                <View
                  className={`rounded-2xl px-4 py-3 ${
                    isMe ? 'bg-angkor-orange' : 'bg-white'
                  }`}
                >
                  <Text
                    className={`font-body text-sm leading-5 ${
                      isMe ? 'text-white' : 'text-stone-charcoal'
                    }`}
                  >
                    {message.body}
                  </Text>
                </View>
                <Text className="font-body text-stone-gray text-xs mt-1 px-1">
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

        <View className="bg-white border-t border-stone-gray/20 p-3 flex-row items-center">
          <TextInput
            value={messageBody}
            onChangeText={setMessageBody}
            placeholder="Type a message..."
            multiline
            className="flex-1 bg-stone-gray/10 rounded-xl px-4 py-3 font-body text-stone-charcoal max-h-32"
          />
          <Pressable
            onPress={() => {
              const body = messageBody.trim();
              if (body) sendMutation.mutate(body);
            }}
            disabled={!messageBody.trim() || sendMutation.isPending}
            className="ml-3 w-11 h-11 rounded-full bg-angkor-orange items-center justify-center active:bg-angkor-orange-dark disabled:bg-stone-gray/40"
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
