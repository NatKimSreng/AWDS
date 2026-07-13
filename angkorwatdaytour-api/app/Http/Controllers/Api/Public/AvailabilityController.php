<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function show(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
        ]);

        $activity = Activity::query()
            ->where('slug', $slug)
            ->live()
            ->firstOrFail();

        $query = $activity->timeSlots()
            ->where('is_blackout', false)
            ->where('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->orderBy('start_time');

        if (! empty($validated['date'])) {
            $query->where('date', $validated['date']);
        } elseif (! empty($validated['date_from']) && ! empty($validated['date_to'])) {
            $query->whereBetween('date', [$validated['date_from'], $validated['date_to']]);
        } else {
            $query->where('date', '<=', now()->addDays(30)->toDateString());
        }

        $slots = $query->get();

        $dates = $slots->groupBy(fn ($slot) => $slot->date->toDateString())
            ->map(fn ($group) => [
                'date' => $group->first()->date->toDateString(),
                'slots' => $group->map(fn ($slot) => [
                    'id' => $slot->id,
                    'start_time' => $slot->start_time->format('H:i'),
                    'end_time' => $slot->end_time?->format('H:i'),
                    'capacity' => $slot->capacity,
                    'booked_count' => $slot->booked_count,
                    'remaining' => max(0, $slot->capacity - $slot->booked_count),
                    'price_override' => $slot->price_override,
                ])->values(),
            ])->values();

        return response()->json([
            'data' => [
                'activity' => [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'slug' => $activity->slug,
                    'min_group' => $activity->min_group,
                    'max_group' => $activity->max_group,
                    'duration_minutes' => $activity->duration_minutes,
                    'base_price_usd' => $activity->base_price_usd,
                ],
                'dates' => $dates,
            ],
        ]);
    }
}
