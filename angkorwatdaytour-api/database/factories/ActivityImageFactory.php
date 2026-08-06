<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Helpers\SeederImageHelper;
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
            'url' => $this->travelImageUrl(1200, 800),
            'alt_text' => fake()->sentence(4),
            'sort_order' => fake()->numberBetween(0, 10),
            'is_hero' => false,
        ];
    }

    private function travelImageUrl(int $width, int $height): string
    {
        return SeederImageHelper::travelImageUrl($width, $height);
    }

    public function hero(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_hero' => true,
            'sort_order' => 0,
        ]);
    }
}
