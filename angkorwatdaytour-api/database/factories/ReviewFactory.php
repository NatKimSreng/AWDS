<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $booking = Booking::inRandomOrder()->first() ?? Booking::factory()->completed()->create();

        return [
            'booking_id' => $booking->id,
            'user_id' => $booking->user_id ?? User::factory()->asCustomer(),
            'activity_id' => $booking->activity_id,
            'rating' => fake()->numberBetween(3, 5),
            'comment' => fake()->paragraph(2),
            'is_verified' => true,
            'is_flagged' => false,
            'provider_response' => fake()->optional(0.3)->paragraph(),
            'provider_responded_at' => fn (array $attributes) => $attributes['provider_response'] ? now() : null,
        ];
    }
}
