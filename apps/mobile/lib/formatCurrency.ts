const RATES: Record<string, number> = {
  USD: 1,
  KHR: 4100,
};

export function formatPrice(
  amountUsd: string | number,
  currency: 'USD' | 'KHR' = 'USD',
  locale = 'en-US'
): string {
  const numeric = typeof amountUsd === 'string' ? parseFloat(amountUsd) : amountUsd;

  if (Number.isNaN(numeric)) {
    return currency === 'USD' ? '$0.00' : '៛0';
  }

  if (currency === 'KHR') {
    const khr = Math.round(numeric * RATES.KHR);
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'KHR',
      maximumFractionDigits: 0,
    }).format(khr);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).format(numeric);
}
