<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Ticket;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ticket>
 */
class TicketFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Ticket::class;

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
            'ticket_ref' => strtoupper(Str::random(8)),
            'qr_payload' => [
                'booking_ref' => $booking->booking_ref,
                'ticket_ref' => strtoupper(Str::random(8)),
            ],
            'status' => fake()->randomElement(['active', 'active', 'used', 'cancelled']),
            'used_at' => fn (array $attributes) => $attributes['status'] === 'used' ? now() : null,
        ];
    }
}
