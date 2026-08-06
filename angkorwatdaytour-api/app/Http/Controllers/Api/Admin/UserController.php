<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function show(Request $request, User $user): JsonResponse
    {
        $user->loadMissing(['role', 'bookings.activity']);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role?->only(['id', 'name', 'label']),
                'email_verified_at' => $user->email_verified_at?->toISOString(),
                'created_at' => $user->created_at?->toISOString(),
                'avatar_url' => $user->avatar_url,
                'language_pref' => $user->language_pref,
                'date_of_birth' => $user->date_of_birth?->toISOString(),
                'country' => $user->country,
                'nationality' => $user->nationality,
                'address' => $user->address,
                'bio' => $user->bio,
                'recent_bookings' => $user->bookings()
                    ->with('activity:id,title,slug')
                    ->orderByDesc('created_at')
                    ->limit(5)
                    ->get()
                    ->map(fn (Booking $booking) => [
                        'id' => $booking->id,
                        'booking_ref' => $booking->booking_ref,
                        'status' => $booking->status,
                        'total_price' => $booking->total_price,
                        'currency' => $booking->currency,
                        'activity' => $booking->activity?->only(['id', 'title', 'slug']),
                        'created_at' => $booking->created_at?->toISOString(),
                    ])
                    ->values(),
            ],
        ]);
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', Rule::in(['customer', 'provider', 'admin'])],
        ]);

        $role = Role::where('name', $validated['role'])->firstOrFail();
        $user->update(['role_id' => $role->id]);

        return response()->json([
            'message' => 'User role updated.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role->only(['id', 'name', 'label']),
                'email_verified_at' => $user->email_verified_at?->toISOString(),
                'created_at' => $user->created_at?->toISOString(),
            ],
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()?->id === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['nullable', Rule::in(['customer', 'provider', 'admin'])],
            'query' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = User::query()
            ->with('role')
            ->orderByDesc('created_at');

        if (! empty($validated['role'])) {
            $roleId = Role::where('name', $validated['role'])->firstOrFail()->id;
            $query->where('role_id', $roleId);
        }

        if (! empty($validated['query'])) {
            $term = $validated['query'];
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            });
        }

        return response()->json(
            $query->paginate((int) ($validated['per_page'] ?? 20))
                ->through(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role?->only(['id', 'name', 'label']),
                    'email_verified_at' => $user->email_verified_at?->toISOString(),
                    'created_at' => $user->created_at?->toISOString(),
                ])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'role' => ['required', Rule::in(['customer', 'provider', 'admin'])],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $role = Role::where('name', $validated['role'])->firstOrFail();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role_id' => $role->id,
            'password' => Hash::make($validated['password']),
        ]);

        $user->load('role');

        return response()->json([
            'message' => 'User created successfully.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role?->only(['id', 'name', 'label']),
                'email_verified_at' => $user->email_verified_at?->toISOString(),
                'created_at' => $user->created_at?->toISOString(),
            ],
        ], 201);
    }
}
