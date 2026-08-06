<?php

namespace Database\Factories;

use App\Models\Provider;
use App\Models\Role;
use App\Models\User;
use App\Helpers\SeederImageHelper;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Provider>
 */
class ProviderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $businessName = fake()->company();

        return [
            'user_id' => User::factory()->asProvider(),
            'slug' => str()->slug($businessName . ' ' . fake()->unique()->numerify('###')),
            'business_name' => $businessName,
            'tagline' => fake()->catchPhrase(),
            'bio' => fake()->paragraphs(2, true),
            'service_area' => fake()->randomElement(['Siem Reap Central', 'Angkor Park', 'Tonlé Sap', 'Rural Siem Reap']),
            'founded_year' => fake()->optional(0.8)->numberBetween(2005, 2023),
            'team_size' => fake()->optional()->numberBetween(1, 25),
            'spoken_languages' => fake()->randomElements(['en', 'km', 'fr', 'zh', 'ja', 'es'], fake()->numberBetween(1, 3)),
            'certifications' => fake()->optional(0.6)->randomElements(
                ['Ministry of Tourism Licensed', 'Tuk-tuk Operator License', 'First Aid Certified', 'Professional Guide License'],
                fake()->numberBetween(1, 3)
            ),
            'specialties' => fake()->optional(0.7)->randomElements(
                ['Temple photography', 'Sunrise tours', 'Food experiences', 'Cycling adventures', 'Floating villages', 'Multi-day itineraries'],
                fake()->numberBetween(2, 4)
            ),
            'website_url' => fake()->optional(0.5)->url(),
            'phone' => fake()->optional(0.7)->phoneNumber(),
            'whatsapp' => fake()->optional(0.5)->phoneNumber(),
            'logo_url' => fake()->optional(0.6)->imageUrl(400, 400, 'business'),
            'cover_image_url' => fake()->optional(0.5)->imageUrl(1200, 400, 'travel'),
            'verification_status' => fake()->randomElement(['pending', 'approved', 'approved', 'approved']),
            'id_document_url' => fake()->boolean(80) ? SeederImageHelper::documentImageUrl(800, 600) : null,
            'license_document_url' => fake()->boolean(80) ? SeederImageHelper::documentImageUrl(800, 600) : null,
            'avg_rating' => fake()->randomFloat(1, 3, 5),
            'total_bookings' => fake()->numberBetween(0, 500),
            'commission_rate' => 5.00,
            'is_featured' => fake()->boolean(20),
            'approved_at' => fn (array $attributes) => $attributes['verification_status'] === 'approved' ? now() : null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'approved',
            'onboarding_status' => 'approved',
            'approved_at' => now(),
        ]);
    }

    public function onboardingApproved(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'approved',
            'onboarding_status' => 'approved',
            'approved_at' => now(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'pending',
            'approved_at' => null,
        ]);
    }
}
