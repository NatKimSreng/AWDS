import { apiFetch } from '@/lib/api';

export interface ThreadParticipant {
  id: number;
  name: string;
  type: 'user' | 'provider';
}

export interface MessageThread {
  id: number;
  subject: string;
  booking_id: number;
  last_message_at: string | null;
  unread_count: number;
  customer: ThreadParticipant;
  provider: ThreadParticipant;
}

export interface Message {
  id: number;
  body: string;
  sender_id: number;
  sender_type: 'user' | 'provider';
  recipient_id: number;
  recipient_type: 'user' | 'provider';
  read_at: string | null;
  created_at: string;
}

export interface ThreadDetail extends MessageThread {
  messages: Message[];
}

export async function fetchThreads(): Promise<MessageThread[]> {
  const response = await apiFetch('/message-threads');
  return (response as { data: MessageThread[] }).data;
}

export async function createThread(bookingId: number): Promise<MessageThread> {
  const response = await apiFetch(`/bookings/${bookingId}/message-threads`, {
    method: 'POST',
  });
  return (response as { data: MessageThread }).data;
}

export async function fetchThread(threadId: number): Promise<ThreadDetail> {
  const response = await apiFetch(`/message-threads/${threadId}`);
  return (response as { data: ThreadDetail }).data;
}

export async function sendMessage(
  threadId: number,
  body: string
): Promise<Message> {
  const response = await apiFetch(`/message-threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
  return (response as { data: Message }).data;
}

export async function markMessageAsRead(
  threadId: number,
  messageId: number
): Promise<Message> {
  const response = await apiFetch(
    `/message-threads/${threadId}/messages/${messageId}/read`,
    {
      method: 'PUT',
    }
  );
  return (response as { data: Message }).data;
}
