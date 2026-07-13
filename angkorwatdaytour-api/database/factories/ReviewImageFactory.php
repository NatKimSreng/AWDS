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
            '1518509569233-3c8b915e781f',
            '1528127269322-539801943592',
            '1555993539-1732b0258235',
            '1569949381662-eb82be2a6f11',
            '1534234828563-025cf17ebb8d',
            '1528360983277-13d401cdc186',
            '1545569341-9eb8b30979d9',
        ];

        $id = $ids[array_rand($ids)];

        return "https://images.unsplash.com/photo-{$id}?auto=format&fit=crop&w={$width}&h={$height}&q=80";
    }
}
