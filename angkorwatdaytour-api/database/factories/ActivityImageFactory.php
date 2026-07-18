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
            '1770848125591-2e97455bf21d', // Angkor Wat sunrise
            '1762091486050-5be11ee3c8d7', // Phnom Penh Royal Palace
            '1661487906939-aea1f059b84f', // Kampot river
            '1700155024603-771638efc72f', // Battambang town
            '1762270753499-e6f87335d754', // Bayon faces
            '1770848126209-465ea630f630', // Ta Prohm roots
            '1757756170752-472097c4e565', // Tonlé Sap village
            '1636474333831-6d2aa38cc501', // Cambodia countryside cycling
            '1653959864991-c828b72c82a8', // Cambodian sunset
            '1593009579715-ccb8bed049b5', // Cambodia night market
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
