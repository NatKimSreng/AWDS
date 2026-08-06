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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  sendAiMessage,
  fetchAiConversation,
  escalateAiConversation,
  type AiMessage,
} from '@/lib/aiChatApi';

interface Message {
  id: number | string;
  role: 'user' | 'assistant';
  body: string;
  created_at?: string;
}

export default function SupportChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNewChat = id === 'new';
  const conversationId = isNewChat ? null : Number(id);
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(
    conversationId
  );

  useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: 'none' } });

    return () => {
      navigation.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  const { data: conversation, isLoading } = useQuery({
    queryKey: ['ai-conversation', currentConversationId],
    queryFn: () => fetchAiConversation(currentConversationId as number),
    enabled: !isNewChat && currentConversationId !== null,
  });

  useEffect(() => {
    if (conversation?.messages?.data) {
      const mapped: Message[] = conversation.messages.data
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          body: m.body,
          created_at: m.created_at,
        }));
      setMessages(mapped);
    }
  }, [conversation]);

  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      sendAiMessage(body, currentConversationId ?? undefined),
    onMutate: async (body) => {
      setIsTyping(true);
      setInput('');
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: 'user', body, created_at: new Date().toISOString() },
      ]);
    },
    onSuccess: (data) => {
      setCurrentConversationId(data.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          id: data.message_id,
          role: 'assistant',
          body: data.reply,
          created_at: new Date().toISOString(),
        },
      ]);
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-conversation', data.conversation_id] });

      if (isNewChat) {
        router.replace(`/support/${data.conversation_id}` as never);
      }
    },
    onSettled: () => {
      setIsTyping(false);
    },
  });

  const escalateMutation = useMutation({
    mutationFn: () => escalateAiConversation(currentConversationId as number),
    onSuccess: () => {
      Alert.alert(
        'Escalated',
        'A support agent will follow up with you soon.',
        [{ text: 'OK' }]
      );
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-conversation', currentConversationId] });
    },
  });

  const handleEscalate = useCallback(() => {
    if (!currentConversationId) {
      Alert.alert('Start a conversation first', 'Send a message so we can escalate it to a human.');
      return;
    }

    Alert.alert('Talk to a human?', 'We will create a support ticket with your chat history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Escalate',
        style: 'default',
        onPress: () => escalateMutation.mutate(),
      },
    ]);
  }, [currentConversationId, escalateMutation]);

  if (!isNewChat && isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center">
        <ActivityIndicator color="#000C3B" />
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
              {conversation?.title ?? 'AI Support'}
            </Text>
            <Text className="font-body text-gyg-muted text-xs">Powered by AI · Escalate anytime</Text>
          </View>
          <Pressable
            onPress={handleEscalate}
            disabled={escalateMutation.isPending}
            className="px-3 py-2 rounded-full bg-gyg-bg border border-gyg-border active:bg-gyg-light disabled:opacity-50"
          >
            <Text className="font-body text-xs text-gyg-text font-semibold">Human</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-4"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.length === 0 && (
            <View className="bg-white rounded-2xl p-4 mb-4 self-start max-w-[85%] border border-gyg-border">
              <View className="flex-row items-center mb-2">
                <View className="w-7 h-7 rounded-full bg-gyg-navy items-center justify-center mr-2">
                  <FontAwesome name="android" size={14} color="#FFFFFF" />
                </View>
                <Text className="font-heading text-sm text-gyg-text">Angkor Support</Text>
              </View>
              <Text className="font-body text-gyg-text leading-5">
                Hi! I'm your AngkorWatDayTour support assistant. Ask me about tours, bookings, payments, or refunds.
              </Text>
            </View>
          )}

          {messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <View
                key={message.id}
                className={`mb-3 max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}
              >
                <View
                  className={`rounded-2xl px-4 py-3 ${
                    isUser
                      ? 'bg-gyg-navy rounded-br-md'
                      : 'bg-white border border-gyg-border rounded-bl-md'
                  }`}
                >
                  <Text
                    className={`font-body text-sm leading-5 ${
                      isUser ? 'text-white' : 'text-gyg-text'
                    }`}
                  >
                    {message.body}
                  </Text>
                </View>
                {message.created_at && (
                  <Text className="font-body text-gyg-muted text-xs mt-1 px-1">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
              </View>
            );
          })}

          {isTyping && (
            <View className="self-start bg-white rounded-2xl px-4 py-3 mb-3 border border-gyg-border">
              <ActivityIndicator color="#000C3B" size="small" />
            </View>
          )}
        </ScrollView>

        <View className="bg-white border-t border-gyg-border p-3 flex-row items-end">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question..."
            placeholderTextColor="#9CA3AF"
            multiline
            className="flex-1 bg-gyg-bg rounded-xl px-4 py-3 font-body text-gyg-text max-h-32 border border-gyg-border"
          />
          <Pressable
            onPress={() => {
              const body = input.trim();
              if (body) sendMutation.mutate(body);
            }}
            disabled={!input.trim() || sendMutation.isPending}
            className={`ml-3 w-11 h-11 rounded-full items-center justify-center ${
              !input.trim() || sendMutation.isPending
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
