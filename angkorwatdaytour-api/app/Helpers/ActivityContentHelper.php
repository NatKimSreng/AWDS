<?php

namespace App\Helpers;

/**
 * Rich, realistic demo content for activities.
 *
 * This keeps tour descriptions, highlights, itineraries, inclusions,
 * exclusions, and practical info consistent and compelling across the
 * demo catalog.
 */
class ActivityContentHelper
{
    /**
     * Return a complete content bundle for an activity keyed by theme.
     *
     * @param array{
     *   title?: string,
     *   duration_minutes?: int,
     *   max_group?: int,
     *   base_price?: float,
     *   category_slug?: string,
     *   city_slug?: string,
     * } $activity
     */
    public static function forTheme(array $activity): array
    {
        $title = $activity['title'] ?? '';
        $category = $activity['category_slug'] ?? 'temples-history';
        $city = $activity['city_slug'] ?? 'siem-reap-central';

        return match (true) {
            str_contains($title, 'Sunrise') || str_contains($title, 'sunrise') => self::sunriseTemple($activity),
            str_contains($title, 'Food Walk') || str_contains($title, 'Street Food') => self::streetFood($activity),
            str_contains($title, 'Cooking') => self::cookingClass($activity),
            str_contains($title, 'Cycling') => self::countrysideCycling($activity),
            str_contains($title, 'Quad') || str_contains($title, 'ATV') => self::quadBike($activity),
            str_contains($title, 'Floating Village') => self::floatingVillage($activity),
            str_contains($title, 'Tonlé Sap') || str_contains($title, 'Bird') => self::tonleSapBirds($activity),
            str_contains($title, 'Photography') || str_contains($title, 'Photo') => self::photoTour($activity),
            str_contains($title, 'Portrait') => self::portraitSession($activity),
            str_contains($title, '3-Day') || str_contains($title, '2-Day') || $category === 'multi-day' => self::multiDay($activity),
            default => self::templeExplorer($activity),
        };
    }

    private static function baseTemplate(): array
    {
        return [
            'description' => '',
            'highlights' => [],
            'itinerary_json' => [],
            'inclusions' => "",
            'exclusions' => "",
            'what_to_bring' => "",
            'not_allowed' => "",
            'know_before_you_go' => "",
            'additional_info' => "",
            'not_suitable_for' => "",
            'weather_policy' => "",
            'start_time_flexibility' => "",
            'meeting_point_address' => "",
        ];
    }

    private static function applyCommon(array $data, array $activity): array
    {
        $data['free_cancellation_hours'] ??= 24;
        $data['is_refundable'] ??= true;
        $data['spoken_languages'] ??= ['en', 'km'];
        $data['is_instant_book'] ??= true;
        $data['meeting_point_address'] ??= self::defaultMeetingPoint($activity['city_slug'] ?? 'siem-reap-central');
        $data['what_to_bring'] ??= "• Comfortable walking shoes\n• Sun hat and sunscreen\n• Refillable water bottle\n• Camera or smartphone";
        $data['not_allowed'] ??= "• Drones without a permit\n• Tripods inside restricted temple areas\n• Sleeveless shirts or very short skirts at religious sites";
        $data['know_before_you_go'] ??= "Pickup time may shift 10-15 minutes depending on hotel location and season. Your guide will message you the evening before.";
        $data['additional_info'] ??= "Children under 6 join free when accompanied by an adult. Local taxes are included in the listed price.";
        $data['not_suitable_for'] ??= "• People with limited mobility (uneven temple floors)\n• Wheelchair users on routes with stairs";
        $data['weather_policy'] ??= "Tours run rain or shine. In case of severe weather we will offer a reschedule or a full refund.";
        $data['start_time_flexibility'] ??= "The listed start time is recommended. Private groups can request a different departure time up to 24 hours in advance.";
        $data['exclusions'] = $data['exclusions'] ?: "• Personal expenses and souvenirs\n• Meals and drinks unless specified\n• Gratuities for guides and drivers (optional)";

        return $data;
    }

