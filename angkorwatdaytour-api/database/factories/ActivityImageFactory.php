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
            'url' => $this->travelImageUrl(1200, 800),
            'alt_text' => fake()->sentence(4),
            'sort_order' => fake()->numberBetween(0, 10),
            'is_hero' => false,
        ];
    }

    private function travelImageUrl(int $width, int $height): string
    {
        $ids = [
            '1518509569233-3c8b915e781f',
            '1528127269322-539801943592',
            '1555993539-1732b0258235',
            '1569949381662-eb82be2a6f11',
            '1534234828563-025cf17ebb8d',
            '1528360983277-13d401cdc186',
            '1545569341-9eb8b30979d9',
            '1469854523086-cc02fe5d8800',
            '1500530855697-b7d8d2cf6f3e',
            '1476514525535-07fb3b4ae5f1',
        ];

        $id = $ids[array_rand($ids)];

        return "https://images.unsplash.com/photo-{$id}?auto=format&fit=crop&w={$width}&h={$height}&q=80";
    }

    public function hero(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_hero' => true,
            'sort_order' => 0,
        ]);
    }
}
