<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExchangeRateController extends Controller
{
    public function convert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'from' => ['required', 'string', 'size:3', Rule::exists('currencies', 'code')->where('is_active', true)],
            'to' => ['required', 'string', 'size:3', Rule::exists('currencies', 'code')->where('is_active', true)],
        ]);

        $amount = (float) $validated['amount'];
        $fromCode = $validated['from'];
        $toCode = $validated['to'];

        if ($fromCode === $toCode) {
            return response()->json([
                'data' => [
                    'amount' => round($amount, 2),
                    'from' => $fromCode,
                    'to' => $toCode,
                ],
            ]);
        }

        $rates = Currency::query()
            ->whereIn('code', [$fromCode, $toCode])
            ->where('is_active', true)
            ->pluck('exchange_rate_to_usd', 'code');

        $fromRate = (float) ($rates[$fromCode] ?? 1.0);
        $toRate = (float) ($rates[$toCode] ?? 1.0);

        $converted = ($amount / $fromRate) * $toRate;

        return response()->json([
            'data' => [
                'amount' => round($converted, 2),
                'from' => $fromCode,
                'to' => $toCode,
                'rate' => round($toRate / $fromRate, 10),
            ],
        ]);
    }
}