    private static function defaultMeetingPoint(string $citySlug): string
    {
        return match ($citySlug) {
            'angkor-park' => 'Main Angkor Park ticket checkpoint, Siem Reap',
            'tonle-sap' => 'Kampong Phluk boat dock, Chong Khneas Road',
            'rural-siem-reap' => 'Siem Reap countryside cycling base, Road 60',
            default => 'Your hotel lobby in central Siem Reap (or Pub Street area)',
        };
    }

    public static function sunriseTemple(array $activity): array
    {
        $data = self::baseTemplate();
        $data['description'] = "Start your day in the most iconic way possible: watching the sun rise behind the five towers of Angkor Wat. Your guide meets you before dawn and leads you to the best reflection pool viewpoint, then continues through the western gallery bas-reliefs once the crowds thin out. After breakfast you visit Angkor Thom’s South Gate and the enigmatic Bayon temple before finishing at Ta Prohm, where jungle roots embrace ancient stone. Along the way you hear the stories of Jayavarman VII, the Khmer Empire, and the conservation challenges that keep these temples alive.";
        $data['highlights'] = [
            'Sunrise at Angkor Wat with a local photography guide',
            'Guided walk through Angkor Thom and Bayon',
            'Visit Ta Prohm, the "Tomb Raider" temple',
            'Hotel pickup and drop-off included',
            'Small group size for a personal experience',
        ];
        $data['itinerary_json'] = [
            ['time' => '04:45', 'description' => 'Pickup from your hotel in Siem Reap'],
            ['time' => '05:30', 'description' => 'Enter Angkor Wat and find a prime sunrise viewpoint'],
            ['time' => '06:45', 'description' => 'Guided tour of Angkor Wat corridors and bas-reliefs'],
            ['time' => '08:30', 'description' => 'Breakfast break with coffee and Khmer noodles'],
            ['time' => '09:30', 'description' => 'Drive to Angkor Thom and explore Bayon'],
            ['time' => '11:30', 'description' => 'Walk through Ta Prohm'],
            ['time' => '13:00', 'description' => 'Return to your hotel'],
        ];
        $data['inclusions'] = "• Hotel pickup and drop-off in air-conditioned vehicle\n• English/Khmer-speaking licensed guide\n• Bottled water and cool towels\n• Angkor temple pass (1-day)";
        $data['exclusions'] = "• Breakfast (a short stop is included; meals are extra)\n• Tips for guide and driver\n• Personal purchases";
        $data['what_to_bring'] = "• Comfortable walking shoes\n• Layered clothing for cool pre-dawn temperatures\n• Headlamp or phone flashlight\n• Sunscreen and sunglasses";
        $data['not_suitable_for'] = "• Infants and very young children\n• People unable to climb uneven temple stairs";

        return self::applyCommon($data, $activity);
    }

    public static function templeExplorer(array $activity): array
    {
        $data = self::baseTemplate();
        $data['description'] = "Leave the beaten path and discover the hidden temples of Angkor with a knowledgeable local guide. This relaxed full-day tour mixes the grandeur of Angkor Wat with lesser-visited gems such as Preah Khan, Neak Pean, and Banteay Kdei. Traveling by remork (tuk-tuk) keeps the breeze on your face and the countryside close. Your guide shares the symbolism carved into lintels, the stories behind the smiling Bayon faces, and practical tips on avoiding the busiest gates.";
        $data['highlights'] = [
            'Full-day tuk-tuk temple circuit',
            'Hidden corners away from main tour-bus routes',
            'Local guide with deep temple history knowledge',
            'Flexible pace with rest stops',
            'Lunch recommendation at a local restaurant',
        ];
        $data['itinerary_json'] = [
            ['time' => '08:00', 'description' => 'Hotel pickup by private tuk-tuk'],
            ['time' => '08:30', 'description' => 'Visit Angkor Wat in soft morning light'],
            ['time' => '10:30', 'description' => 'Explore Preah Khan and Neak Pean'],
            ['time' => '12:30', 'description' => 'Lunch break at a nearby Khmer restaurant'],
            ['time' => '14:00', 'description' => 'Walk through Ta Prohm and Banteay Kdei'],
            ['time' => '16:30', 'description' => 'Sunset stop at a quiet viewpoint'],
            ['time' => '17:30', 'description' => 'Return to hotel'],
        ];
        $data['inclusions'] = "• Private tuk-tuk and driver\n• Licensed English-speaking guide\n• Chilled water and towels\n• 1-day Angkor pass";

        return self::applyCommon($data, $activity);
    }

