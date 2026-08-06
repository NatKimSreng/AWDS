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
use App\Http\Controllers\Api\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\ListingController as AdminListingController;
use App\Http\Controllers\Api\Admin\ProviderController as AdminProviderController;
use App\Http\Controllers\Api\Admin\PayoutController as AdminPayoutController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\MessageThreadController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProviderOnboardingController;
use App\Http\Controllers\Api\Public\ActivityController as PublicActivityController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\Public\AvailabilityController as PublicAvailabilityController;
use App\Http\Controllers\Api\Public\BookingController as PublicBookingController;
use App\Http\Controllers\Api\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\Public\CityController as PublicCityController;
use App\Http\Controllers\Api\Public\ExchangeRateController;
use App\Http\Controllers\Api\Public\PaymentController as PublicPaymentController;
use App\Http\Controllers\Api\Public\ProviderController as PublicProviderController;
use App\Http\Controllers\Api\Public\SearchController;
use App\Http\Controllers\Api\Public\ServiceTypeController as PublicServiceTypeController;
use App\Http\Controllers\Api\Public\TransportModeController as PublicTransportModeController;
use App\Http\Controllers\Api\Vendor\BookingController as VendorBookingController;
use App\Http\Controllers\Api\Vendor\DashboardController as VendorDashboardController;
use App\Http\Controllers\Api\Vendor\EarningController as VendorEarningController;
use App\Http\Controllers\Api\Vendor\ListingController as VendorListingController;
use App\Http\Controllers\Api\Vendor\SettingController as VendorSettingController;
use App\Http\Controllers\Api\Vendor\TimeSlotController as VendorTimeSlotController;
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

    Route::get('/profile', [UserProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile', [UserProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [UserProfileController::class, 'uploadAvatar'])->name('profile.avatar.upload');

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

Route::middleware(['auth:sanctum', 'role:provider', 'approved_provider'])->prefix('vendor')->group(function () {
    Route::get('/dashboard', [VendorDashboardController::class, 'index'])->name('vendor.dashboard');

    Route::get('/listings', [VendorListingController::class, 'index'])->name('vendor.listings.index');
    Route::post('/listings', [VendorListingController::class, 'store'])->name('vendor.listings.store');
    Route::get('/listings/{listing}', [VendorListingController::class, 'show'])->whereNumber('listing')->name('vendor.listings.show');
    Route::put('/listings/{listing}', [VendorListingController::class, 'update'])->whereNumber('listing')->name('vendor.listings.update');
    Route::delete('/listings/{listing}', [VendorListingController::class, 'destroy'])->whereNumber('listing')->name('vendor.listings.destroy');

    Route::get('/listings/{listing}/slots', [VendorTimeSlotController::class, 'index'])->whereNumber('listing')->name('vendor.listings.slots.index');
    Route::post('/listings/{listing}/slots', [VendorTimeSlotController::class, 'store'])->whereNumber('listing')->name('vendor.listings.slots.store');
    Route::post('/listings/{listing}/slots/bulk', [VendorTimeSlotController::class, 'bulkStore'])->whereNumber('listing')->name('vendor.listings.slots.bulk');
    Route::put('/listings/{listing}/slots/{slot}', [VendorTimeSlotController::class, 'update'])->whereNumber('listing')->whereNumber('slot')->name('vendor.listings.slots.update');
    Route::delete('/listings/{listing}/slots/{slot}', [VendorTimeSlotController::class, 'destroy'])->whereNumber('listing')->whereNumber('slot')->name('vendor.listings.slots.destroy');

    Route::get('/bookings', [VendorBookingController::class, 'index'])->name('vendor.bookings.index');
    Route::get('/bookings/{booking}', [VendorBookingController::class, 'show'])->whereNumber('booking')->name('vendor.bookings.show');
    Route::post('/bookings/{booking}/status', [VendorBookingController::class, 'updateStatus'])->whereNumber('booking')->name('vendor.bookings.status');

    Route::get('/earnings', [VendorEarningController::class, 'index'])->name('vendor.earnings.index');
    Route::get('/payouts', [VendorEarningController::class, 'payouts'])->name('vendor.payouts.index');

    Route::get('/settings', [VendorSettingController::class, 'show'])->name('vendor.settings.show');
    Route::put('/settings', [VendorSettingController::class, 'update'])->name('vendor.settings.update');
    Route::put('/settings/payout', [VendorSettingController::class, 'updatePayout'])->name('vendor.settings.payout.update');
});

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    Route::get('/providers', [AdminProviderController::class, 'index'])->name('admin.providers.index');
    Route::get('/providers/{provider}', [AdminProviderController::class, 'show'])->whereNumber('provider')->name('admin.providers.show');
    Route::post('/providers/{provider}/approve', [AdminProviderController::class, 'approve'])->whereNumber('provider')->name('admin.providers.approve');
    Route::post('/providers/{provider}/reject', [AdminProviderController::class, 'reject'])->whereNumber('provider')->name('admin.providers.reject');
    Route::post('/providers/{provider}/toggle-featured', [AdminProviderController::class, 'toggleFeatured'])->whereNumber('provider')->name('admin.providers.toggle-featured');

    Route::get('/listings', [AdminListingController::class, 'index'])->name('admin.listings.index');
    Route::get('/listings/{listing}', [AdminListingController::class, 'show'])->whereNumber('listing')->name('admin.listings.show');
    Route::post('/listings/{listing}/status', [AdminListingController::class, 'updateStatus'])->whereNumber('listing')->name('admin.listings.status');
    Route::post('/listings/{listing}/toggle-featured', [AdminListingController::class, 'toggleFeatured'])->whereNumber('listing')->name('admin.listings.toggle-featured');
    Route::delete('/listings/{listing}', [AdminListingController::class, 'destroy'])->whereNumber('listing')->name('admin.listings.destroy');

    Route::get('/bookings', [AdminBookingController::class, 'index'])->name('admin.bookings.index');
    Route::get('/bookings/{booking}', [AdminBookingController::class, 'show'])->whereNumber('booking')->name('admin.bookings.show');
    Route::post('/bookings/{booking}/status', [AdminBookingController::class, 'updateStatus'])->whereNumber('booking')->name('admin.bookings.status');

    Route::get('/payouts', [AdminPayoutController::class, 'index'])->name('admin.payouts.index');
    Route::post('/payouts', [AdminPayoutController::class, 'store'])->name('admin.payouts.store');
    Route::post('/payouts/{payout}/mark-paid', [AdminPayoutController::class, 'markPaid'])->whereNumber('payout')->name('admin.payouts.mark-paid');

    Route::get('/users', [AdminUserController::class, 'index'])->name('admin.users.index');
    Route::post('/users', [AdminUserController::class, 'store'])->name('admin.users.store');
    Route::get('/users/{user}', [AdminUserController::class, 'show'])->whereNumber('user')->name('admin.users.show');
    Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole'])->whereNumber('user')->name('admin.users.role');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->whereNumber('user')->name('admin.users.destroy');
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

    Route::get('/service-types', [PublicServiceTypeController::class, 'index'])->name('public.service-types.index');
    Route::get('/service-types/{slug}', [PublicServiceTypeController::class, 'show'])->name('public.service-types.show');

    Route::get('/transport-modes', [PublicTransportModeController::class, 'index'])->name('public.transport-modes.index');
    Route::get('/transport-modes/{slug}', [PublicTransportModeController::class, 'show'])->name('public.transport-modes.show');

    Route::get('/cities', [PublicCityController::class, 'index'])->name('public.cities.index');
    Route::get('/cities/{slug}', [PublicCityController::class, 'show'])->name('public.cities.show');

    Route::get('/providers', [PublicProviderController::class, 'index'])->name('public.providers.index');
    Route::get('/providers/{provider}', [PublicProviderController::class, 'show'])
        ->name('public.providers.show');

    Route::get('/search', [SearchController::class, 'index'])->name('public.search');

    Route::get('/settings', [SettingsController::class, 'index'])->name('public.settings');
    Route::post('/exchange/convert', [ExchangeRateController::class, 'convert'])->name('public.exchange.convert');

    Route::get('/activities/{slug}/reviews', [ReviewController::class, 'publicForActivity'])
        ->name('public.activities.reviews');

    Route::post('/bookings', [PublicBookingController::class, 'store'])->name('public.bookings.store');
    Route::get('/bookings/{booking_ref}', [PublicBookingController::class, 'show'])->name('public.bookings.show');
    Route::post('/bookings/{booking_ref}/ticket', [PublicBookingController::class, 'ticket'])->name('public.bookings.ticket');
    Route::post('/bookings/{booking_ref}/send-confirmation-email', [PublicBookingController::class, 'sendConfirmationEmail'])
        ->name('public.bookings.confirmation-email.send');
    Route::post('/bookings/{booking_ref}/payments/khqr', [PublicBookingController::class, 'khqr'])
        ->name('public.payments.khqr.generate');

    Route::get('/payments/{payment}/khqr-status', [PublicPaymentController::class, 'khqrStatus'])
        ->name('public.payments.khqr.status');
});
