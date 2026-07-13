<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\MessageThread;
use App\Models\Provider;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MessageThread>
 */
class MessageThreadFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = MessageThread::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $booking = Booking::inRandomOrder()->first() ?? Booking::factory()->completed()->create();
        $providerUser = User::factory()->asProvider()->create();
        $provider = Provider::factory()->approved()->create(['user_id' => $providerUser->id]);

        return [
            'booking_id' => $booking->id,
            'customer_id' => $booking->user_id ?? User::factory()->asCustomer(),
            'provider_id' => $provider->id,
            'subject' => fake()->sentence(6),
            'last_message_at' => fake()->optional()?->dateTimeThisMonth(),
        ];
    }
}