    public static function streetFood(array $activity): array
    {
        $data = self::baseTemplate();
        $data['description'] = "Siem Reap’s evening food scene is a delicious mix of street stalls, family-run kitchens, and night-market snacks. On this guided walk you sample authentic Khmer dishes most visitors never find: charcoal-grilled skewers, num pang sandwiches, fresh sugar-cane juice, and the famous Cambodian pancake. Your guide explains the ingredients, introduces you to vendors, and shares tips on local etiquette. Come hungry—portions are generous and the flavors are unforgettable.";
        $data['highlights'] = [
            'Taste 6-8 authentic Khmer street-food dishes',
            'Visit local night market and back-street stalls',
            'Meet vendors and learn about Khmer ingredients',
            'Small group for easy movement through crowds',
            'Includes all food and one drink',
        ];
        $data['itinerary_json'] = [
            ['time' => '17:30', 'description' => 'Meet at Pub Street entrance'],
            ['time' => '17:45', 'description' => 'Grilled meat skewers and num pang tasting'],
            ['time' => '18:30', 'description' => 'Night-market snack crawl'],
            ['time' => '19:15', 'description' => 'Sit-down Khmer pancake and curry'],
            ['time' => '20:00', 'description' => 'Dessert: fresh fruit or sticky-rice treat'],
            ['time' => '20:30', 'description' => 'Finish near Pub Street'],
        ];
        $data['inclusions'] = "• All food tastings listed in the itinerary\n• One soft drink or fresh juice\n• English-speaking foodie guide\n• Printed tasting map";
        $data['exclusions'] = "• Alcoholic beverages\n• Additional snacks beyond the tour\n• Tips for guide";
        $data['what_to_bring'] = "• Comfortable walking shoes\n• Small appetite (or big!)\n• Cash for extra snacks";
        $data['not_allowed'] = "• Outside alcoholic drinks at vendor stalls";
        $data['not_suitable_for'] = "• Travelers with severe food allergies—please contact us before booking";

        return self::applyCommon($data, $activity);
    }

    public static function cookingClass(array $activity): array
    {
        $data = self::baseTemplate();
        $data['description'] = "Learn the secrets of Khmer cuisine from market to table. Your morning begins with a guided shopping trip through a local Siem Reap market, where you select fresh herbs, vegetables, and proteins for the day’s menu. Back at the cooking pavilion, a chef demonstrates each dish before you prepare your own. You will cook classics like fish amok, green mango salad, and Cambodian chicken curry, then sit down to enjoy the meal you created.";
        $data['highlights'] = [
            'Guided market visit and ingredient selection',
            'Hands-on cooking with a Khmer chef',
            'Prepare 3 classic Cambodian dishes',
            'Eat the lunch you cooked',
            'Recipe cards to take home',
        ];
        $data['itinerary_json'] = [
            ['time' => '08:30', 'description' => 'Hotel pickup'],
            ['time' => '09:00', 'description' => 'Market tour and ingredient shopping'],
            ['time' => '10:00', 'description' => 'Welcome drink and cooking overview'],
            ['time' => '10:30', 'description' => 'Cooking session: starter, main, and dessert'],
            ['time' => '13:00', 'description' => 'Enjoy your creations at a shared table'],
            ['time' => '14:00', 'description' => 'Return to hotel with recipe cards'],
        ];
        $data['inclusions'] = "• Hotel pickup and drop-off\n• Market tour with a local chef\n• All ingredients and cooking equipment\n• Full lunch with drinks\n• Printed recipe cards";
        $data['exclusions'] = "• Extra purchases at the market\n• Tips for chef and staff";

        return self::applyCommon($data, $activity);
    }

