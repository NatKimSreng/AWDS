<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cities = [
            [
                'name' => 'Siem Reap Central',
                'slug' => 'siem-reap-central',
                'description' => 'The town center, Pub Street, Old Market, and riverside.',
                'lat' => 13.3616,
                'lng' => 103.8563,
                'sort_order' => 1,
            ],
            [
                'name' => 'Angkor Archaeological Park',
                'slug' => 'angkor-park',
                'description' => 'The UNESCO World Heritage temple complex.',
                'lat' => 13.4125,
                'lng' => 103.8670,
                'sort_order' => 2,
            ],
            [
                'name' => 'Tonlé Sap & Floating Villages',
                'slug' => 'tonle-sap',
                'description' => 'Lake communities, flooded forests, and bird watching.',
                'lat' => 13.2206,
                'lng' => 103.9602,
                'sort_order' => 3,
            ],
            [
                'name' => 'Rural Siem Reap',
                'slug' => 'rural-siem-reap',
                'description' => 'Rice paddies, village life, and authentic countryside experiences.',
                'lat' => 13.4000,
                'lng' => 103.7500,
                'sort_order' => 4,
            ],
        ];

        foreach ($cities as $city) {
            City::firstOrCreate(
                ['slug' => $city['slug']],
                array_merge($city, ['is_active' => true])
            );
        }
    }
}
