<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BlogPost>
 */
class BlogPostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(6);

        return [
            'author_id' => User::factory()->asAdmin(),
            'title' => $title,
            'slug' => Str::slug($title) . '-' . fake()->unique()->numberBetween(1000, 9999),
            'excerpt' => fake()->paragraph(2),
            'body_html' => '<p>' . implode('</p><p>', fake()->paragraphs(5)) . '</p>',
            'body_markdown' => fake()->paragraphs(5, true),
            'cover_image_url' => fake()->imageUrl(1200, 600, 'travel'),
            'seo_meta_title' => $title,
            'seo_meta_description' => fake()->sentence(12),
            'status' => fake()->randomElement(['published', 'published', 'draft']),
            'published_at' => fake()->dateTimeBetween('-3 months', 'now'),
        ];
    }
}
