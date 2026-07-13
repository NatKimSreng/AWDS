<?php

namespace Database\Factories;

use App\Models\Activity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TimeSlot>
 */
class TimeSlotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startHour = fake()->randomElement([5, 8, 9, 14, 16]);
        $duration = fake()->randomElement([120, 180, 240]);
        $start = now()->addDays(fake()->numberBetween(1, 30))->setTime($startHour, 0, 0);
        $end = (clone $start)->addMinutes($duration);

        return [
            'activity_id' => Activity::factory(),
            'date' => $start->toDateString(),
            'start_time' => $start->format('H:i:s'),
            'end_time' => $end->format('H:i:s'),
            'capacity' => fake()->randomElement([2, 4, 6, 8, 12]),
            'booked_count' => 0,
            'price_override' => fake()->optional()->randomFloat(2, 10, 50),
            'is_blackout' => false,
        ];
    }

    public function blackout(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_blackout' => true,
            'capacity' => 0,
        ]);
    }

    public function forDate(string $date, int $hour = 8): static
    {
        return $this->state(fn (array $attributes) => [
            'date' => $date,
            'start_time' => sprintf('%02d:00:00', $hour),
            'end_time' => sprintf('%02d:00:00', $hour + 4),
        ]);
    }
}
