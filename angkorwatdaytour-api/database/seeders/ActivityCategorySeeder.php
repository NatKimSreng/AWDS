<?php

namespace Database\Seeders;

use App\Models\ActivityCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ActivityCategorySeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Temples & History',
                'slug' => 'temples-history',
                'icon' => 'landmark',
                'description' => 'Guided tours of Angkor Wat, Bayon, Ta Prohm, and lesser-known temples.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Sunrise & Sunset',
                'slug' => 'sunrise-sunset',
                'icon' => 'sun',
                'description' => 'Golden-hour experiences at Angkor Wat and hidden viewpoints.',
                'sort_order' => 2,
            ],
            [
                'name' => 'Food & Culture',
                'slug' => 'food-culture',
                'icon' => 'utensils',
                'description' => 'Market tours, Khmer cooking classes, and village visits.',
                'sort_order' => 3,
            ],
            [
                'name' => 'Adventure',
                'slug' => 'adventure',
                'icon' => 'compass',
                'description' => 'Off-road, cycling, and active experiences around Siem Reap.',
                'sort_order' => 4,
            ],
            [
                'name' => 'Photography',
                'slug' => 'photography',
                'icon' => 'camera',
                'description' => 'Private photo shoots with local guides who know the best angles.',
                'sort_order' => 5,
            ],
            [
                'name' => 'Multi-day',
                'slug' => 'multi-day',
                'icon' => 'calendar-range',
                'description' => 'Extended itineraries across Siem Reap and beyond.',
                'sort_order' => 6,
            ],
        ];

        foreach ($categories as $category) {
            ActivityCategory::firstOrCreate(
                ['slug' => $category['slug']],
                array_merge($category, ['is_active' => true])
            );
        }
    }
}
