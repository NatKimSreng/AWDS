<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use App\Services\AiChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiChatController extends Controller
{
    public function __construct(
        private readonly AiChatService $aiChatService
    ) {
    }

    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'conversation_id' => ['nullable', 'integer'],
        ]);

        $result = $this->aiChatService->sendMessage(
            $request->user(),
            $validated['conversation_id'] ?? null,
            $validated['message']
        );

        return response()->json([
            'data' => $result,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $conversations = AiConversation::query()
            ->where('user_id', $request->user()->id)
            ->withCount('messages as messages_count')
            ->orderByDesc('updated_at')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($conversations);
    }

    public function show(Request $request, AiConversation $conversation): JsonResponse
    {
        if ($conversation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $messages = $conversation->messages()
            ->orderBy('created_at')
            ->orderBy('id')
            ->paginate(50);

        return response()->json([
            'data' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
                'status' => $conversation->status,
                'created_at' => $conversation->created_at?->toISOString(),
                'updated_at' => $conversation->updated_at?->toISOString(),
                'messages' => $messages,
            ],
        ]);
    }

    public function escalate(Request $request, AiConversation $conversation): JsonResponse
    {
        if ($conversation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $result = $this->aiChatService->escalate($conversation);

        return response()->json([
            'message' => 'Your request has been escalated to our support team.',
            'data' => $result,
        ]);
    }
}
