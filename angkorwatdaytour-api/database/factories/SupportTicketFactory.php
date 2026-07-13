<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SupportTicket>
 */
class SupportTicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->asCustomer(),
            'subject' => fake()->sentence(5),
            'body' => fake()->paragraph(3),
            'status' => fake()->randomElement(['open', 'ai_handled', 'escalated', 'resolved']),
            'ai_handled' => fake()->boolean(40),
            'escalated_at' => fn (array $attributes) => $attributes['status'] === 'escalated' ? now() : null,
            'assigned_to_id' => fake()->optional(0.3)->randomElement(User::whereHas('role', fn ($q) => $q->where('name', 'admin'))->pluck('id')->toArray()),
        ];
    }
}
