<?php

namespace Database\Factories;

use App\Models\Activity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ActivityImage>
 */
class ActivityImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'activity_id' => Activity::factory(),
            'url' => fake()->imageUrl(1200, 800, 'travel'),
            'alt_text' => fake()->sentence(4),
            'sort_order' => fake()->numberBetween(0, 10),
            'is_hero' => false,
        ];
    }

    public function hero(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_hero' => true,
            'sort_order' => 0,
        ]);
    }
}
