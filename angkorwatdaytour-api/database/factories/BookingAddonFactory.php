<?php

namespace Database\Factories;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BookingAddon>
 */
class BookingAddonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'name' => fake()->randomElement(['Private guide upgrade', 'Lunch included', 'Hotel pickup', 'Sunset drinks', 'Temple pass']),
            'price' => fake()->randomFloat(2, 5, 50),
            'quantity' => fake()->numberBetween(1, 4),
        ];
    }
}
