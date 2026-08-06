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
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class Vendor1DemoSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'vendor1@angkor.local'],
            [
                'name' => 'Siem Reap Sunrise Tours',
                'password' => Hash::make('password'),
                'role_id' => \App\Models\Role::where('name', 'provider')->firstOrFail()->id,
                'email_verified_at' => now(),
                'language_pref' => 'en',
            ]
        );

        $provider = Provider::firstOrNew(['user_id' => $user->id]);
        $provider->fill([
            'slug' => Str::slug('Siem Reap Sunrise Tours') . '-vendor1',
            'business_name' => 'Siem Reap Sunrise Tours',
            'bio' => 'Local guides specializing in sunrise Angkor Wat experiences and temple photography.',
            'service_area' => 'Angkor Archaeological Park',
            'verification_status' => 'approved',
            'onboarding_status' => 'approved',
            'id_document_url' => null,
            'license_document_url' => null,
            'avg_rating' => 4.8,
            'total_bookings' => 0,
            'commission_rate' => 5.00,
            'is_featured' => true,
            'approved_at' => now(),
        ]);
        $provider->save();

        $activities = [
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
                'title' => 'Countryside Cycling Tour',
                'slug' => 'countryside-cycling-tour-vendor1',
                'base_price' => 30,
                'duration' => 240,
                'category_slug' => 'adventure',
                'city_slug' => 'rural-siem-reap',
                'max_group' => 10,
            ],
        ];

        foreach ($activities as $data) {
            $activity = Activity::firstOrCreate(
                ['slug' => $data['slug']],
                [
                    'provider_id' => $provider->id,
                    'category_id' => $this->categoryId($data['category_slug']),
                    'city_id' => $this->cityId($data['city_slug']),
                    'title' => $data['title'],
                    'description' => fake()->paragraphs(4, true),
                    'itinerary_json' => [
                        ['time' => '05:00', 'description' => 'Hotel pickup in Siem Reap'],
                        ['time' => '05:30', 'description' => 'Sunrise at Angkor Wat'],
                        ['time' => '08:00', 'description' => 'Breakfast break'],
                        ['time' => '09:30', 'description' => 'Explore Bayon and Ta Prohm'],
                        ['time' => '12:00', 'description' => 'Return to hotel'],
                    ],
                    'inclusions' => fake()->paragraph(2),
                    'exclusions' => fake()->paragraph(2),
                    'meeting_point_address' => fake()->address(),
                    'meeting_point_lat' => fake()->latitude(13.30, 13.45),
                    'meeting_point_lng' => fake()->longitude(103.80, 103.95),
                    'duration_minutes' => $data['duration'],
                    'min_group' => 1,
                    'max_group' => $data['max_group'],
                    'base_price_usd' => $data['base_price'],
                    'status' => 'live',
                    'is_featured' => false,
                    'is_instant_book' => true,
                    'spoken_languages' => ['en', 'km'],
                    'published_at' => now()->subDay(),
                ]
            );

            ActivityImage::firstOrCreate(
                ['activity_id' => $activity->id, 'is_hero' => true],
                [
                    'url' => $this->travelImageUrl(1200, 800),
                    'sort_order' => 0,
                    'is_hero' => true,
                ]
            );

            ActivityImage::factory()->count(3)->create([
                'activity_id' => $activity->id,
            ]);

            $this->seedTimeSlots($activity);
        }

        $provider->activities()->where('status', 'live')->get()->each(function (Activity $activity) {
            $this->seedBookingsAndReviews($activity, fake()->numberBetween(4, 8));
        });

        $provider->total_bookings = Booking::whereHas('activity', fn ($q) => $q->where('provider_id', $provider->id))->count();
        $provider->save();
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

            $status = fake()->randomElement(['pending', 'confirmed', 'confirmed', 'completed', 'cancelled']);
            $confirmedAt = in_array($status, ['confirmed', 'completed'], true) ? now() : null;
            $cancelledAt = $status === 'cancelled' ? now() : null;

            $booking = Booking::factory()->create([
                'activity_id' => $activity->id,
                'time_slot_id' => $slot->id,
                'booking_date' => $slot->date,
                'booking_time' => $slot->start_time,
                'traveler_count' => $travelers,
                'status' => $status,
                'total_price' => round($activity->base_price_usd * $travelers, 2),
                'commission_amount' => round($activity->base_price_usd * $travelers * 0.05, 2),
                'confirmed_at' => $confirmedAt,
                'cancelled_at' => $cancelledAt,
            ]);

            if (fake()->boolean(40)) {
                BookingAddon::factory()->count(fake()->numberBetween(1, 2))->create([
                    'booking_id' => $booking->id,
                ]);
            }

            if (fake()->boolean(60) && in_array($status, ['confirmed', 'completed'], true)) {
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
}
