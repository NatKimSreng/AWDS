<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Payment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $booking = Booking::inRandomOrder()->first() ?? Booking::factory()->create();

        return [
            'booking_id' => $booking->id,
            'provider_ref' => fake()->optional()?->uuid(),
            'amount' => $booking->total_price,
            'currency' => $booking->currency,
            'status' => fake()->randomElement(['pending', 'paid', 'failed', 'refunded']),
            'method' => fake()->randomElement(['khqr', 'stripe']),
            'gateway_response' => null,
            'paid_at' => fn (array $attributes) => $attributes['status'] === 'paid' ? now() : null,
        ];
    }
}