    public static function countrysideCycling(array $activity): array
    {
        $data = self::baseTemplate();
        $data['description'] = "Swap temple crowds for palm-shaded lanes, rice paddies, and friendly village stops. This guided cycling tour follows flat back roads through rural Siem Reap, passing lotus ponds, water buffalo, and stilted houses. You stop at a local home for fresh coconut water, visit a village school when in session, and learn about rice farming from your guide. It is an active, authentic glimpse of everyday Cambodian life.";
        $data['highlights'] = [
            'Scenic, flat cycling on quiet country roads',
            'Village visits and optional school stop',
            'Fresh coconut water break',
            'Learn about rice planting and harvest cycles',
            'Quality bikes and helmet included',
        ];
        $data['itinerary_json'] = [
            ['time' => '07:30', 'description' => 'Bike fitting and safety briefing at base'],
            ['time' => '08:00', 'description' => 'Cycle through rice paddies and lotus ponds'],
            ['time' => '09:30', 'description' => 'Village home visit and coconut break'],
            ['time' => '11:00', 'description' => 'Visit a local school (when in session)'],
            ['time' => '12:00', 'description' => 'Return to base and transfer to hotel'],
        ];
        $data['inclusions'] = "• Mountain bike and helmet\n• English-speaking cycling guide\n• Coconut water tasting\n• Hotel transfer to/from base";
        $data['exclusions'] = "• Sunscreen and sportswear (bring your own)\n• Tips";
        $data['not_suitable_for'] = "• Young children unable to ride a bicycle\n• Pregnant travelers";

        return self::applyCommon($data, $activity);
    }

    public static function quadBike(array $activity): array
    {
        $data = self::baseTemplate();
        $data['description'] = "Feel the adrenaline as you steer a quad bike through Cambodia’s red-dirt trails, rice fields, and rural villages. After a safety briefing and practice loop, follow your guide on a sunset route that ends at an open viewpoint. Dust, breeze, and golden light make this one of the most memorable ways to experience the Siem Reap countryside. No previous ATV experience is needed.";
        $data['highlights'] = [
            'Quad biking on scenic rural trails',
            'Sunset route with open viewpoints',
            'Safety briefing and practice loop',
            'No prior experience required',
            'Guide-led convoy for safety',
        ];
        $data['itinerary_json'] = [
            ['time' => '15:30', 'description' => 'Pickup and transfer to ATV base'],
            ['time' => '16:00', 'description' => 'Safety briefing, helmet fitting, and practice'],
            ['time' => '16:30', 'description' => 'Ride through villages and rice fields'],
            ['time' => '17:45', 'description' => 'Sunset stop at a countryside viewpoint'],
            ['time' => '18:15', 'description' => 'Return ride to base'],
            ['time' => '18:45', 'description' => 'Transfer back to hotel'],
        ];
        $data['inclusions'] = "• ATV/quad bike rental\n• Helmet and safety gear\n• Lead guide and support rider\n• Hotel transfers";
        $data['exclusions'] = "• Closed-toe shoes are required (not provided)\n• Drinks and snacks\n• Personal insurance";
        $data['not_allowed'] = "• Riding under the influence of alcohol\n• Passengers not booked on the tour";
        $data['not_suitable_for'] = "• Children under 12\n• Pregnant travelers\n• People with back or neck problems";

        return self::applyCommon($data, $activity);
    }

