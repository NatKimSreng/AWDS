<?php

namespace Database\Seeders;

use App\Models\ServiceType;
use App\Models\TransportMode;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceAndTransportSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $serviceTypes = [
            [
                'name' => 'Photography',
                'slug' => 'photography',
                'icon' => 'camera',
                'description' => 'Guided photo shoots with local guides who know the best angles and hidden spots.',
                'badge_color' => '#7c3aed',
                'sort_order' => 1,
                'image' => '/images/services/photography.jpg',
            ],
            [
                'name' => 'Rental',
                'slug' => 'rental',
                'icon' => 'key',
                'description' => 'Rent equipment, vehicles, or spaces for your own exploration.',
                'badge_color' => '#0ea5e9',
                'sort_order' => 2,
                'image' => '/images/services/rental.jpg',
            ],
            [
                'name' => 'Shared Tour',
                'slug' => 'shared-tour',
                'icon' => 'users',
                'description' => 'Join a small group and split costs with other travelers.',
                'badge_color' => '#10b981',
                'sort_order' => 3,
                'image' => '/images/services/shared-tour.jpg',
            ],
            [
                'name' => 'Private Tour',
                'slug' => 'private-tour',
                'icon' => 'user',
                'description' => 'A fully private experience tailored just for you or your group.',
                'badge_color' => '#f59e0b',
                'sort_order' => 4,
                'image' => '/images/services/private-tour.jpg',
            ],
            [
                'name' => 'Vehicle Booking',
                'slug' => 'vehicle-booking',
                'icon' => 'ticket',
                'description' => 'Book a seat or charter a vehicle to travel to your destination.',
                'badge_color' => '#ef4444',
                'sort_order' => 5,
                'image' => '/images/services/vehicle-booking.jpg',
            ],
        ];

        foreach ($serviceTypes as $st) {
            ServiceType::updateOrCreate(
                ['slug' => $st['slug']],
                array_merge($st, ['is_active' => true])
            );
        }

        $transportModes = [
            [
                'name' => 'Tuk-tuk',
                'slug' => 'tuk-tuk',
                'icon' => 'car-taxi-front',
                'description' => 'Classic Cambodian open-air taxi. Perfect for temple hopping.',
                'badge_color' => '#f59e0b',
                'category' => 'land',
                'sort_order' => 1,
                'image' => '/images/transport/tuk-tuk.jpg',
            ],
            [
                'name' => 'Moto',
                'slug' => 'moto',
                'icon' => 'bike',
                'description' => 'Zip through traffic on a motorbike with a local driver.',
                'badge_color' => '#10b981',
                'category' => 'land',
                'sort_order' => 2,
                'image' => '/images/transport/moto.jpg',
            ],
            [
                'name' => 'Private Car',
                'slug' => 'private-car',
                'icon' => 'car',
                'description' => 'Air-conditioned sedan or SUV with a professional driver.',
                'badge_color' => '#3b82f6',
                'category' => 'land',
                'sort_order' => 3,
                'image' => '/images/transport/private-car.jpg',
            ],
            [
                'name' => 'Airplane',
                'slug' => 'airplane',
                'icon' => 'plane',
                'description' => 'Scenic or charter flights over Angkor and beyond.',
                'badge_color' => '#8b5cf6',
                'category' => 'air',
                'sort_order' => 4,
                'image' => '/images/transport/airplane.jpg',
            ],
            [
                'name' => 'Helicopter',
                'slug' => 'helicopter',
                'icon' => 'plane',
                'description' => 'Aerial tours of Angkor Wat and the Tonlé Sap.',
                'badge_color' => '#ec4899',
                'category' => 'air',
                'sort_order' => 5,
                'image' => '/images/transport/helicopter.jpg',
            ],
            [
                'name' => 'Boat',
                'slug' => 'boat',
                'icon' => 'ship',
                'description' => 'Cruises and transfers on the Tonlé Sap lake.',
                'badge_color' => '#0ea5e9',
                'category' => 'water',
                'sort_order' => 6,
                'image' => '/images/transport/boat.jpg',
            ],
            [
                'name' => 'Bicycle',
                'slug' => 'bicycle',
                'icon' => 'bike',
                'description' => 'Eco-friendly cycling tours through the countryside.',
                'badge_color' => '#22c55e',
                'category' => 'land',
                'sort_order' => 7,
                'image' => '/images/transport/bicycle.jpg',
            ],
            [
                'name' => 'E-Scooter',
                'slug' => 'e-scooter',
                'icon' => 'zap',
                'description' => 'Electric scooter rental for independent city exploration.',
                'badge_color' => '#14b8a6',
                'category' => 'land',
                'sort_order' => 8,
                'image' => '/images/transport/e-scooter.jpg',
            ],
            [
                'name' => 'Hot Air Balloon',
                'slug' => 'hot-air-balloon',
                'icon' => 'cloud',
                'description' => 'Sunrise balloon rides over the Angkor Archaeological Park.',
                'badge_color' => '#f97316',
                'category' => 'air',
                'sort_order' => 9,
                'image' => '/images/transport/hot-air-balloon.jpg',
            ],
            [
                'name' => 'Quad Bike',
                'slug' => 'quad-bike',
                'icon' => 'gauge',
                'description' => 'Off-road ATV adventures through rural trails.',
                'badge_color' => '#ef4444',
                'category' => 'land',
                'sort_order' => 10,
                'image' => '/images/transport/quad-bike.jpg',
            ],
        ];

        foreach ($transportModes as $tm) {
            TransportMode::updateOrCreate(
                ['slug' => $tm['slug']],
                array_merge($tm, ['is_active' => true])
            );
        }
    }
}
