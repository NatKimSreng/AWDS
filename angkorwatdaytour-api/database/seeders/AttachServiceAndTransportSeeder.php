<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\ServiceType;
use App\Models\TransportMode;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AttachServiceAndTransportSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $serviceTypes = ServiceType::all()->keyBy('slug');
        $transportModes = TransportMode::all()->keyBy('slug');

        Activity::where('status', 'live')->get()->each(function (Activity $activity) use ($serviceTypes, $transportModes) {
            $title = strtolower($activity->title);
            $categorySlug = strtolower($activity->category?->slug ?? '');

            // ── Service Types ──
            $serviceSlugs = [];

            if ($categorySlug === 'photography' || str_contains($title, 'photo')) {
                $serviceSlugs[] = 'photography';
            }
            if (str_contains($title, 'rent') || str_contains($title, 'hire')) {
                $serviceSlugs[] = 'rental';
            }
            if (str_contains($title, 'charter') || str_contains($title, 'flight') || str_contains($title, 'plane') || str_contains($title, 'helicopter') || str_contains($title, 'balloon') || str_contains($title, 'ufo')) {
                $serviceSlugs[] = 'vehicle-booking';
            }

            // Default: almost every tour can be private or shared
            if (empty($serviceSlugs) || $activity->max_group <= 4) {
                $serviceSlugs[] = 'private-tour';
            }
            if ($activity->max_group >= 6) {
                $serviceSlugs[] = 'shared-tour';
            }

            $serviceIds = collect($serviceSlugs)
                ->map(fn ($s) => $serviceTypes->get($s)?->id)
                ->filter()
                ->unique()
                ->values();
            if ($serviceIds->isNotEmpty()) {
                $activity->serviceTypes()->sync($serviceIds);
            }

            // ── Transport Modes ──
            $transportSlugs = [];

            if ($categorySlug === 'adventure' || str_contains($title, 'bike') || str_contains($title, 'cycling')) {
                $transportSlugs[] = 'bicycle';
                $transportSlugs[] = 'tuk-tuk';
            }
            if (str_contains($title, 'balloon') || str_contains($title, 'aerial') || str_contains($title, 'sky')) {
                $transportSlugs[] = 'hot-air-balloon';
            }
            if (str_contains($title, 'helicopter') || str_contains($title, 'chopper')) {
                $transportSlugs[] = 'helicopter';
            }
            if (str_contains($title, 'plane') || str_contains($title, 'flight') || str_contains($title, 'air') || str_contains($title, 'ufo')) {
                $transportSlugs[] = 'airplane';
            }
            if (str_contains($title, 'floating') || str_contains($title, 'boat') || str_contains($title, 'cruise') || str_contains($title, 'lake') || str_contains($title, 'river')) {
                $transportSlugs[] = 'boat';
            }
            if (str_contains($title, 'quad') || str_contains($title, 'atv') || str_contains($title, 'off-road')) {
                $transportSlugs[] = 'quad-bike';
            }
            if (str_contains($title, 'scooter') || str_contains($title, 'e-bike')) {
                $transportSlugs[] = 'e-scooter';
            }
            if (str_contains($title, 'moto') || str_contains($title, 'motor')) {
                $transportSlugs[] = 'moto';
            }

            // Default for temple / city / standard tours
            if (empty($transportSlugs)) {
                if ($categorySlug === 'adventure') {
                    $transportSlugs[] = 'tuk-tuk';
                    $transportSlugs[] = 'moto';
                } elseif ($categorySlug === 'multi-day') {
                    $transportSlugs[] = 'private-car';
                    $transportSlugs[] = 'tuk-tuk';
                } else {
                    // Temples, photography, food, sunrise tours
                    $transportSlugs[] = 'tuk-tuk';
                    $transportSlugs[] = 'private-car';
                }
            }

            $transportIds = collect($transportSlugs)
                ->map(fn ($s) => $transportModes->get($s)?->id)
                ->filter()
                ->unique()
                ->values();
            if ($transportIds->isNotEmpty()) {
                $activity->transportModes()->sync($transportIds);
            }
        });
    }
}
