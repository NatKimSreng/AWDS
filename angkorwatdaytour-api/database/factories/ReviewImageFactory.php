<?php

namespace Database\Factories;

use App\Models\Review;
use App\Helpers\SeederImageHelper;
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
        return SeederImageHelper::travelImageUrl($width, $height);
    }
}
