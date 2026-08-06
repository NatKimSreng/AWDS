<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\ActivityImage;
use App\Models\Booking;
use App\Models\BookingAddon;
use App\Models\City;
use App\Models\Provider;
use App\Models\Review;
use App\Models\ReviewImage;
use App\Models\TimeSlot;
use App\Models\User;
use App\Helpers\SeederImageHelper;
use App\Helpers\ActivityContentHelper;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user for dashboard testing
        User::factory()->asAdmin()->create([
            'name' => 'Admin Demo',
            'email' => 'admin@angkorwatdaytour.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);

        $providers = $this->providerDefinitions();

        foreach ($providers as $providerData) {
            $user = User::factory()->asProvider()->create([
                'name' => $providerData['business_name'],
            ]);

            $provider = Provider::factory()->approved()->create([
                'user_id' => $user->id,
                'slug' => str()->slug($providerData['business_name']),
                'business_name' => $providerData['business_name'],
                'tagline' => $providerData['tagline'] ?? null,
                'bio' => $providerData['bio'],
                'service_area' => $providerData['service_area'],
                'founded_year' => $providerData['founded_year'] ?? null,
                'team_size' => $providerData['team_size'] ?? null,
                'spoken_languages' => $providerData['spoken_languages'] ?? ['en', 'km'],
                'certifications' => $providerData['certifications'] ?? null,
                'specialties' => $providerData['specialties'] ?? null,
                'website_url' => $providerData['website_url'] ?? null,
                'phone' => $providerData['phone'] ?? null,
                'whatsapp' => $providerData['whatsapp'] ?? null,
                'logo_url' => $providerData['logo_url'] ?? null,
                'cover_image_url' => $providerData['cover_image_url'] ?? null,
                'avg_rating' => fake()->randomFloat(1, 4.0, 5.0),
                'total_bookings' => fake()->numberBetween(50, 300),
            ]);

            foreach ($providerData['activities'] as $activityData) {
                $content = ActivityContentHelper::forTheme($activityData);

                $activity = Activity::factory()->live()->create([
                    'provider_id' => $provider->id,
                    'title' => $activityData['title'],
                    'slug' => $activityData['slug'],
                    'category_id' => $this->categoryId($activityData['category_slug']),
                    'city_id' => $this->cityId($activityData['city_slug']),
                    'base_price_usd' => $activityData['base_price'],
                    'duration_minutes' => $activityData['duration'],
                    'max_group' => $activityData['max_group'],
                    'is_instant_book' => true,
                    'spoken_languages' => ['en', 'km'],
                    'description' => $content['description'],
                    'itinerary_json' => $content['itinerary_json'],
                    'inclusions' => $content['inclusions'],
                    'exclusions' => $content['exclusions'],
                    'what_to_bring' => $content['what_to_bring'],
                    'not_allowed' => $content['not_allowed'],
                    'know_before_you_go' => $content['know_before_you_go'],
                    'additional_info' => $content['additional_info'],
                    'not_suitable_for' => $content['not_suitable_for'],
                    'weather_policy' => $content['weather_policy'],
                    'start_time_flexibility' => $content['start_time_flexibility'],
                    'meeting_point_address' => $content['meeting_point_address'],
                    'is_refundable' => $content['is_refundable'],
                    'free_cancellation_hours' => $content['free_cancellation_hours'],
                ]);

                ActivityImage::factory()->hero()->create([
                    'activity_id' => $activity->id,
                    'url' => $this->travelImageUrl(1200, 800),
                ]);
                ActivityImage::factory()->count(3)->create([
                    'activity_id' => $activity->id,
                ]);

                $this->seedTimeSlots($activity);
            }
        }

        Activity::where('status', 'live')->get()->each(function (Activity $activity) {
            $this->seedBookingsAndReviews($activity, fake()->numberBetween(3, 8));
        });

        $this->seedPendingProviders();
    }

    private function seedPendingProviders(): void
    {
        $pendingProviderNames = [
            'Siem Reap Photo Walks',
            'Mekong River Cruises',
            'Khmer Heritage Guides',
        ];

        foreach ($pendingProviderNames as $businessName) {
            $user = User::factory()->asProvider()->create([
                'name' => $businessName,
            ]);

            Provider::factory()->create([
                'user_id' => $user->id,
                'slug' => str()->slug($businessName),
                'business_name' => $businessName,
                'bio' => fake()->paragraphs(2, true),
                'service_area' => fake()->randomElement(['Siem Reap Central', 'Angkor Park', 'Tonlé Sap']),
                'verification_status' => 'pending',
                'onboarding_status' => 'pending',
                'avg_rating' => 0,
                'total_bookings' => 0,
                'commission_rate' => 5.00,
            ]);
        }
    }

    private function categoryId(string $slug): int
    {
        return ActivityCategory::where('slug', $slug)->firstOrFail()->id;
    }

    private function cityId(string $slug): int
    {
        return City::where('slug', $slug)->firstOrFail()->id;
    }

    private function seedTimeSlots(Activity $activity): void
    {
        $slotsPerDay = fake()->randomElement([1, 2, 3]);
        $startHours = $slotsPerDay === 1 ? [8] : ($slotsPerDay === 2 ? [5, 14] : [5, 9, 14]);

        for ($day = 0; $day < 14; $day++) {
            $date = now()->addDays($day)->toDateString();

            foreach ($startHours as $hour) {
                $start = now()->addDays($day)->setTime($hour, 0, 0);
                $end = (clone $start)->addMinutes($activity->duration_minutes);

                TimeSlot::firstOrCreate(
                    [
                        'activity_id' => $activity->id,
                        'date' => $date,
                        'start_time' => $start->format('H:i:s'),
                    ],
                    [
                        'end_time' => $end->format('H:i:s'),
                        'capacity' => $activity->max_group,
                        'booked_count' => 0,
                        'is_blackout' => false,
                    ]
                );
            }
        }
    }

    private function seedBookingsAndReviews(Activity $activity, int $count): void
    {
        $slots = TimeSlot::where('activity_id', $activity->id)
            ->where('date', '<=', now()->addDays(14)->toDateString())
            ->get();

        if ($slots->isEmpty()) {
            return;
        }

        for ($i = 0; $i < $count; $i++) {
            $slot = $slots->random();
            $travelers = fake()->numberBetween(1, min($activity->max_group, 4));

            $booking = Booking::factory()->completed()->create([
                'activity_id' => $activity->id,
                'time_slot_id' => $slot->id,
                'booking_date' => $slot->date,
                'booking_time' => $slot->start_time,
                'traveler_count' => $travelers,
                'total_price' => round($activity->base_price_usd * $travelers, 2),
                'commission_amount' => round($activity->base_price_usd * $travelers * 0.05, 2),
            ]);

            if (fake()->boolean(40)) {
                BookingAddon::factory()->count(fake()->numberBetween(1, 2))->create([
                    'booking_id' => $booking->id,
                ]);
            }

            if (fake()->boolean(70)) {
                $review = Review::factory()->create([
                    'booking_id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'activity_id' => $activity->id,
                    'rating' => fake()->numberBetween(4, 5),
                ]);

                if (fake()->boolean(30)) {
                    ReviewImage::factory()->count(fake()->numberBetween(1, 3))->create([
                        'review_id' => $review->id,
                    ]);
                }
            }

            $slot->increment('booked_count', $travelers);
        }
    }

    private function travelImageUrl(int $width, int $height): string
    {
        return SeederImageHelper::travelImageUrl($width, $height);
    }

    private function providerDefinitions(): array
    {
        return [
            [
                'business_name' => 'Siem Reap Sunrise Tours',
                'bio' => 'Local guides specializing in sunrise Angkor Wat experiences and temple photography.',
                'service_area' => 'Angkor Archaeological Park',
                'tagline' => 'Sunrise specialists for temple lovers',
                'founded_year' => 2012,
                'team_size' => 8,
                'spoken_languages' => ['en', 'km'],
                'certifications' => ['Ministry of Tourism Licensed', 'Professional Guide License'],
                'specialties' => ['Sunrise tours', 'Temple photography', 'Hidden temples'],
                'website_url' => 'https://siemreapsunrise.example.com',
                'phone' => '+855 12 111 222',
                'whatsapp' => '+855 12 111 222',
                'logo_url' => SeederImageHelper::travelImageUrl(400, 400),
                'cover_image_url' => SeederImageHelper::travelImageUrl(1200, 400),
                'activities' => [
                    [
                        'title' => 'Magical Sunrise at Angkor Wat',
                        'slug' => 'magical-sunrise-angkor-wat',
                        'base_price' => 35,
                        'duration' => 300,
                        'category_slug' => 'sunrise-sunset',
                        'city_slug' => 'angkor-park',
                        'max_group' => 8,
                    ],
                    [
                        'title' => 'Hidden Temples by Tuk-tuk',
                        'slug' => 'hidden-temples-tuktuk',
                        'base_price' => 45,
                        'duration' => 480,
                        'category_slug' => 'temples-history',
                        'city_slug' => 'angkor-park',
                        'max_group' => 4,
                    ],
                    [
                        'title' => 'Bayon & Ta Prohm Full-Day Explorer',
                        'slug' => 'bayon-ta-prohm-full-day',
                        'base_price' => 55,
                        'duration' => 480,
                        'category_slug' => 'temples-history',
                        'city_slug' => 'angkor-park',
                        'max_group' => 6,
                    ],
                    [
                        'title' => 'Banteay Srei & Kbal Spean Day Trip',
                        'slug' => 'banteay-srei-kbal-spean-day-trip',
                        'base_price' => 68,
                        'duration' => 540,
                        'category_slug' => 'temples-history',
                        'city_slug' => 'rural-siem-reap',
                        'max_group' => 6,
                    ],
                ],
            ],
            [
                'business_name' => 'Khmer Flavors',
                'bio' => 'Food tours and Khmer cooking classes led by local chefs and market experts.',
                'service_area' => 'Siem Reap Central',
                'tagline' => 'Taste Cambodia one bite at a time',
                'founded_year' => 2015,
                'team_size' => 6,
                'spoken_languages' => ['en', 'km'],
                'certifications' => ['Food Safety Certified', 'Ministry of Tourism Licensed'],
                'specialties' => ['Food tours', 'Cooking classes', 'Market visits'],
                'website_url' => 'https://khmerflavors.example.com',
                'phone' => '+855 12 222 333',
                'whatsapp' => '+855 12 222 333',
                'logo_url' => SeederImageHelper::travelImageUrl(400, 400),
                'cover_image_url' => SeederImageHelper::travelImageUrl(1200, 400),
                'activities' => [
                    [
                        'title' => 'Evening Street Food Walk',
                        'slug' => 'evening-street-food-walk',
                        'base_price' => 25,
                        'duration' => 180,
                        'category_slug' => 'food-culture',
                        'city_slug' => 'siem-reap-central',
                        'max_group' => 6,
                    ],
                    [
                        'title' => 'Cooking Class with Market Visit',
                        'slug' => 'cooking-class-market-visit',
                        'base_price' => 55,
                        'duration' => 240,
                        'category_slug' => 'food-culture',
                        'city_slug' => 'siem-reap-central',
                        'max_group' => 8,
                    ],
                    [
                        'title' => 'Morning Market & Breakfast Tour',
                        'slug' => 'morning-market-breakfast-tour',
                        'base_price' => 30,
                        'duration' => 180,
                        'category_slug' => 'food-culture',
                        'city_slug' => 'siem-reap-central',
                        'max_group' => 6,
                    ],
                    [
                        'title' => 'Rice Wine & Local Snacks Tasting',
                        'slug' => 'rice-wine-local-snacks-tasting',
                        'base_price' => 22,
                        'duration' => 120,
                        'category_slug' => 'food-culture',
                        'city_slug' => 'siem-reap-central',
                        'max_group' => 8,
                    ],
                ],
            ],
            [
                'business_name' => 'Angkor Adventure Crew',
                'bio' => 'Cycling, off-road, and countryside adventures for active travelers.',
                'service_area' => 'Rural Siem Reap',
                'tagline' => 'Active adventures beyond the temples',
                'founded_year' => 2017,
                'team_size' => 12,
                'spoken_languages' => ['en', 'km'],
                'certifications' => ['First Aid Certified', 'Bike Tour Operator License'],
                'specialties' => ['Cycling adventures', 'Quad biking', 'Jungle treks'],
                'website_url' => 'https://angkoradventure.example.com',
                'phone' => '+855 12 333 444',
                'whatsapp' => '+855 12 333 444',
                'logo_url' => SeederImageHelper::travelImageUrl(400, 400),
                'cover_image_url' => SeederImageHelper::travelImageUrl(1200, 400),
                'activities' => [
                    [
                        'title' => 'Countryside Cycling Tour',
                        'slug' => 'countryside-cycling-tour',
                        'base_price' => 30,
                        'duration' => 240,
                        'category_slug' => 'adventure',
                        'city_slug' => 'rural-siem-reap',
                        'max_group' => 10,
                    ],
                    [
                        'title' => 'Sunset Quad Bike Ride',
                        'slug' => 'sunset-quad-bike-ride',
                        'base_price' => 65,
                        'duration' => 180,
                        'category_slug' => 'adventure',
                        'city_slug' => 'rural-siem-reap',
                        'max_group' => 6,
                    ],
                    [
                        'title' => 'Jungle Trek to Phnom Bok',
                        'slug' => 'jungle-trek-phnom-bok',
                        'base_price' => 50,
                        'duration' => 360,
                        'category_slug' => 'adventure',
                        'city_slug' => 'rural-siem-reap',
                        'max_group' => 8,
                    ],
                    [
                        'title' => 'Ox-Cart Village Safari',
                        'slug' => 'ox-cart-village-safari',
                        'base_price' => 28,
                        'duration' => 180,
                        'category_slug' => 'adventure',
                        'city_slug' => 'rural-siem-reap',
                        'max_group' => 6,
                    ],
                ],
            ],
            [
                'business_name' => 'Tonlé Sap Discovery',
                'bio' => 'Boat tours of Kampong Phluk and Mechrey floating villages on Tonlé Sap Lake.',
                'service_area' => 'Tonlé Sap',
                'tagline' => 'Authentic floating village experiences',
                'founded_year' => 2014,
                'team_size' => 5,
                'spoken_languages' => ['en', 'km'],
                'certifications' => ['Boat Operator License', 'Ministry of Tourism Licensed'],
                'specialties' => ['Floating villages', 'Sunset cruises', 'Bird watching'],
                'website_url' => 'https://tonlesapdiscovery.example.com',
                'phone' => '+855 12 444 555',
                'whatsapp' => '+855 12 444 555',
                'logo_url' => SeederImageHelper::travelImageUrl(400, 400),
                'cover_image_url' => SeederImageHelper::travelImageUrl(1200, 400),
                'activities' => [
                    [
                        'title' => 'Floating Village Half-Day Boat Tour',
                        'slug' => 'floating-village-boat-tour',
                        'base_price' => 40,
                        'duration' => 240,
                        'category_slug' => 'food-culture',
                        'city_slug' => 'tonle-sap',
                        'max_group' => 12,
                    ],
                    [
                        'title' => 'Tonlé Sap Sunset & Bird Watching',
                        'slug' => 'tonle-sap-sunset-bird-watching',
                        'base_price' => 50,
                        'duration' => 300,
                        'category_slug' => 'sunrise-sunset',
                        'city_slug' => 'tonle-sap',
                        'max_group' => 8,
                    ],
                    [
                        'title' => 'Fishing Village Homestay Experience',
                        'slug' => 'fishing-village-homestay',
                        'base_price' => 85,
                        'duration' => 720,
                        'category_slug' => 'food-culture',
                        'city_slug' => 'tonle-sap',
                        'max_group' => 6,
                    ],
                ],
            ],
            [
                'business_name' => 'Angkor Lens Expeditions',
                'bio' => 'Photography-focused tours with professional tips, golden-hour timing, and hidden angles.',
                'service_area' => 'Angkor Archaeological Park',
                'tagline' => 'Capture Cambodia like a pro',
                'founded_year' => 2016,
                'team_size' => 4,
                'spoken_languages' => ['en', 'km', 'fr'],
                'certifications' => ['Professional Guide License', 'Photography Workshop Certified'],
                'specialties' => ['Temple photography', 'Golden-hour tours', 'Portrait sessions'],
                'website_url' => 'https://angkorlens.example.com',
                'phone' => '+855 12 555 666',
                'whatsapp' => '+855 12 555 666',
                'logo_url' => SeederImageHelper::travelImageUrl(400, 400),
                'cover_image_url' => SeederImageHelper::travelImageUrl(1200, 400),
                'activities' => [
                    [
                        'title' => 'Golden Hour Temple Photography',
                        'slug' => 'golden-hour-temple-photography',
                        'base_price' => 75,
                        'duration' => 240,
                        'category_slug' => 'photography',
                        'city_slug' => 'angkor-park',
                        'max_group' => 4,
                    ],
                    [
                        'title' => 'Portrait Session in Ancient Ruins',
                        'slug' => 'portrait-session-ancient-ruins',
                        'base_price' => 90,
                        'duration' => 180,
                        'category_slug' => 'photography',
                        'city_slug' => 'angkor-park',
                        'max_group' => 3,
                    ],
                    [
                        'title' => 'Sunset Temple Silhouette Workshop',
                        'slug' => 'sunset-temple-silhouette-workshop',
                        'base_price' => 80,
                        'duration' => 180,
                        'category_slug' => 'photography',
                        'city_slug' => 'angkor-park',
                        'max_group' => 4,
                    ],
                ],
            ],
            [
                'business_name' => 'Khmer Horizon Journeys',
                'bio' => 'Curated multi-day itineraries combining temples, countryside, and local culture.',
                'service_area' => 'Siem Reap Province',
                'tagline' => 'Multi-day journeys through Cambodia',
                'founded_year' => 2011,
                'team_size' => 15,
                'spoken_languages' => ['en', 'km', 'zh'],
                'certifications' => ['Inbound Tour Operator License', 'Ministry of Tourism Licensed'],
                'specialties' => ['Multi-day tours', 'Temple itineraries', 'Countryside culture'],
                'website_url' => 'https://khmerhorizon.example.com',
                'phone' => '+855 12 666 777',
                'whatsapp' => '+855 12 666 777',
                'logo_url' => SeederImageHelper::travelImageUrl(400, 400),
                'cover_image_url' => SeederImageHelper::travelImageUrl(1200, 400),
                'activities' => [
                    [
                        'title' => '3-Day Angkor Deep Dive',
                        'slug' => '3-day-angkor-deep-dive',
                        'base_price' => 180,
                        'duration' => 1440,
                        'category_slug' => 'multi-day',
                        'city_slug' => 'angkor-park',
                        'max_group' => 6,
                    ],
                    [
                        'title' => '2-Day Temples & Villages Combo',
                        'slug' => '2-day-temples-villages-combo',
                        'base_price' => 140,
                        'duration' => 960,
                        'category_slug' => 'multi-day',
                        'city_slug' => 'rural-siem-reap',
                        'max_group' => 6,
                    ],
                ],
            ],
            [
                'business_name' => 'Sacred Siem Reap Walks',
                'bio' => 'Spiritual and cultural walking tours led by guides with deep knowledge of Buddhism and Khmer heritage.',
                'service_area' => 'Siem Reap Central',
                'tagline' => 'Walks that touch the soul of Cambodia',
                'founded_year' => 2018,
                'team_size' => 3,
                'spoken_languages' => ['en', 'km'],
                'certifications' => ['Professional Guide License', 'Heritage Interpretation Certified'],
                'specialties' => ['Spiritual tours', 'Cultural walks', 'Meditation experiences'],
                'website_url' => 'https://sacredwalks.example.com',
                'phone' => '+855 12 777 888',
                'whatsapp' => '+855 12 777 888',
                'logo_url' => SeederImageHelper::travelImageUrl(400, 400),
                'cover_image_url' => SeederImageHelper::travelImageUrl(1200, 400),
                'activities' => [
                    [
                        'title' => 'Monk Blessing & Temple Meditation',
                        'slug' => 'monk-blessing-temple-meditation',
                        'base_price' => 45,
                        'duration' => 240,
                        'category_slug' => 'temples-history',
                        'city_slug' => 'angkor-park',
                        'max_group' => 6,
                    ],
                    [
                        'title' => 'Old Market Heritage Walk',
                        'slug' => 'old-market-heritage-walk',
                        'base_price' => 20,
                        'duration' => 150,
                        'category_slug' => 'food-culture',
                        'city_slug' => 'siem-reap-central',
                        'max_group' => 8,
                    ],
                ],
            ],
            [
                'business_name' => 'Angkor Wellness Escapes',
                'bio' => 'Relaxing retreats that combine temple visits with yoga, meditation, and traditional Khmer massage.',
                'service_area' => 'Siem Reap Central',
                'tagline' => 'Rebalance body and mind in Angkor',
                'founded_year' => 2019,
                'team_size' => 6,
                'spoken_languages' => ['en', 'km', 'fr'],
                'certifications' => ['Wellness Retreat Certified', 'Traditional Massage License'],
                'specialties' => ['Yoga retreats', 'Khmer massage', 'Meditation', 'Temple brunches'],
                'website_url' => 'https://angkorwellness.example.com',
                'phone' => '+855 12 888 999',
                'whatsapp' => '+855 12 888 999',
                'logo_url' => SeederImageHelper::travelImageUrl(400, 400),
                'cover_image_url' => SeederImageHelper::travelImageUrl(1200, 400),
                'activities' => [
                    [
                        'title' => 'Sunrise Yoga & Temple Brunch',
                        'slug' => 'sunrise-yoga-temple-brunch',
                        'base_price' => 55,
                        'duration' => 300,
                        'category_slug' => 'sunrise-sunset',
                        'city_slug' => 'angkor-park',
                        'max_group' => 12,
                    ],
                    [
                        'title' => 'Khmer Massage & Heritage Afternoon',
                        'slug' => 'khmer-massage-heritage-afternoon',
                        'base_price' => 60,
                        'duration' => 240,
                        'category_slug' => 'food-culture',
                        'city_slug' => 'siem-reap-central',
                        'max_group' => 6,
                    ],
                ],
            ],
        ];
    }
}
