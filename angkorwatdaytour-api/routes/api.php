<?php

use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\Auth\GoogleOAuthController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\ResetPasswordController;
use App\Http\Controllers\Api\Public\ActivityController as PublicActivityController;
use App\Http\Controllers\Api\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\Public\CityController as PublicCityController;
use App\Http\Controllers\Api\Public\SearchController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are stateless and intended for the Expo mobile app and
| the React dashboard SPAs. Authentication is handled via Sanctum tokens.
|
*/

Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register'])->name('auth.register');
    Route::post('/login', [LoginController::class, 'login'])->name('auth.login');

    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink'])->name('auth.forgot-password');
    Route::post('/reset-password', [ResetPasswordController::class, 'reset'])->name('auth.reset-password');

    Route::get('/verify-email/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['auth:sanctum', 'signed'])
        ->name('verification.verify');
    Route::post('/verify-email/send', [EmailVerificationController::class, 'send'])
        ->middleware(['auth:sanctum'])
        ->name('verification.send');

    Route::get('/oauth/google/redirect', [GoogleOAuthController::class, 'redirect'])->name('auth.oauth.google.redirect');
    Route::get('/oauth/google/callback', [GoogleOAuthController::class, 'callback'])->name('auth.oauth.google.callback');

    Route::post('/logout', [LogoutController::class, 'logout'])
        ->middleware(['auth:sanctum'])
        ->name('auth.logout');
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (\Illuminate\Http\Request $request) {
        return $request->user();
    })->name('user.show');
});

/*
|--------------------------------------------------------------------------
| Role-protected route examples
|--------------------------------------------------------------------------
|
| Use the 'role' middleware alias with one or more role names. These will
| be expanded as real provider/admin routes are added in later steps.
|
*/

Route::middleware(['auth:sanctum', 'role:provider'])->prefix('provider')->group(function () {
    Route::get('/dashboard', fn () => response()->json(['message' => 'Provider dashboard']))->name('provider.dashboard');
});

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', fn () => response()->json(['message' => 'Admin dashboard']))->name('admin.dashboard');
});

/*
|--------------------------------------------------------------------------
| Public browsing routes
|--------------------------------------------------------------------------
|
| Unauthenticated endpoints for the Expo mobile app and marketing website
| to list/search activities, categories, and cities.
|
*/

Route::prefix('public')->group(function () {
    Route::get('/activities', [PublicActivityController::class, 'index'])->name('public.activities.index');
    Route::get('/activities/{slug}', [PublicActivityController::class, 'show'])->name('public.activities.show');

    Route::get('/categories', [PublicCategoryController::class, 'index'])->name('public.categories.index');
    Route::get('/categories/{slug}', [PublicCategoryController::class, 'show'])->name('public.categories.show');

    Route::get('/cities', [PublicCityController::class, 'index'])->name('public.cities.index');
    Route::get('/cities/{slug}', [PublicCityController::class, 'show'])->name('public.cities.show');

    Route::get('/search', [SearchController::class, 'index'])->name('public.search');
});
