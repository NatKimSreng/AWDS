<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Message;
use App\Models\MessageThread;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class MessageThreadController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $threads = MessageThread::query()
            ->where(function ($q) use ($user) {
                $q->where('customer_id', $user->id);

                if ($user->provider) {
                    $q->orWhere('provider_id', $user->provider->id);
                }
            })
            ->with(['customer:id,name', 'provider:id,business_name', 'booking:id,booking_ref'])
            ->withCount(['messages as unread_count' => fn ($q) => $q->whereNull('read_at')->where('recipient_id', '!=', $user->id)])
            ->orderByDesc('last_message_at')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($threads);
    }

    public function store(Request $request, Booking $booking): JsonResponse
    {
        $user = $request->user();

        if ($booking->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $existingThread = MessageThread::query()
            ->where('booking_id', $booking->id)
            ->first();

        if ($existingThread) {
            return response()->json([
                'message' => 'Thread already exists.',
                'data' => $this->mapThread($existingThread),
            ]);
        }

        $thread = MessageThread::create([
            'booking_id' => $booking->id,
            'customer_id' => $user->id,
            'provider_id' => $booking->activity?->provider_id,
            'subject' => "Booking {$booking->booking_ref}",
        ]);

        return response()->json([
            'message' => 'Thread created.',
            'data' => $this->mapThread($thread->fresh(['customer', 'provider', 'booking'])),
        ], 201);
    }

    public function show(Request $request, MessageThread $thread): JsonResponse
    {
        if (! $this->canAccess($request->user(), $thread)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $thread->load(['customer:id,name', 'provider:id,business_name', 'booking:id,booking_ref']);

        $messages = $thread->messages()
            ->with(['sender:id,name' => fn ($q) => $q->where('sender_type', 'user')])
            ->orderBy('created_at')
            ->paginate(50);

        return response()->json([
            'data' => [
                'thread' => $this->mapThread($thread),
                'messages' => $messages,
            ],
        ]);
    }

    public function sendMessage(Request $request, MessageThread $thread): JsonResponse
    {
        $user = $request->user();

        if (! $this->canAccess($user, $thread)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        [$senderType, $senderId] = $this->resolveSender($user, $thread);
        [$recipientType, $recipientId] = $this->resolveRecipient($senderType, $thread);

        $message = Message::create([
            'thread_id' => $thread->id,
            'sender_id' => $senderId,
            'sender_type' => $senderType,
            'recipient_id' => $recipientId,
            'recipient_type' => $recipientType,
            'body' => $validated['body'],
        ]);

        $thread->update(['last_message_at' => now()]);

        return response()->json([
            'data' => $message->fresh(),
        ], 201);
    }

    public function markRead(Request $request, MessageThread $thread, Message $message): JsonResponse
    {
        if (! $this->canAccess($request->user(), $thread)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($message->thread_id !== $thread->id) {
            throw ValidationException::withMessages([
                'message' => 'Message does not belong to this thread.',
            ]);
        }

        if (! $message->read_at) {
            $message->update(['read_at' => now()]);
        }

        return response()->json([
            'data' => $message->fresh(),
        ]);
    }

    private function canAccess($user, MessageThread $thread): bool
    {
        if ($thread->customer_id === $user->id) {
            return true;
        }

        if ($user->provider && $thread->provider_id === $user->provider->id) {
            return true;
        }

        return false;
    }

    /**
     * @return array{0: string, 1: int}
     */
    private function resolveSender($user, MessageThread $thread): array
    {
        if ($user->provider && $thread->provider_id === $user->provider->id) {
            return ['provider', $user->provider->id];
        }

        return ['user', $user->id];
    }

    /**
     * @return array{0: string, 1: int}
     */
    private function resolveRecipient(string $senderType, MessageThread $thread): array
    {
        if ($senderType === 'provider') {
            return ['user', $thread->customer_id];
        }

        return ['provider', $thread->provider_id];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapThread(MessageThread $thread): array
    {
        return [
            'id' => $thread->id,
            'subject' => $thread->subject,
            'customer' => $thread->customer?->only(['id', 'name']),
            'provider' => $thread->provider?->only(['id', 'business_name']),
            'booking' => $thread->booking?->only(['id', 'booking_ref']),
            'last_message_at' => $thread->last_message_at?->toISOString(),
            'created_at' => $thread->created_at?->toISOString(),
        ];
    }
}
