<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['booking_confirmed', 'review_request', 'payout', 'message']),
            'title' => fake()->sentence(4),
            'body' => fake()->sentence(10),
            'payload' => ['booking_ref' => strtoupper(fake()->bothify('??####'))],
            'channel' => fake()->randomElement(['in_app', 'push', 'email']),
            'read_at' => fake()->optional(0.5)->dateTimeBetween('-1 week', 'now'),
            'sent_at' => now(),
        ];
    }
}
