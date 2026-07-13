<?php

use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\Auth\GoogleOAuthController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\ResetPasswordController;
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
