<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\Language;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $currencies = Currency::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['code', 'label', 'symbol', 'exchange_rate_to_usd', 'is_default']);

        $languages = Language::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['code', 'label', 'native_label']);

        $defaultCurrency = $currencies->firstWhere('is_default', true)?->code ?? 'USD';
        $defaultLanguage = config('app.locale', 'en');

        return response()->json([
            'data' => [
                'currencies' => $currencies,
                'languages' => $languages,
                'defaults' => [
                    'currency' => $defaultCurrency,
                    'language' => $defaultLanguage,
                ],
            ],
        ]);
    }
}
