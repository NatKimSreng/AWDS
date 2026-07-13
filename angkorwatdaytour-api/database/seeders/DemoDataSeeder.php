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
        ]);

        $providers = $this->providerDefinitions();

        foreach ($providers as $providerData) {
            $user = User::factory()->asProvider()->create([
                'name' => $providerData['business_name'],
            ]);

            $provider = Provider::factory()->approved()->create([
                'user_id' => $user->id,
                'business_name' => $providerData['business_name'],
                'bio' => $providerData['bio'],
                'service_area' => $providerData['service_area'],
                'avg_rating' => fake()->randomFloat(1, 4.0, 5.0),
                'total_bookings' => fake()->numberBetween(50, 300),
            ]);

            foreach ($providerData['activities'] as $activityData) {
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
                ]);

                ActivityImage::factory()->hero()->create([
                    'activity_id' => $activity->id,
                    'url' => fake()->imageUrl(1200, 800, 'travel'),
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

    private function providerDefinitions(): array
    {
        return [
            [
                'business_name' => 'Siem Reap Sunrise Tours',
                'bio' => 'Local guides specializing in sunrise Angkor Wat experiences and temple photography.',
                'service_area' => 'Angkor Archaeological Park',
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
                ],
            ],
            [
                'business_name' => 'Khmer Flavors',
                'bio' => 'Food tours and Khmer cooking classes led by local chefs and market experts.',
                'service_area' => 'Siem Reap Central',
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
                ],
            ],
            [
                'business_name' => 'Angkor Adventure Crew',
                'bio' => 'Cycling, off-road, and countryside adventures for active travelers.',
                'service_area' => 'Rural Siem Reap',
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
                ],
            ],
            [
                'business_name' => 'Tonlé Sap Discovery',
                'bio' => 'Boat tours of Kampong Phluk and Mechrey floating villages on Tonlé Sap Lake.',
                'service_area' => 'Tonlé Sap',
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
                ],
            ],
        ];
    }
}
