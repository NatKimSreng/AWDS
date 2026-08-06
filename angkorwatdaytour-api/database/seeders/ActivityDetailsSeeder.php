<?php

namespace Database\Seeders;

use App\Models\Activity;
use Illuminate\Database\Seeder;

class ActivityDetailsSeeder extends Seeder
{
    public function run(): void
    {
        $details = [
            'magical-sunrise-angkor-wat' => [
                'description' => "Experience Angkor Wat at its most magical hour. We pick you up before dawn, enter the temple complex with a licensed guide, and find a quiet reflection pond for sunrise photos. After the sun rises, explore the bas-reliefs, central towers, and learn the history of the world's largest religious monument.",
                'itinerary_json' => [
                    ['time' => '04:45', 'description' => 'Hotel pickup in Siem Reap by air-conditioned van'],
                    ['time' => '05:30', 'description' => 'Enter Angkor Archaeological Park and walk to a reflection pond'],
                    ['time' => '06:00', 'description' => 'Watch the sunrise over Angkor Wat with your guide'],
                    ['time' => '06:45', 'description' => 'Guided tour inside Angkor Wat, including bas-reliefs and galleries'],
                    ['time' => '08:30', 'description' => 'Return to your hotel or continue exploring on your own'],
                ],
                'inclusions' => "Licensed English-speaking guide\nHotel pickup and drop-off in Siem Reap\nAngkor Archaeological Park day pass\nBottled water",
                'exclusions' => "Breakfast and meals\nPersonal expenses and tips\nTemple pass for multi-day visits",
                'meeting_point_address' => 'Hotel lobby in central Siem Reap (exact pickup confirmed after booking)',
                'what_to_bring' => "Comfortable walking shoes\nSun hat and sunscreen\nCamera or smartphone\nLight long-sleeve clothing for temple dress code",
                'not_allowed' => "Shorts and sleeveless shirts inside temple sanctuaries\nTripods without advance notice\nDrones",
                'know_before_you_go' => "Angkor Wat tickets are non-refundable once issued.\nThe guide will meet you at your hotel 45–60 minutes before sunrise.\nTemples are active religious sites: please keep voices low and do not touch carvings.",
                'additional_info' => "Available in English and Khmer. Private upgrade available on request.",
                'not_suitable_for' => "People with limited mobility due to uneven stone steps and long walks",
                'weather_policy' => "Rain or shine. In rare cases of severe weather, the guide may adjust the route for safety.",
                'start_time_flexibility' => "Pickup is typically 4:45 AM but may shift 10–15 minutes earlier or later depending on sunrise timing.",
                'free_cancellation_hours' => 24,
            ],
            'hidden-temples-tuktuk' => [
                'description' => "Skip the crowds and discover lesser-known temples by tuk-tuk. Your local guide takes you to Preah Khan, Neak Pean, and Ta Som, sharing stories most visitors miss. A fun, breezy ride through the jungle between stops.",
                'itinerary_json' => [
                    ['time' => '08:00', 'description' => 'Meet your guide and private tuk-tuk driver in town'],
                    ['time' => '08:30', 'description' => 'Explore Preah Khan temple and its hidden corridors'],
                    ['time' => '10:00', 'description' => 'Visit Neak Pean on its island reservoir'],
                    ['time' => '11:00', 'description' => 'Discover Ta Som and its iconic strangler fig gate'],
                    ['time' => '12:30', 'description' => 'Return to Siem Reap'],
                ],
                'inclusions' => "Private tuk-tuk and driver\nLicensed guide\nBottled water\nParking and tolls",
                'exclusions' => "Temple day pass\nMeals and tips",
                'meeting_point_address' => 'Siem Reap Old Market area, exact corner shared via WhatsApp before the tour',
                'what_to_bring' => "Sun protection\nCash for temple pass\nCamera",
                'not_allowed' => "Selfie sticks inside sanctuaries\nSmoking at temple sites",
                'know_before_you_go' => "You must purchase an Angkor park pass before the tour or at the ticket booth en route.",
                'additional_info' => "Maximum 4 travelers per tuk-tuk; larger groups get multiple vehicles.",
                'not_suitable_for' => "Travelers with back problems due to tuk-tuk vibrations on bumpy roads",
                'weather_policy' => "Operates in light rain. Severe storms may cause delays or rescheduling.",
                'start_time_flexibility' => "Start time is usually 8:00 AM but can be adjusted to 7:30 or 8:30 on request.",
                'free_cancellation_hours' => 24,
            ],
            'bayon-ta-prohm-full-day' => [
                'description' => "A complete Angkor small-circuit day covering Bayon's smiling faces, the jungle-clad ruins of Ta Prohm, Baphuon, and the Terrace of the Elephants. Perfect for first-time visitors who want the full story in one day.",
                'itinerary_json' => [
                    ['time' => '08:00', 'description' => 'Hotel pickup and Angkor park pass purchase'],
                    ['time' => '08:45', 'description' => 'Bayon Temple: faces, bas-reliefs, and upper terrace'],
                    ['time' => '10:30', 'description' => 'Baphuon and Terrace of the Elephants'],
                    ['time' => '12:00', 'description' => 'Lunch break near the temples (own expense)'],
                    ['time' => '13:30', 'description' => 'Ta Prohm, famous from Tomb Raider'],
                    ['time' => '15:30', 'description' => 'Return to Siem Reap'],
                ],
                'inclusions' => "Licensed guide\nAir-conditioned transport\nBottled water",
                'exclusions' => "Temple day pass\nLunch\nTips",
                'meeting_point_address' => 'Hotel pickup in Siem Reap city center',
                'what_to_bring' => "Walking shoes\nSunscreen and hat\nDaypack\nTemple pass or cash to buy one",
                'not_allowed' => "Large backpacks inside narrow galleries\nDrones",
                'know_before_you_go' => "This is a full-day walking tour with several kilometers of temple exploration.\nLunch is on your own at a local restaurant near the park.",
                'additional_info' => "Private version available. Spanish, French, and Chinese guides available on request.",
                'not_suitable_for' => "Young children under 5 due to long walking distances and heat",
                'weather_policy' => "Tours run rain or shine; umbrellas provided during wet season.",
                'start_time_flexibility' => "Default 8:00 AM start. Earlier 7:00 AM starts available April–June.",
                'free_cancellation_hours' => 24,
            ],
            'evening-street-food-walk' => [
                'description' => "Eat like a local on this evening street-food walk through Siem Reap. Sample Khmer noodles, grilled skewers, fresh sugar cane juice, and dessert from trusted stalls your guide has known for years.",
                'itinerary_json' => [
                    ['time' => '17:30', 'description' => 'Meet at a central market corner'],
                    ['time' => '18:00', 'description' => 'Sample num pang and fresh spring rolls'],
                    ['time' => '18:45', 'description' => 'Try grilled meats and Cambodian soups'],
                    ['time' => '19:30', 'description' => 'Visit a night-market dessert stall'],
                    ['time' => '20:30', 'description' => 'Tour ends near Pub Street'],
                ],
                'inclusions' => "Local English-speaking guide\nAll food tastings\nOne drink",
                'exclusions' => "Additional drinks and extra food\nTips",
                'meeting_point_address' => 'Siem Reap Art Center Night Market, main entrance',
                'what_to_bring' => "Comfortable shoes\nCash for extras\nEmpty stomach",
                'not_allowed' => "Outside food during tastings",
                'know_before_you_go' => "Let your guide know about allergies or dietary restrictions at the start.",
                'additional_info' => "Vegetarian options available; notify guide on arrival.",
                'not_suitable_for' => "People with severe food allergies unless discussed in advance",
                'weather_policy' => "Operates rain or shine; covered stalls are available along the route.",
                'start_time_flexibility' => "Tour starts between 17:30 and 18:00 depending on stall readiness.",
                'free_cancellation_hours' => 24,
            ],
            'cooking-class-market-visit' => [
                'description' => "Shop at a local market with a chef, then learn to cook classic Khmer dishes in an open-air kitchen. You'll prepare fish amok, banana flower salad, and fresh spring rolls, then enjoy the meal you made.",
                'itinerary_json' => [
                    ['time' => '08:30', 'description' => 'Hotel pickup'],
                    ['time' => '09:00', 'description' => 'Guided market tour and ingredient shopping'],
                    ['time' => '10:00', 'description' => 'Cooking class: amok, salads, and rolls'],
                    ['time' => '12:30', 'description' => 'Lunch featuring your own dishes'],
                    ['time' => '13:30', 'description' => 'Return to hotel'],
                ],
                'inclusions' => "Market tour\nCooking class with chef\nAll ingredients\nLunch and recipe cards",
                'exclusions' => "Transportation outside central Siem Reap\nTips",
                'meeting_point_address' => 'Hotel pickup or cooking school address shared after booking',
                'what_to_bring' => "Comfortable clothes\nNotebook for recipes\nCamera",
                'not_allowed' => "Smoking in the kitchen area",
                'know_before_you_go' => "Please inform us of dietary restrictions at least 24 hours in advance.",
                'additional_info' => "Class size is limited to 8 for a hands-on experience.",
                'not_suitable_for' => "Very young children who cannot safely use kitchen equipment",
                'weather_policy' => "Outdoor kitchen has shade and rain cover. Class proceeds rain or shine.",
                'start_time_flexibility' => "Morning class starts at 8:30 AM; afternoon class at 2:00 PM on request.",
                'free_cancellation_hours' => 24,
            ],
            'countryside-cycling-tour' => [
                'description' => "Pedal beyond the temples through rice paddies, lotus farms, and traditional villages. Stop at a local home for fresh coconut water and learn about rural Cambodian life from your guide.",
                'itinerary_json' => [
                    ['time' => '07:30', 'description' => 'Bike fitting and safety briefing at the tour base'],
                    ['time' => '08:00', 'description' => 'Cycle through rice fields and villages'],
                    ['time' => '09:30', 'description' => 'Visit a lotus farm and meet local farmers'],
                    ['time' => '11:00', 'description' => 'Refreshment stop with fresh coconut water'],
                    ['time' => '12:00', 'description' => 'Return to base'],
                ],
                'inclusions' => "Quality hybrid bike and helmet\nGuide\nFresh coconut water\nBottled water",
                'exclusions' => "Hotel transfers\nMeals\nTips",
                'meeting_point_address' => 'Tour base in Siem Reap countryside, pickup option available for a small fee',
                'what_to_bring' => "Closed-toe shoes\nSunscreen\nActivewear\nSmall daypack",
                'not_allowed' => "Loose sandals\nRiding under the influence of alcohol",
                'know_before_you_go' => "Route is mostly flat dirt roads with some short paved sections. Approx. 20 km total.",
                'additional_info' => "E-bike upgrade available for an extra charge.",
                'not_suitable_for' => "People unable to ride a bicycle for 2+ hours",
                'weather_policy' => "Light rain is fine; heavy rain may cause rescheduling for safety.",
                'start_time_flexibility' => "Usually starts 7:30 AM to avoid midday heat. Afternoon tours available Nov–Feb.",
                'free_cancellation_hours' => 24,
            ],
            'sunset-quad-bike-ride' => [
                'description' => "Race across rural trails, rice paddies, and red-dirt paths as the sun sets. No experience needed: guides give a full safety briefing and lead the way to a scenic viewpoint.",
                'itinerary_json' => [
                    ['time' => '16:00', 'description' => 'Arrival, safety briefing, and ATV practice'],
                    ['time' => '16:30', 'description' => 'Ride through countryside trails'],
                    ['time' => '17:30', 'description' => 'Sunset viewpoint stop with photos'],
                    ['time' => '18:30', 'description' => 'Return to base'],
                ],
                'inclusions' => "ATV/quad bike and helmet\nGuide\nSafety goggles\nBottled water",
                'exclusions' => "Hotel transfers\nMeals\nTips",
                'meeting_point_address' => 'Quad-bike base on the outskirts of Siem Reap (shared after booking)',
                'what_to_bring' => "Closed-toe shoes you do not mind getting dusty\nSunglasses\nBandana or dust mask",
                'not_allowed' => "Open-toe shoes\nRiding after alcohol consumption\nPregnant travelers",
                'know_before_you_go' => "Minimum age for driving is 16 with parental consent; passengers aged 8+ allowed.",
                'additional_info' => "Two-seater ATVs available; second passenger rides at a reduced rate.",
                'not_suitable_for' => "Pregnant travelers and people with back or neck injuries",
                'weather_policy' => "Tour runs in dry and light rain. Thunderstorms may cause postponement.",
                'start_time_flexibility' => "Sunset departure varies by season, typically 16:00–17:00.",
                'free_cancellation_hours' => 24,
            ],
            'floating-village-boat-tour' => [
                'description' => "Cruise through Kampong Phluk floating village on Tonlé Sap Lake. See stilt houses, floating schools, and learn how communities adapt to Cambodia's great lake's seasonal rise and fall.",
                'itinerary_json' => [
                    ['time' => '08:00', 'description' => 'Hotel pickup in Siem Reap'],
                    ['time' => '09:00', 'description' => 'Drive to Kampong Phluk and board a local boat'],
                    ['time' => '09:45', 'description' => 'Cruise through the floating village'],
                    ['time' => '11:00', 'description' => 'Visit the flooded forest by small paddle boat (seasonal)'],
                    ['time' => '12:00', 'description' => 'Return to Siem Reap'],
                ],
                'inclusions' => "Hotel pickup and drop-off\nLocal boat trip\nEnglish-speaking guide\nBottled water",
                'exclusions' => "Boat community fee (~USD 5 per person, paid locally)\nMeals and tips",
                'meeting_point_address' => 'Hotel lobby in Siem Reap',
                'what_to_bring' => "Sun hat\nSunscreen\nCash for local community fee\nCamera",
                'not_allowed' => "Feeding wildlife\nLittering in the lake",
                'know_before_you_go' => "Water levels vary by season; the flooded-forest paddle may not operate in very low water.",
                'additional_info' => "Private and small-group options available. Life jackets provided.",
                'not_suitable_for' => "Travelers prone to severe motion sickness on small boats",
                'weather_policy' => "Cruises may be shortened or rescheduled if lake conditions become unsafe.",
                'start_time_flexibility' => "Morning departures 8:00 AM; afternoon sunset tours available on request.",
                'free_cancellation_hours' => 24,
            ],
            'tonle-sap-sunset-bird-watching' => [
                'description' => "Glide across Tonlé Sap at golden hour with a birding guide. Spot pelicans, storks, and ibis returning to roost while the sky turns pink over the water.",
                'itinerary_json' => [
                    ['time' => '15:00', 'description' => 'Pickup and drive to the lake'],
                    ['time' => '16:00', 'description' => 'Board a quiet paddle boat'],
                    ['time' => '17:00', 'description' => 'Bird watching as flocks return to roost'],
                    ['time' => '18:15', 'description' => 'Sunset on the water'],
                    ['time' => '19:00', 'description' => 'Return to Siem Reap'],
                ],
                'inclusions' => "Transport\nBirding guide\nBoat and binoculars\nBottled water",
                'exclusions' => "Meals and tips\nCamera lens rental",
                'meeting_point_address' => 'Hotel pickup in Siem Reap',
                'what_to_bring' => "Neutral-colored clothing\nBinoculars if you have them\nCamera with zoom lens",
                'not_allowed' => "Flash photography\nLoud voices that disturb birds",
                'know_before_you_go' => "Best birding is during the dry season (Nov–Mar). Wildlife sightings are never guaranteed.",
                'additional_info' => "Groups limited to 6 to keep noise low.",
                'not_suitable_for' => "Young children who cannot sit quietly on a boat for 2 hours",
                'weather_policy' => "Sunset tours may be rescheduled if heavy rain or lightning is forecast.",
                'start_time_flexibility' => "Departure adjusts 30–60 minutes around sunset throughout the year.",
                'free_cancellation_hours' => 24,
            ],
            'golden-hour-temple-photography' => [
                'description' => "Capture Angkor in the best light with a photography guide. Visit carefully chosen temples at golden hour, get composition tips, and learn low-light techniques as the day fades.",
                'itinerary_json' => [
                    ['time' => '16:00', 'description' => 'Meet guide and review camera settings'],
                    ['time' => '16:30', 'description' => 'First golden-hour location'],
                    ['time' => '17:45', 'description' => 'Sunset shooting at a scenic temple'],
                    ['time' => '18:30', 'description' => 'Optional blue-hour session'],
                    ['time' => '19:00', 'description' => 'Return to town'],
                ],
                'inclusions' => "Photography guide\nTransport between temples\nTripod if needed",
                'exclusions' => "Temple pass\nCamera gear\nTips",
                'meeting_point_address' => 'Meet at a Siem Reap coffee shop or your hotel lobby',
                'what_to_bring' => "Camera or smartphone\nTripod\nExtra battery and memory card",
                'not_allowed' => "Drones\nFlash inside temples",
                'know_before_you_go' => "A valid Angkor park pass is required. The guide can help arrange it.",
                'additional_info' => "Suitable for all skill levels from phone photographers to DSLR users.",
                'not_suitable_for' => "People who cannot walk and stand for 2.5 hours",
                'weather_policy' => "Clouds can enhance sunset colors; tour proceeds unless severe weather forces cancellation.",
                'start_time_flexibility' => "Start time varies 15–30 minutes to align with golden hour.",
                'free_cancellation_hours' => 24,
            ],
            'portrait-session-ancient-ruins' => [
                'description' => "A private portrait session in atmospheric temple ruins. A professional photographer leads you to quiet corners for candid and posed shots, perfect for couples, solo travelers, or families.",
                'itinerary_json' => [
                    ['time' => '07:00', 'description' => 'Meet photographer at temple'],
                    ['time' => '07:15', 'description' => 'First portrait set among ancient doorways'],
                    ['time' => '08:30', 'description' => 'Second location with jungle backdrop'],
                    ['time' => '09:30', 'description' => 'Final set and wrap'],
                    ['time' => '10:00', 'description' => 'Receive edited digital photos within 48 hours'],
                ],
                'inclusions' => "Professional photographer\nPrivate transport between spots\n20 edited digital photos",
                'exclusions' => "Temple pass\nHair and makeup\nTips",
                'meeting_point_address' => 'Temple gate or hotel pickup in Siem Reap',
                'what_to_bring' => "Outfit changes if desired\nComfortable walking shoes\nProps like hats or scarves",
                'not_allowed' => "Changing clothes inside active temple sanctuaries",
                'know_before_you_go' => "Edited photos are delivered via cloud link within 48 hours.",
                'additional_info' => " sunrise or sunset slots available. Book early for popular dates.",
                'not_suitable_for' => "Groups larger than 5 unless a second photographer is booked",
                'weather_policy' => "Sessions proceed in light rain; severe weather will be rescheduled.",
                'start_time_flexibility' => "Morning slot 7:00 AM; sunset slot timing shared after booking.",
                'free_cancellation_hours' => 48,
            ],
            '3-day-angkor-deep-dive' => [
                'description' => "Three full days exploring Angkor's major temples and hidden corners. Includes sunrise at Angkor Wat, the Grand Circuit, remote temples like Banteay Srei and Beng Mealea, and a countryside village stop.",
                'itinerary_json' => [
                    ['time' => 'Day 1', 'description' => 'Sunrise at Angkor Wat, Angkor Thom, and Ta Prohm'],
                    ['time' => 'Day 2', 'description' => 'Grand Circuit: Preah Khan, Neak Pean, East Mebon, Pre Rup'],
                    ['time' => 'Day 3', 'description' => 'Banteay Srei, Beng Mealea, and a rural village visit'],
                ],
                'inclusions' => "Licensed guide for 3 days\nPrivate air-conditioned vehicle\nBottled water daily",
                'exclusions' => "Temple passes\nMeals and accommodation\nTips",
                'meeting_point_address' => 'Daily hotel pickup in Siem Reap',
                'what_to_bring' => "3-day Angkor pass\nSun protection\nComfortable walking shoes\nDaypack",
                'not_allowed' => "Drones\nSmoking at temple sites",
                'know_before_you_go' => "A 3-day Angkor pass is required and can be purchased at the ticket office.\nAccommodation in Siem Reap is not included.",
                'additional_info' => "Customize the pace and add sunrise or sunset shoots on request.",
                'not_suitable_for' => "Travelers with very limited mobility due to extensive walking and stairs",
                'weather_policy' => "Tour proceeds rain or shine; umbrella and poncho recommended in wet season.",
                'start_time_flexibility' => "Typically 5:00 AM on day 1 for sunrise; later starts on days 2 and 3.",
                'free_cancellation_hours' => 72,
            ],
            '2-day-temples-villages-combo' => [
                'description' => "Two days mixing temple exploration with countryside culture. Day one covers Angkor Wat, Bayon, and Ta Prohm; day two visits a floating village, a local market, and a village home.",
                'itinerary_json' => [
                    ['time' => 'Day 1', 'description' => 'Angkor Wat sunrise, Angkor Thom, Bayon, and Ta Prohm'],
                    ['time' => 'Day 2', 'description' => 'Floating village boat ride, local market, and village home visit'],
                ],
                'inclusions' => "Licensed guide\nPrivate transport\nBottled water\nBoat ride",
                'exclusions' => "Temple passes\nMeals and accommodation\nTips",
                'meeting_point_address' => 'Daily hotel pickup in Siem Reap',
                'what_to_bring' => "Temple pass\nSun protection\nCash for market purchases\nModest clothing for village visit",
                'not_allowed' => "Drones\nLittering in villages or on the lake",
                'know_before_you_go' => "Overnight accommodation is not included; guide can recommend hotels.",
                'additional_info' => "Private and small-group options available.",
                'not_suitable_for' => "Travelers unable to walk on uneven ground or board small boats",
                'weather_policy' => "Operates rain or shine; routes may adjust for safety.",
                'start_time_flexibility' => "Day 1 starts around 5:00 AM for sunrise; day 2 around 8:00 AM.",
                'free_cancellation_hours' => 48,
            ],
        ];

        // Realistic meeting-point coordinates for demo map rendering.
        $coordinates = [
            'magical-sunrise-angkor-wat' => ['lat' => 13.4125, 'lng' => 103.8670],
            'hidden-temples-tuktuk' => ['lat' => 13.4610, 'lng' => 103.8720],
            'bayon-ta-prohm-full-day' => ['lat' => 13.4410, 'lng' => 103.8580],
            'evening-street-food-walk' => ['lat' => 13.3550, 'lng' => 103.8550],
            'cooking-class-market-visit' => ['lat' => 13.3610, 'lng' => 103.8610],
            'countryside-cycling-tour' => ['lat' => 13.3800, 'lng' => 103.8800],
            'sunset-quad-bike-ride' => ['lat' => 13.3200, 'lng' => 103.9200],
            'floating-village-boat-tour' => ['lat' => 13.2100, 'lng' => 104.0200],
            'tonle-sap-sunset-bird-watching' => ['lat' => 13.1800, 'lng' => 103.9900],
            'golden-hour-temple-photography' => ['lat' => 13.4300, 'lng' => 103.8700],
            'portrait-session-ancient-ruins' => ['lat' => 13.4400, 'lng' => 103.8600],
            '3-day-angkor-deep-dive' => ['lat' => 13.3671, 'lng' => 103.8448],
            '2-day-temples-villages-combo' => ['lat' => 13.3671, 'lng' => 103.8448],
        ];

        foreach ($details as $slug => $data) {
            $activity = Activity::where('slug', $slug)->first();
            if (! $activity) {
                continue;
            }

            $update = [
                'description' => $data['description'],
                'itinerary_json' => $data['itinerary_json'],
                'inclusions' => $data['inclusions'],
                'exclusions' => $data['exclusions'],
                'meeting_point_address' => $data['meeting_point_address'],
                'what_to_bring' => $data['what_to_bring'],
                'not_allowed' => $data['not_allowed'],
                'know_before_you_go' => $data['know_before_you_go'],
                'additional_info' => $data['additional_info'],
                'not_suitable_for' => $data['not_suitable_for'],
                'weather_policy' => $data['weather_policy'],
                'start_time_flexibility' => $data['start_time_flexibility'],
                'free_cancellation_hours' => $data['free_cancellation_hours'],
                'is_refundable' => true,
            ];

            foreach ($update as $key => $value) {
                if ($activity->{$key} === null || $activity->{$key} === '' || $key === 'free_cancellation_hours' || $key === 'is_refundable') {
                    $activity->{$key} = $value;
                }
            }

            if ($coords = $coordinates[$slug] ?? null) {
                $activity->meeting_point_lat = $coords['lat'];
                $activity->meeting_point_lng = $coords['lng'];
            }

            $activity->save();
        }
    }
}
