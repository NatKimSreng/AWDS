<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Refund>
 */
class RefundFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Refund::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $payment = Payment::inRandomOrder()->first() ?? Payment::factory()->create();

        return [
            'payment_id' => $payment->id,
            'booking_id' => $payment->booking_id,
            'amount' => $payment->amount,
            'reason' => fake()->optional()->sentence(),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'processed']),
            'processed_by_type' => 'system',
            'processed_by_id' => null,
            'processed_at' => fn (array $attributes) => in_array($attributes['status'], ['approved', 'processed'], true) ? now() : null,
        ];
    }

    public function processed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'processed',
            'processed_at' => now(),
        ]);
    }
}
