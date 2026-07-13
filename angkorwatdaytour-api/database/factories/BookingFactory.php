<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Booking;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $activity = Activity::inRandomOrder()->first() ?? Activity::factory()->create();
        $timeSlot = TimeSlot::where('activity_id', $activity->id)->inRandomOrder()->first() ?? TimeSlot::factory()->create(['activity_id' => $activity->id]);
        $travelers = fake()->numberBetween(1, min($activity->max_group, 6));
        $total = $activity->base_price_usd * $travelers;

        return [
            'booking_ref' => strtoupper(Str::random(8)),
            'user_id' => User::factory()->asCustomer(),
            'guest_email' => null,
            'guest_name' => null,
            'guest_phone' => null,
            'activity_id' => $activity->id,
            'time_slot_id' => $timeSlot->id,
            'booking_date' => $timeSlot->date,
            'booking_time' => $timeSlot->start_time,
            'traveler_count' => $travelers,
            'status' => fake()->randomElement(['pending', 'confirmed', 'confirmed', 'completed']),
            'total_price' => $total,
            'commission_amount' => round($total * ($activity->provider->commission_rate / 100), 2),
            'discount_amount' => 0,
            'currency' => 'USD',
            'payment_method' => fake()->randomElement(['khqr', 'stripe', null]),
            'coupon_code' => null,
            'special_requests' => fake()->optional()->sentence(),
            'expires_at' => null,
            'confirmed_at' => fn (array $attributes) => in_array($attributes['status'], ['confirmed', 'completed'], true) ? now() : null,
            'cancelled_at' => null,
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'confirmed_at' => now()->subDays(7),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'confirmed_at' => null,
            'cancelled_at' => now(),
        ]);
    }

    public function guest(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => null,
            'guest_email' => fake()->safeEmail(),
            'guest_name' => fake()->name(),
            'guest_phone' => fake()->phoneNumber(),
        ]);
    }
}