    public static function floatingVillage(array $activity): array
    {
        $data = self::baseTemplate();
        $data['description'] = "Cruise through the stilted houses and flooded forests of Kampong Phluk, one of Tonlé Sap Lake’s most authentic floating villages. Your boat passes schools, shops, and homes built on towering wooden poles, then enters a quiet mangrove channel where you can switch to a small paddle boat (seasonal). Your guide shares how life adapts to the lake’s dramatic wet and dry seasons.";
        $data['highlights'] = [
            'Boat cruise through a real floating village',
            'See stilted houses, schools, and local daily life',
            'Optional paddle-boat ride through flooded forest',
            'Learn about Tonlé Sap ecology from a local guide',
            'Small-group departure to avoid large tourist boats',
        ];
        $data['itinerary_json'] = [
            ['time' => '08:00', 'description' => 'Hotel pickup'],
            ['time' => '09:00', 'description' => 'Arrive at Kampong Phluk dock and board boat'],
            ['time' => '09:30', 'description' => 'Cruise through floating village'],
            ['time' => '11:00', 'description' => 'Optional paddle-boat in flooded forest'],
            ['time' => '12:00', 'description' => 'Lunch at a floating restaurant'],
            ['time' => '13:30', 'description' => 'Return to Siem Reap'],
        ];
        $data['inclusions'] = "• Round-trip transfers\n• Boat cruise\n• Local English-speaking guide\n• Bottled water";
        $data['exclusions'] = "• Paddle-boat supplement (small local fee)\n• Lunch\n• Tips";
        $data['weather_policy'] = "Flooded forest paddle boats are seasonal and may not operate in very dry months; the village cruise still runs year-round.";

        return self::applyCommon($data, $activity);
    }

    public static function tonleSapBirds(array $activity): array
    {
        $data = self::baseTemplate();
        $data['description'] = "As the sun lowers over Tonlé Sap, birds return to roost in the lakeside trees and the water turns gold. This late-afternoon tour combines a gentle boat ride with bird watching, seasonal lotus fields, and a remote village stop. Bring binoculars if you have them; your guide carries a spotting scope and helps identify egrets, herons, kingfishers, and the occasional fish eagle.";
        $data['highlights'] = [
            'Sunset boat ride on Tonlé Sap Lake',
            'Bird watching with guide and spotting scope',
            'Visit a lakeside village',
            'Seasonal lotus fields',
            'Quiet, small-group experience',
        ];
        $data['itinerary_json'] = [
            ['time' => '14:30', 'description' => 'Hotel pickup'],
            ['time' => '15:30', 'description' => 'Board boat at a quiet Tonlé Sap access point'],
            ['time' => '16:00', 'description' => 'Cruise and bird watching near roosting trees'],
            ['time' => '17:30', 'description' => 'Sunset stop and photo break'],
            ['time' => '18:15', 'description' => 'Return to dock and transfer to hotel'],
        ];
        $data['inclusions'] = "• Transfers from Siem Reap\n• Sunset boat cruise\n• Bird guide and spotting scope\n• Bottled water";
        $data['exclusions'] = "• Binoculars (bring your own if possible)\n• Snacks";
        $data['what_to_bring'] = "• Binoculars or zoom camera\n• Light long sleeves for mosquito protection\n• Insect repellent";

        return self::applyCommon($data, $activity);
    }

