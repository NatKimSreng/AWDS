<?php

namespace Database\Factories;

use App\Models\Message;
use App\Models\MessageThread;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Message::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $thread = MessageThread::inRandomOrder()->first() ?? MessageThread::factory()->create();
        $senderIsCustomer = fake()->boolean();
        $senderType = $senderIsCustomer ? 'user' : 'provider';
        $senderId = $senderIsCustomer ? $thread->customer_id : $thread->provider_id;
        $recipientType = $senderIsCustomer ? 'provider' : 'user';
        $recipientId = $senderIsCustomer ? $thread->provider_id : $thread->customer_id;

        return [
            'thread_id' => $thread->id,
            'sender_id' => $senderId,
            'sender_type' => $senderType,
            'recipient_id' => $recipientId,
            'recipient_type' => $recipientType,
            'body' => fake()->paragraph(),
            'read_at' => fake()->optional()?->dateTimeThisMonth(),
            'attachments' => null,
        ];
    }
}
