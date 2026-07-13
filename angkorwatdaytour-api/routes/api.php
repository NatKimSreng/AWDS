<?php

use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\Auth\GoogleOAuthController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\ResetPasswordController;
use App\Http\Controllers\Api\BookingCancellationController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\MessageThreadController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProviderOnboardingController;
use App\Http\Controllers\Api\Public\ActivityController as PublicActivityController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\Public\AvailabilityController as PublicAvailabilityController;
use App\Http\Controllers\Api\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\Public\CityController as PublicCityController;
use App\Http\Controllers\Api\Public\ExchangeRateController;
use App\Http\Controllers\Api\Public\ProviderController as PublicProviderController;
use App\Http\Controllers\Api\Public\SearchController;
use App\Http\Controllers\Api\Public\SettingsController;
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

    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');

    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');

    Route::get('/bookings/{booking}', [BookingController::class, 'show'])
        ->whereNumber('booking')
        ->name('bookings.show');

    Route::get('/bookings/{booking}/cancellation-preview', [BookingCancellationController::class, 'preview'])
        ->whereNumber('booking')
        ->name('bookings.cancellation.preview');

    Route::post('/bookings/{booking}/cancel', [BookingCancellationController::class, 'cancel'])
        ->whereNumber('booking')
        ->name('bookings.cancellation.cancel');

    Route::post('/bookings/{booking}/payments/khqr', [PaymentController::class, 'khqr'])
        ->whereNumber('booking')
        ->name('payments.khqr.generate');

    Route::get('/payments/{payment}/khqr-status', [PaymentController::class, 'khqrStatus'])
        ->whereNumber('payment')
        ->name('payments.khqr.status');

    Route::get('/bookings/{booking}/ticket', [TicketController::class, 'show'])
        ->whereNumber('booking')
        ->name('bookings.ticket.show');

    Route::post('/bookings/{booking}/send-confirmation-email', [TicketController::class, 'sendConfirmationEmail'])
        ->whereNumber('booking')
        ->name('bookings.confirmation-email.send');

    Route::get('/bookings/{booking}/reviews/eligibility', [ReviewController::class, 'eligibility'])
        ->whereNumber('booking')
        ->name('bookings.reviews.eligibility');

    Route::post('/bookings/{booking}/reviews', [ReviewController::class, 'store'])
        ->whereNumber('booking')
        ->name('bookings.reviews.store');

    Route::get('/favorites', [FavoriteController::class, 'index'])->name('favorites.index');
    Route::post('/favorites', [FavoriteController::class, 'toggle'])->name('favorites.toggle');
    Route::get('/activities/{activity}/favorite', [FavoriteController::class, 'status'])
        ->whereNumber('activity')
        ->name('favorites.status');

    Route::get('/message-threads', [MessageThreadController::class, 'index'])->name('message-threads.index');
    Route::post('/bookings/{booking}/message-threads', [MessageThreadController::class, 'store'])
        ->whereNumber('booking')
        ->name('message-threads.store');
    Route::get('/message-threads/{thread}', [MessageThreadController::class, 'show'])
        ->whereNumber('thread')
        ->name('message-threads.show');
    Route::post('/message-threads/{thread}/messages', [MessageThreadController::class, 'sendMessage'])
        ->whereNumber('thread')
        ->name('message-threads.messages.store');
    Route::put('/message-threads/{thread}/messages/{message}/read', [MessageThreadController::class, 'markRead'])
        ->whereNumber('thread')
        ->whereNumber('message')
        ->name('message-threads.messages.read');

    Route::post('/ai/chat', [AiChatController::class, 'chat'])->name('ai.chat');
    Route::get('/ai/conversations', [AiChatController::class, 'index'])->name('ai.conversations.index');
    Route::get('/ai/conversations/{conversation}', [AiChatController::class, 'show'])
        ->whereNumber('conversation')
        ->name('ai.conversations.show');
    Route::post('/ai/conversations/{conversation}/escalate', [AiChatController::class, 'escalate'])
        ->whereNumber('conversation')
        ->name('ai.conversations.escalate');

    Route::get('/provider/onboarding', [ProviderOnboardingController::class, 'show'])->name('provider.onboarding.show');
    Route::post('/provider/onboarding/business', [ProviderOnboardingController::class, 'saveBusiness'])->name('provider.onboarding.business');
    Route::post('/provider/onboarding/documents', [ProviderOnboardingController::class, 'saveDocuments'])->name('provider.onboarding.documents');
    Route::post('/provider/onboarding/payout', [ProviderOnboardingController::class, 'savePayout'])->name('provider.onboarding.payout');
    Route::post('/provider/onboarding/submit', [ProviderOnboardingController::class, 'submit'])->name('provider.onboarding.submit');
});

Route::post('/payments/khqr/webhook', [PaymentController::class, 'khqrWebhook'])
    ->name('payments.khqr.webhook');

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
    Route::get('/activities/{slug}/availability', [PublicAvailabilityController::class, 'show'])->name('public.activities.availability');

    Route::get('/categories', [PublicCategoryController::class, 'index'])->name('public.categories.index');
    Route::get('/categories/{slug}', [PublicCategoryController::class, 'show'])->name('public.categories.show');

    Route::get('/cities', [PublicCityController::class, 'index'])->name('public.cities.index');
    Route::get('/cities/{slug}', [PublicCityController::class, 'show'])->name('public.cities.show');

    Route::get('/providers/{provider}', [PublicProviderController::class, 'show'])
        ->whereNumber('provider')
        ->name('public.providers.show');

    Route::get('/search', [SearchController::class, 'index'])->name('public.search');

    Route::get('/settings', [SettingsController::class, 'index'])->name('public.settings');
    Route::post('/exchange/convert', [ExchangeRateController::class, 'convert'])->name('public.exchange.convert');

    Route::get('/activities/{slug}/reviews', [ReviewController::class, 'publicForActivity'])
        ->name('public.activities.reviews');
});
