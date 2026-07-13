<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;

class GoogleOAuthController extends Controller
{
    /**
     * Redirect the user to Google's OAuth consent screen.
     */
    public function redirect(Request $request): RedirectResponse
    {
        if ($request->has('device')) {
            session(['oauth_device' => $request->input('device')]);
        }

        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Handle the Google OAuth callback and issue a token.
     */
    public function callback(Request $request): JsonResponse
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::where('email', $googleUser->getEmail())->first();

        if (! $user) {
            $customerRole = Role::where('name', Role::CUSTOMER)->firstOrFail();

            $user = User::create([
                'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'Google User',
                'email' => $googleUser->getEmail(),
                'email_verified_at' => now(),
                'password' => Hash::make(Str::random(32)),
                'role_id' => $customerRole->id,
                'avatar_url' => $googleUser->getAvatar(),
                'language_pref' => $request->input('language_pref', 'en'),
            ]);
        }

        $device = session('oauth_device', 'mobile-app');
        $token = $user->createToken($device)->plainTextToken;

        return response()->json([
            'user' => $user->load('role'),
            'token' => $token,
        ]);
    }
}
