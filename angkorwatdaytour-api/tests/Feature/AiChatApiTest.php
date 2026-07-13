<?php

namespace Tests\Feature;

use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\SupportTicket;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiChatApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_authenticated_user_can_start_ai_conversation(): void
    {
        Http::fake([
            'https://api.openai.com/v1/chat/completions' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => 'You can cancel more than 24 hours before the tour for a full refund.',
                        ],
                    ],
                ],
            ], 200),
        ]);

        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('ai.chat'), [
                'message' => 'What is the cancellation policy?',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.reply', 'You can cancel more than 24 hours before the tour for a full refund.')
            ->assertJsonPath('data.status', 'ai_handled');

        $this->assertDatabaseHas('ai_conversations', [
            'user_id' => $user->id,
            'status' => 'ai_handled',
        ]);

        $this->assertDatabaseCount('ai_messages', 2);
    }

    public function test_conversation_history_is_returned(): void
    {
        Http::fake([
            'https://api.openai.com/v1/chat/completions' => Http::sequence()
                ->push([
                    'choices' => [['message' => ['content' => 'First reply']]],
                ], 200)
                ->push([
                    'choices' => [['message' => ['content' => 'Second reply']]],
                ], 200),
        ]);

        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;

        $first = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('ai.chat'), ['message' => 'Hello'])
            ->json('data');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('ai.chat'), [
                'message' => 'Follow-up',
                'conversation_id' => $first['conversation_id'],
            ])
            ->assertOk()
            ->assertJsonPath('data.reply', 'Second reply');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(route('ai.conversations.show', $first['conversation_id']))
            ->assertOk()
            ->assertJsonCount(4, 'data.messages.data');
    }

    public function test_user_can_escalate_conversation_to_support_ticket(): void
    {
        Http::fake([
            'https://api.openai.com/v1/chat/completions' => Http::response([
                'choices' => [['message' => ['content' => 'I will escalate this.']]],
            ], 200),
        ]);

        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;

        $chat = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('ai.chat'), ['message' => 'I need a human'])
            ->json('data');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('ai.conversations.escalate', $chat['conversation_id']));

        $response->assertOk()
            ->assertJsonPath('message', 'Your request has been escalated to our support team.');

        $this->assertDatabaseHas('ai_conversations', [
            'id' => $chat['conversation_id'],
            'status' => 'escalated',
        ]);

        $this->assertDatabaseHas('support_tickets', [
            'user_id' => $user->id,
            'status' => 'open',
            'ai_handled' => true,
        ]);
    }

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $this->postJson(route('ai.chat'), ['message' => 'Hello'])
            ->assertUnauthorized();
    }

    public function test_user_cannot_access_another_users_conversation(): void
    {
        $userA = User::factory()->asCustomer()->create();
        $userB = User::factory()->asCustomer()->create();
        $tokenB = $userB->createToken('test')->plainTextToken;

        $conversation = AiConversation::factory()->create(['user_id' => $userA->id]);

        $this->withHeader('Authorization', 'Bearer '.$tokenB)
            ->getJson(route('ai.conversations.show', $conversation->id))
            ->assertForbidden();
    }

    public function test_openai_failure_returns_fallback_reply(): void
    {
        Http::fake([
            'https://api.openai.com/v1/chat/completions' => Http::response(['error' => 'rate limited'], 429),
        ]);

        $user = User::factory()->asCustomer()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('ai.chat'), ['message' => 'Hello'])
            ->assertOk()
            ->assertJsonPath('data.reply', "I'm sorry, I can't answer that right now. I've passed your request to our support team and someone will get back to you soon.");
    }
}
