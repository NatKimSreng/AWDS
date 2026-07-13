<?php

namespace App\Services;

use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiChatService
{
    private const MAX_CONTEXT_MESSAGES = 20;

    /**
     * Send a user message to the AI and store the exchange.
     *
     * @return array{conversation_id: int, message_id: int, reply: string, status: string}
     */
    public function sendMessage(User $user, ?int $conversationId, string $message): array
    {
        $conversation = $this->getOrCreateConversation($user, $conversationId, $message);

        AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'body' => $message,
        ]);

        $reply = $this->fetchAiReply($conversation, $user);

        $assistantMessage = AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'body' => $reply,
        ]);

        return [
            'conversation_id' => $conversation->id,
            'message_id' => $assistantMessage->id,
            'reply' => $reply,
            'status' => $conversation->status,
        ];
    }

    /**
     * Escalate the conversation to a human support ticket.
     *
     * @return array{support_ticket_id: int}
     */
    public function escalate(AiConversation $conversation): array
    {
        $conversation->update(['status' => 'escalated']);

        $transcript = $this->buildTranscript($conversation);

        $ticket = SupportTicket::create([
            'user_id' => $conversation->user_id,
            'subject' => $this->escalationSubject($conversation),
            'body' => $transcript,
            'status' => 'open',
            'ai_handled' => true,
            'escalated_at' => now(),
        ]);

        return [
            'support_ticket_id' => $ticket->id,
        ];
    }

    /**
     * Build the system prompt for OpenAI.
     */
    private function systemPrompt(): string
    {
        return <<<'PROMPT'
You are a helpful customer support assistant for AngkorWatDayTour.com, a tour booking platform based in Siem Reap, Cambodia.

Your job:
- Answer questions about tours, activities, providers, prices, availability, bookings, payments, refunds, cancellations, and account issues.
- Be friendly, concise, and accurate.
- Prices are usually shown in USD and sometimes in Cambodian Riel (KHR).
- Most tours depart from Siem Reap and cover Angkor Wat, Angkor Thom, Ta Prohm, Tonlé Sap, countryside, food tours, photography tours, and more.
- Booking process: browse activities, pick a date/time slot, enter traveler count, review total, pay via Bakong KHQR or card, receive e-ticket QR code and confirmation email.
- Cancellation policy: full refund if cancelled more than 24 hours before the scheduled start time; no refund within 24 hours or after the start time.
- If a user asks to speak to a human, says "contact support", or you cannot confidently answer, tell them you are escalating the request and a support agent will follow up.
- Never make up booking details, prices, or policies. If you don't know, escalate.
PROMPT;
    }

    private function getOrCreateConversation(User $user, ?int $conversationId, string $message): AiConversation
    {
        if ($conversationId) {
            $conversation = AiConversation::query()
                ->where('user_id', $user->id)
                ->findOrFail($conversationId);

            if (! $conversation->title) {
                $conversation->update(['title' => $this->generateTitle($message)]);
            }

            return $conversation;
        }

        return AiConversation::create([
            'user_id' => $user->id,
            'title' => $this->generateTitle($message),
            'status' => 'ai_handled',
        ]);
    }

    private function generateTitle(string $message): string
    {
        $title = mb_substr($message, 0, 80);

        return mb_strlen($message) > 80 ? $title.'...' : $title;
    }

    private function fetchAiReply(AiConversation $conversation, User $user): string
    {
        $apiKey = config('services.openai.key');
        $model = config('services.openai.model', 'gpt-4o-mini');

        if (! $apiKey) {
            Log::warning('OpenAI API key is not configured.');

            return $this->fallbackReply();
        }

        $messages = $this->buildOpenAiMessages($conversation);

        try {
            $response = Http::withToken($apiKey)
                ->timeout(30)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $model,
                    'messages' => $messages,
                    'temperature' => 0.5,
                    'max_tokens' => 500,
                ]);

            if (! $response->successful()) {
                Log::error('OpenAI API error', ['status' => $response->status(), 'body' => $response->body()]);

                return $this->fallbackReply();
            }

            $data = $response->json();
            $content = $data['choices'][0]['message']['content'] ?? null;

            if (! is_string($content) || trim($content) === '') {
                return $this->fallbackReply();
            }

            return trim($content);
        } catch (\Throwable $e) {
            Log::error('OpenAI request failed', ['error' => $e->getMessage()]);

            return $this->fallbackReply();
        }
    }

    /**
     * @return array<array{role: string, content: string}>
     */
    private function buildOpenAiMessages(AiConversation $conversation): array
    {
        $history = $conversation->messages()
            ->latest()
            ->limit(self::MAX_CONTEXT_MESSAGES)
            ->get()
            ->sortBy(fn (AiMessage $m) => $m->created_at)
            ->values();

        $messages = [
            ['role' => 'system', 'content' => $this->systemPrompt()],
        ];

        foreach ($history as $message) {
            $messages[] = [
                'role' => $message->role,
                'content' => $message->body,
            ];
        }

        return $messages;
    }

    private function fallbackReply(): string
    {
        return "I'm sorry, I can't answer that right now. I've passed your request to our support team and someone will get back to you soon.";
    }

    private function buildTranscript(AiConversation $conversation): string
    {
        $lines = [];

        foreach ($conversation->messages as $message) {
            $label = $message->role === 'assistant' ? 'Assistant' : 'Customer';
            $lines[] = "{$label}: {$message->body}";
        }

        return implode("\n\n", $lines);
    }

    private function escalationSubject(AiConversation $conversation): string
    {
        $title = $conversation->title ?? 'AI chat escalation';

        return 'Escalation: '.$title;
    }
}
