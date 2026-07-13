import { apiFetch } from '@/lib/api';

export interface AiMessage {
  id: number;
  role: 'system' | 'user' | 'assistant';
  body: string;
  created_at: string;
}

export interface AiConversation {
  id: number;
  title: string | null;
  status: 'ai_handled' | 'escalated' | 'resolved';
  messages_count: number;
  created_at: string;
  updated_at: string;
}

export interface AiChatResponse {
  conversation_id: number;
  message_id: number;
  reply: string;
  status: string;
}

export async function sendAiMessage(
  message: string,
  conversationId?: number
): Promise<AiChatResponse> {
  const response = await apiFetch('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
    }),
  });

  return (response as { data: AiChatResponse }).data;
}

export async function fetchAiConversations(): Promise<AiConversation[]> {
  const response = await apiFetch('/ai/conversations');
  return (response as { data: AiConversation[] }).data ?? [];
}

export async function fetchAiConversation(id: number): Promise<{
  id: number;
  title: string | null;
  status: string;
  messages: { data: AiMessage[] };
}> {
  const response = await apiFetch(`/ai/conversations/${id}`);
  return (response as { data: {
    id: number;
    title: string | null;
    status: string;
    messages: { data: AiMessage[] };
  } }).data;
}

export async function escalateAiConversation(id: number): Promise<{
  support_ticket_id: number;
}> {
  const response = await apiFetch(`/ai/conversations/${id}/escalate`, {
    method: 'POST',
  });
  return (response as { data: { support_ticket_id: number } }).data;
}
