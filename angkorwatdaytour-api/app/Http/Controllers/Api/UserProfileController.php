<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class UserProfileController extends Controller
{
    public function __construct(
        private readonly ImageUploadService $imageUploadService
    ) {
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url,
                'language_pref' => $user->language_pref,
                'role' => $user->role?->name,
                'date_of_birth' => $user->date_of_birth?->toDateString(),
                'country' => $user->country,
                'nationality' => $user->nationality,
                'address' => $user->address,
                'bio' => $user->bio,
                'emergency_contact_name' => $user->emergency_contact_name,
                'emergency_contact_phone' => $user->emergency_contact_phone,
                'created_at' => $user->created_at?->toIso8601String(),
                'stats' => $this->getUserStats($user),
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'language_pref' => ['sometimes', 'nullable', 'string', 'size:2'],
            'avatar_url' => ['sometimes', 'nullable', 'string', 'url', 'max:2048'],
            'date_of_birth' => ['sometimes', 'nullable', 'date', 'before_or_equal:today'],
            'country' => ['sometimes', 'nullable', 'string', 'max:100'],
            'nationality' => ['sometimes', 'nullable', 'string', 'max:100'],
            'address' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:500'],
            'emergency_contact_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['sometimes', 'nullable', 'string', 'max:30'],
        ]);

        $user->update($validated);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url,
                'language_pref' => $user->language_pref,
                'role' => $user->role?->name,
                'date_of_birth' => $user->date_of_birth?->toDateString(),
                'country' => $user->country,
                'nationality' => $user->nationality,
                'address' => $user->address,
                'bio' => $user->bio,
                'emergency_contact_name' => $user->emergency_contact_name,
                'emergency_contact_phone' => $user->emergency_contact_phone,
                'created_at' => $user->created_at?->toIso8601String(),
                'stats' => $this->getUserStats($user),
            ],
        ]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $user = $request->user();
        $file = $request->file('avatar');

        $avatarUrl = $this->imageUploadService->store($file, 'avatars');
        $user->update(['avatar_url' => $avatarUrl]);

        return response()->json([
            'message' => 'Avatar updated successfully.',
            'data' => [
                'avatar_url' => $avatarUrl,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function getUserStats($user): array
    {
        $today = Carbon::today();

        return [
            'total_bookings' => $user->bookings()->count(),
            'upcoming_bookings' => $user->bookings()
                ->where('status', 'confirmed')
                ->whereDate('booking_date', '>=', $today)
                ->count(),
            'completed_bookings' => $user->bookings()
                ->where('status', 'completed')
                ->count(),
            'favorites_count' => $user->favorites()->count(),
            'unread_messages_count' => \App\Models\Message::query()
                ->whereHas('thread', fn ($q) => $q->where('customer_id', $user->id))
                ->where('recipient_id', $user->id)
                ->where('recipient_type', 'user')
                ->whereNull('read_at')
                ->count(),
        ];
    }
}
