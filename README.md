# AngkorWatDayTour.com

Tour booking marketplace for Siem Reap — tuktuks, taxis, guides, photographers.

## Monorepo Structure

```
angkorwatdaytour-api/   # Laravel 11 API (Sanctum, MySQL 8, Redis)
apps/
  mobile/               # Expo SDK 54 customer app (React Native)
  web-vendor/           # React 18 + Vite vendor dashboard
  web-admin/            # React 18 + Vite admin dashboard
  marketing/            # Slim Next.js marketing/SEO website
docs/                   # Architecture, API, and design docs
```

## Quick Start

1. **Backend API**
   ```bash
   cd angkorwatdaytour-api
   cp .env.example .env
   composer install
   php artisan migrate
   php artisan serve
   ```

2. **Mobile / Dashboards / Marketing** — see individual app READMEs.

## Stack

- Backend: Laravel 11, PHP 8.3, MySQL 8, Redis
- Mobile: React Native + Expo SDK 54, Expo Router, NativeWind
- Dashboards: React 18 + Vite, Tailwind CSS, Zustand, TanStack Query
- Marketing: Next.js (or WordPress)
- Storage: Cloudflare R2 + CDN
- Payments: Bakong KHQR + Visa/Mastercard (Stripe / ABA PayWay)
- Email: Gmail API via OAuth 2.0
- AI: OpenAI `gpt-4o-mini`

## Design System

- Primary: `#C8530A` (Angkor Orange)
- Headings: Playfair Display
- Body: Inter
- Khmer fallback: Noto Sans Khmer

## License

Private — AngkorWatDayTour.com