    public static function photoTour(array $activity): array
    {
        $data = self::baseTemplate();
        $data['description'] = "Designed for photographers of any level, this tour times each stop for the best light and fewest crowds. Your guide is both a temple expert and an experienced shooter who knows where to stand, when to wait, and how to avoid the tour-bus waves. Expect practical tips on composition, exposure, and storytelling as you capture Angkor Wat, Bayon, and hidden corridors in warm golden light.";
        $data['highlights'] = [
            'Golden-hour timing for best light',
            'Photography tips from a local shooter-guide',
            'Sunrise and sunset viewpoints',
            'Small group—maximum 4 guests',
            'Help with phone or camera settings',
        ];
        $data['itinerary_json'] = [
            ['time' => '05:00', 'description' => 'Pickup and sunrise planning briefing'],
            ['time' => '05:30', 'description' => 'Angkor Wat sunrise from the reflection pool'],
            ['time' => '07:30', 'description' => 'Detail shots inside Angkor Wat corridors'],
            ['time' => '09:30', 'description' => 'Bayon faces in soft morning light'],
            ['time' => '11:30', 'description' => 'Ta Prohm roots and shadow play'],
            ['time' => '16:00', 'description' => 'Return for sunset at a quiet viewpoint'],
        ];
        $data['inclusions'] = "• Dedicated photography guide\n• Private transport between locations\n• Water and snacks\n• 1-day Angkor pass";
        $data['exclusions'] = "• Camera equipment (bring your own)\n• Meals";

        return self::applyCommon($data, $activity);
    }

    public static function portraitSession(array $activity): array
    {
        $data = self::baseTemplate();
        $data['description'] = "Create a once-in-a-lifetime portrait set among thousand-year-old stone corridors, carved doorways, and dappled jungle light. A local photographer-guide scouts quiet corners of the temples, helps with poses, and edits a curated selection of images for you to download. Perfect for couples, solo travelers, or families who want more than selfies from their Angkor visit.";
        $data['highlights'] = [
            'Private portrait shoot in ancient ruins',
            'Photographer helps with poses and locations',
            'Multiple backdrops in one session',
            'Edited digital photos delivered within 48 hours',
            'Ideal for couples and solo travelers',
        ];
        $data['itinerary_json'] = [
            ['time' => '06:30', 'description' => 'Meet at a quiet temple entrance'],
            ['time' => '07:00', 'description' => 'Soft-light session in corridors and doorways'],
            ['time' => '09:00', 'description' => 'Change location for variety of backdrops'],
            ['time' => '10:30', 'description' => 'Wrap session and review favorite shots'],
        ];
        $data['inclusions'] = "• Professional photographer-guide\n• 45+ edited digital photos\n• Online gallery delivery within 48 hours\n• Basic retouching";
        $data['exclusions'] = "• Temple pass\n• Hair, makeup, or costume rental\n• Printed products";

        return self::applyCommon($data, $activity);
    }

    public static function multiDay(array $activity): array
    {
        $data = self::baseTemplate();
        $data['description'] = "Go deeper than a day trip. This multi-day itinerary balances iconic temples with off-the-beaten-track ruins, countryside rides, village meals, and sunset moments you cannot squeeze into a single tour. Accommodation, transport, and most meals are handled, leaving you free to focus on the history, landscapes, and warm Khmer hospitality. Your guide adjusts the pace to the group and the weather.";
        $data['highlights'] = [
            'Multiple days to explore Angkor and beyond',
            'Mix of temples, villages, and countryside',
            'Most meals and accommodation included',
            'Private guide and vehicle throughout',
            'Flexible daily schedule',
        ];
        $data['itinerary_json'] = [
            ['time' => 'Day 1', 'description' => 'Sunrise at Angkor Wat, Angkor Thom, Bayon, and Ta Prohm'],
            ['time' => 'Day 2', 'description' => 'Banteay Srei, Kbal Spean or countryside cycling, floating village sunset'],
            ['time' => 'Day 3', 'description' => 'Roluos group temples, local market visit, and departure'],
        ];
        $data['inclusions'] = "• Accommodation for the duration\n• All breakfasts and selected lunches/dinners\n• Private vehicle and driver\n• Licensed guide\n• Temple passes";
        $data['exclusions'] = "• International flights\n• Travel insurance\n• Personal expenses and optional tips";
        $data['what_to_bring'] = "• Comfortable clothing for warm days and cool mornings\n• Daypack\n• Insect repellent\n• Camera";

        return self::applyCommon($data, $activity);
    }
}
