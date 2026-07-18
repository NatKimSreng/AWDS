<?php

namespace Database\Factories;

use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReviewImage>
 */
class ReviewImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'review_id' => Review::factory(),
            'url' => $this->travelImageUrl(800, 600),
            'sort_order' => fake()->numberBetween(0, 5),
        ];
    }

    private function travelImageUrl(int $width, int $height): string
    {
        $ids = [
            '1770848125591-2e97455bf21d',
            '1762091486050-5be11ee3c8d7',
            '1661487906939-aea1f059b84f',
            '1700155024603-771638efc72f',
            '1762270753499-e6f87335d754',
            '1770848126209-465ea630f630',
            '1757756170752-472097c4e565',
        ];

        $id = $ids[array_rand($ids)];

        return "https://images.unsplash.com/photo-{$id}?auto=format&fit=crop&w={$width}&h={$height}&q=80";
    }
}
