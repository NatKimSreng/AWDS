<?php

namespace App\Helpers;

/**
 * Shared pool of real, verified Cambodia / Southeast Asia Unsplash photo IDs.
 *
 * Used by demo seeders and factories so the mobile/marketing apps show
 * varied, realistic imagery instead of placeholders.
 */
class SeederImageHelper
{
    /**
     * Verified Unsplash travel/activity photo IDs. Every ID returns HTTP 200
     * from images.unsplash.com and fits the AngkorWatDayTour theme.
     */
    private static array $ids = [
        // Angkor / temples
        '1770848125591-2e97455bf21d', // Angkor Wat sunrise
        '1762270753499-e6f87335d754', // Bayon faces
        '1770848126209-465ea630f630', // Ta Prohm roots
        '1770848126000-f05c48f0e143', // Ancient temple ruins
        '1768904532098-7ac5bcee6b65', // Angkor Wat with palm trees
        '1779332843346-e2276af928a7', // Angkor Wat sunset silhouette
        '1741784102268-a0c1f415c31d', // Sunrise over Angkor Wat
        '1760442936485-b26b087c2030', // Angkor Wat sunrise silhouette
        '1599283094403-f60072de2d70', // Bayon Temple at sunset

        // Cities / culture
        '1762091486050-5be11ee3c8d7', // Phnom Penh Royal Palace
        '1700155024603-771638efc72f', // Battambang town
        '1522013311796-41eac8105532', // Monk at Angkor Wat
        '1593009579715-ccb8bed049b5', // Cambodia night market
        '1704419296328-ddac02e71c76', // Siem Reap street by night

        // Nature / landscapes
        '1661487906939-aea1f059b84f', // Kampot river
        '1757756170752-472097c4e565', // Tonlé Sap village
        '1653959864991-c828b72c82a8', // Cambodian sunset
        '1636474333831-6d2aa38cc501', // Cambodia countryside cycling
        '1469854523086-cc02fe5d8800', // Tropical river
        '1507525428034-b723cf961d3e', // Beach / coast
        '1773023785875-9ea8c6717559', // Aerial rice paddies and village
        '1720720583304-ba8d6eed5c4d', // Dirt road through green field
        '1677126138830-ca9d01b53ed5', // Rice field with village

        // Food / experiences
        '1540189549336-e6e99c3679fe', // Fresh tropical fruit
        '1761038060597-b894af0092b4', // Khmer dishes on tablecloth
        '1601697014116-35f1caebe2ca', // Cambodia market scene
        '1516483638261-f4dbaf036963', // Friends exploring
    ];

    /**
     * Verified portrait / people photo IDs suitable for user avatars.
     */
    private static array $peopleIds = [
        '1544005313-94ddf0286df2', // smiling woman
        '1507003211169-0a1dd7228f2d', // man portrait
        '1438761681033-6461ffad8d80', // woman outdoors
        '1500648767791-00dcc994a43e', // man outdoors
        '1494790108377-be9c29b29330', // young woman
        '1506794778202-cad84cf45f1d', // man
        '1534528741775-53994a69daeb', // woman
    ];

    /**
     * Verified document / business photo IDs suitable for provider ID/license uploads.
     */
    private static array $documentIds = [
        '1554224155-6726b3ff858f',    // desk paperwork
        '1450101499163-c8848c66ca85', // pen on paper
        '1589829085413-56de8ae18c73', // legal document
    ];

    /**
     * Return a random Unsplash travel image URL.
     */
    public static function travelImageUrl(int $width, int $height, ?string $id = null): string
    {
        $selectedId = $id ?? self::$ids[array_rand(self::$ids)];

        return "https://images.unsplash.com/photo-{$selectedId}?auto=format&fit=crop&w={$width}&h={$height}&q=80";
    }

    /**
     * Return a random photo ID from the curated travel pool.
     */
    public static function randomId(): string
    {
        return self::$ids[array_rand(self::$ids)];
    }

    /**
     * Return the full curated travel pool of IDs.
     */
    public static function allIds(): array
    {
        return self::$ids;
    }

    /**
     * Return a random portrait image URL.
     */
    public static function peopleImageUrl(int $width, int $height): string
    {
        $id = self::$peopleIds[array_rand(self::$peopleIds)];

        return "https://images.unsplash.com/photo-{$id}?auto=format&fit=crop&w={$width}&h={$height}&q=80";
    }

    /**
     * Return a random document / business image URL.
     */
    public static function documentImageUrl(int $width, int $height): string
    {
        $id = self::$documentIds[array_rand(self::$documentIds)];

        return "https://images.unsplash.com/photo-{$id}?auto=format&fit=crop&w={$width}&h={$height}&q=80";
    }
}
