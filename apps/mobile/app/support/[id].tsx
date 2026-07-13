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
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator color="#C8530A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-5 py-4 flex-row items-center border-b border-stone-gray/20">
          <Pressable onPress={() => router.back()} className="mr-3">
            <FontAwesome name="arrow-left" size={22} color="#2B2622" />
          </Pressable>
          <View className="flex-1">
            <Text className="font-heading text-lg text-stone-charcoal" numberOfLines={1}>
              {conversation?.title ?? 'AI Support'}
            </Text>
            <Text className="font-body text-stone-gray text-xs">Powered by AI · Escalate anytime</Text>
          </View>
          <Pressable
            onPress={handleEscalate}
            disabled={escalateMutation.isPending}
            className="px-3 py-2 rounded-full bg-stone-gray/10 active:bg-stone-gray/20 disabled:opacity-50"
          >
            <Text className="font-body text-xs text-stone-charcoal font-semibold">Human</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-4"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.length === 0 && (
            <View className="bg-white rounded-2xl p-4 mb-4 self-start max-w-[85%]">
              <Text className="font-body text-stone-charcoal leading-5">
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
                    isUser ? 'bg-angkor-orange' : 'bg-white'
                  }`}
                >
                  <Text
                    className={`font-body text-sm leading-5 ${
                      isUser ? 'text-white' : 'text-stone-charcoal'
                    }`}
                  >
                    {message.body}
                  </Text>
                </View>
                {message.created_at && (
                  <Text className="font-body text-stone-gray text-xs mt-1 px-1">
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
            <View className="self-start bg-white rounded-2xl px-4 py-3 mb-3">
              <ActivityIndicator color="#C8530A" size="small" />
            </View>
          )}
        </ScrollView>

        <View className="bg-white border-t border-stone-gray/20 p-3 flex-row items-end">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question..."
            multiline
            className="flex-1 bg-stone-gray/10 rounded-xl px-4 py-3 font-body text-stone-charcoal max-h-32"
          />
          <Pressable
            onPress={() => {
              const body = input.trim();
              if (body) sendMutation.mutate(body);
            }}
            disabled={!input.trim() || sendMutation.isPending}
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
