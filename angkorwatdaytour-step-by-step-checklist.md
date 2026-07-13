# AngkorWatDayTour.com — Step-by-Step Build Checklist

A condensed, ordered checklist version of the full build plan. Check off each step as you complete it.

| Step | What To Do | Phase / Week | Finished? |
|---|---|---|---|
| 1 | Set up Laravel 11 backend project, configure `.env`, MySQL 8, Redis | Phase 1 (Wk 1–2) | ☐ |
| 2 | Install Sanctum (auth), Spatie Permission (roles), configure CORS for frontend | Phase 1 (Wk 1–2) | ☐ |
| 3 | Set up Expo SDK 54 mobile app project — Expo Router, NativeWind, EAS build config | Phase 1 (Wk 1–2) | ☐ |
| 4 | Set up React 18 + Vite projects for Vendor Dashboard and Admin Dashboard | Phase 1 (Wk 1–2) | ☐ |
| 5 | Set up slim marketing/SEO website (Next.js or WordPress) | Phase 1 (Wk 1–2) | ☐ |
| 6 | Configure Zustand + TanStack Query, Cloudflare R2 storage, Gmail API OAuth, Git repo + CI | Phase 1 (Wk 1–2) | ☐ |
| 7 | Write all database migrations (~24 tables) and Eloquent models with relationships | Phase 2 (Wk 2–3) | ☑ |
| 8 | Seed database (categories, cities, demo activities) and build test factories | Phase 2 (Wk 2–3) | ☑ |
| 9 | Build auth API — register/login/logout, Google OAuth, email verification, password reset, role middleware | Phase 3 (Wk 3–4) | ☑ |
| 10 | Build Expo Login/Register/Forgot Password screens + secure token storage | Phase 3 (Wk 3–4) | ☑ |
| 11 | Build public browsing API — activities (with filters), activity detail, categories, cities | Phase 4 (Wk 4–6) | ☑ |
| 12 | Build Expo Home, Search Results, Category, Activity Detail, Provider Profile screens | Phase 4 (Wk 4–6) | ☑ |
| 13 | Add multi-currency (USD/KHR) toggle and language (EN/KM) toggle | Phase 4 (Wk 4–6) | ☑ |
| 14 | Build marketing/SEO website pages — homepage, category/tour landing pages, blog, static/legal pages | Phase 4 (Wk 4–6) | ☑ |
| 15 | Build availability check + create-booking API with Redis slot locking (prevent overbooking) | Phase 5 (Wk 6–8) | ☑ |
| 16 | Build Expo booking flow (date/time, travelers, add-ons) and checkout screen | Phase 5 (Wk 6–8) | ☑ |
| 17 | Integrate Bakong KHQR payment (QR generation + confirmation polling/webhook) | Phase 5 (Wk 6–8) | ☐ |
| 18 | Integrate Visa/Mastercard via Stripe or ABA PayWay | Phase 5 (Wk 6–8) | ☐ |
| 19 | Build payment webhook handlers, e-ticket (QR) generation, booking confirmation screen/email | Phase 5 (Wk 6–8) | ☑ |
| 20 | Implement cancellation & refund logic per your policy rules | Phase 5 (Wk 6–8) | ☐ |
| 21 | Build reviews (with photo upload), wishlist/favorites, and customer↔provider messaging | Phase 6 (Wk 8–9) | ☐ |
| 22 | Build AI chat support widget (OpenAI gpt-4o-mini) with human escalation | Phase 6 (Wk 8–9) | ☐ |
| 23 | Build provider onboarding wizard (business info, ID verification, bank details) | Phase 7 (Wk 9–11) | ☐ |
| 24 | Build Vendor Dashboard — earnings, listings CRUD, availability calendar, bookings, payouts, promotions, settings | Phase 7 (Wk 9–11) | ☐ |
| 25 | Build Admin Dashboard core — overview, user/provider/listing/booking management | Phase 8 (Wk 11–13) | ☐ |
| 26 | Build Admin Dashboard extras — payments/payouts, reviews moderation, CMS, categories/cities, reports, settings | Phase 8 (Wk 11–13) | ☐ |
| 27 | Implement SEO — meta tags/structured data, sitemap, image optimization pipeline, App Store/Play Store listing SEO | Phase 9 (Wk 13–14) | ☐ |
| 28 | Run QA — end-to-end tests (Playwright), load-test slot locking, security pass (rate limiting, webhook signatures) | Phase 10 (Wk 14–16) | ☐ |
| 29 | Set up production infrastructure (hosting, queue workers, backups) | Phase 10 (Wk 14–16) | ☐ |
| 30 | Soft launch with a few real providers before public marketing push | Phase 10 (Wk 14–16) | ☐ |

**Total: 30 steps, ~16 weeks (~4 months) for one experienced full-stack developer**, add 1–2 weeks buffer for App Store/Play Store review before public launch.

---

*Condensed from the full 74-item detailed plan — see the original document for exact API endpoints, screen-by-screen detail, and the full database schema.*
