# AngkorWatDayTour.com — Full Platform Build Plan
### Tour Booking Marketplace for Siem Reap (Tuktuks, Taxis, Guides, Photographers)

> This plan builds on your existing decisions (Laravel 11, React 18/Vite, MySQL, Redis, Sanctum, Zustand, TanStack Query, Bakong KHQR + Visa, Gmail API, 5% commission, weekly Monday payouts, "Angkor Orange" brand). Where the earlier GetYourGuide-style reference suggested a different stack (Postgres, Meilisearch, Expo mobile, monorepo), I've folded in the *useful ideas* as optional upgrades rather than replacing what you've already committed to — noted clearly below so you can decide.

---

## 0. Assumptions & Decisions Locked In

| Area | Decision | Notes |
|---|---|---|
| Backend | Laravel 11, PHP 8.3 | Sanctum auth, Redis cache/queue |
| Frontend | React 18 + Vite, Tailwind CSS | Zustand (client state) + TanStack Query (server state) |
| Database | MySQL 8 | 14-table core schema (expandable) |
| Search | MySQL full-text → optional Meilisearch later | Start simple, upgrade only if catalog grows past ~500 listings |
| Payments | Bakong KHQR (local) + Visa/Mastercard (Stripe or ABA PayWay) | Dual currency USD/KHR display |
| Images | Start on Cloudflare R2 (cheap, S3-compatible) served via CDN | Don't store on app server |
| Email | Gmail API via OAuth 2.0 | Booking confirmations, provider notifications |
| AI | OpenAI `gpt-4o-mini` | Used for support chat + auto-generating tour descriptions/FAQs |
| Mobile app | **React Native + Expo SDK 54** — primary customer surface | Expo Router, NativeWind, EAS Build for iOS/Android; a lean marketing/SEO web page still needed for Google discovery (see 2.1) |
| Design | "Angkor Orange" `#C8530A`, Playfair Display (headings) + Inter (body) | Editorial, warm, premium tone — not generic SaaS |

The customer-facing product is a **React Native (Expo SDK 54)** app — Appendix C below is no longer "future," it's now folded into the main plan as Phase 4.5. A slim Next.js (or plain static) marketing site still exists in parallel purely for SEO/Google discovery and deep-linking into the app — vendor and admin stay as web dashboards (React SPA), since those are internal tools, not something to build twice.

---

## 1. Design System

### 1.1 Brand Palette

```
--angkor-orange:      #C8530A   (primary — CTAs, active states, accents)
--angkor-orange-dark: #9C4108   (hover/pressed)
--angkor-orange-light:#F3D9C4   (backgrounds, badges)
--stone-charcoal:     #2B2622   (headings, primary text)
--stone-gray:         #6B635C   (secondary text)
--sand-bg:            #FBF7F2   (page background)
--card-white:         #FFFFFF
--success-green:      #2F7D4F
--error-red:          #B3261E
--khmer-gold:         #D4AF37   (rare accent — awards, "featured" ribbons only)
```

### 1.2 Typography

- **Headings:** Playfair Display (serif, 600/700 weight) — evokes temple carving / editorial travel magazine, not startup-generic.
- **Body:** Inter (400/500) — clean, highly legible on mobile.
- **Khmer script support:** Noto Sans Khmer as fallback stack for Khmer-language toggle.
- Scale: `H1 40/48px`, `H2 32/40px`, `H3 24/32px`, `Body 16/24px`, `Small 14/20px`.

### 1.3 Layout Principles

- 12-column grid, max content width **1280px**, generous whitespace (this is a premium travel product, not a discount marketplace).
- Cards use **soft shadows** (`0 4px 16px rgba(43,38,34,0.08)`), **12px radius**, never harsh borders.
- Hero sections use full-bleed photography with a subtle dark gradient overlay (bottom 40%) for text legibility — no stock-photo-orange-filter cliché.
- Sticky booking widget on activity detail pages (desktop: right rail; mobile: bottom sheet).

### 1.4 Tone of Voice

- Warm, knowledgeable local guide — not corporate travel-agency copy.
- Category names in both English and Khmer where relevant (e.g., "Sunrise Angkor Wat Tour / ទស្សនាព្រះអាទិត្យរះ").

---

## 2. Full Feature Scope

### 2.1 Customer Mobile App (React Native / Expo SDK 54)

1. Onboarding carousel (first-launch only) — what the app does, permission primers (location, notifications)
2. Home — hero search bar, featured categories, featured tours carousel, trust badges, "sunrise tours today" style timely rail
3. Search results screen — filters bottom-sheet (price, duration, category, rating, language, group size), map/list toggle
4. Category screens (Temples, Adventure, Food, Photography, Sunrise/Sunset, Multi-day)
5. Activity/tour detail screen — swipeable gallery, itinerary accordion, inclusions/exclusions, meeting-point map (react-native-maps), reviews, FAQ, availability calendar
6. Provider profile screen (tuktuk driver / guide / photographer bio, rating, verified badge)
7. Booking flow — date/time picker → traveler count stepper → add-ons → review
8. Checkout — guest or logged-in, KHQR/Visa payment (in-app WebView for KHQR scan/poll), promo code field
9. Booking confirmation screen + e-ticket with QR code (also emailed)
10. Account tab — booking history, upcoming trips, wishlist, reviews written, profile settings, saved payment methods
11. Login / Register — email+password, Google OAuth (expo-auth-session), phone OTP (optional v1.1)
12. Wishlist/favorites
13. Reviews & ratings (photo upload via expo-image-picker, verified-booking badge)
14. In-app chat support (AI-assisted via OpenAI, escalates to human) — expo push notification on reply
15. Travel Guide tab (lightweight content feed — full blog stays on the marketing site, deep-linked into app)
16. Static/legal screens — About, How it Works, Become a Provider, Terms, Privacy, Cancellation Policy, Help Center/FAQ
17. Multi-currency display (USD primary, KHR secondary) + language toggle (EN/KM, French optional)
18. Push notifications (Expo Push) — booking reminders, review requests, promo alerts
19. Deep linking (Expo Linking) — marketing site and email links open directly to the relevant screen in-app

### 2.1b Marketing/SEO Website (slim, web-only)

Since app stores/deep content aren't crawlable, a small companion website handles Google discovery:

1. Homepage — value prop, App Store/Play Store badges, featured tours (read-only, links to "open in app" or app-store)
2. Category & tour landing pages — SEO content, structured data, "Book on the app" CTA with deep link
3. Blog/Travel Guide — full SEO content hub (reuses your SiemReapLife entity/topic-cluster approach)
4. Become a Provider — lead capture form
5. Legal pages (Terms, Privacy, Cancellation Policy)

This site does **not** need booking/checkout — it exists to rank in search and funnel installs, so it can be a simple Next.js static/SSR site or even a WordPress microsite if you want to reuse Listeo patterns from SiemReapLife.

### 2.2 Provider (Vendor) Dashboard

1. Provider onboarding wizard (business info, ID verification upload, bank/payout details, service area)
2. Dashboard home — earnings summary, upcoming bookings, performance stats
3. Listing management — create/edit tour or service, multi-photo upload, pricing tiers, group discounts
4. Availability & calendar management — blackout dates, recurring schedules, capacity per slot
5. Booking management — accept/decline requests (if not instant-book), booking detail view, customer contact
6. Messaging with customers
7. Reviews received — respond to reviews
8. Earnings & payouts — transaction history, weekly Monday payout schedule, commission breakdown (5%), downloadable statements
9. Promotions — create discount codes, early-bird pricing
10. Documents — license/insurance upload & renewal reminders
11. Account settings — profile, service categories, languages spoken, notification preferences

### 2.3 Admin Dashboard

1. Overview dashboard — GMV, bookings today, active providers, pending approvals, revenue chart
2. User management — customers, ban/suspend, impersonate for support
3. Provider management — approve/reject applications, verification review, suspend providers, commission overrides
4. Listing management — moderate/approve new listings, feature/pin listings, category assignment
5. Booking management — view all bookings, manual refunds/cancellations, dispute resolution
6. Payments — payout queue (approve weekly batch), transaction reconciliation, KHQR/Visa gateway logs
7. Reviews moderation — flagged review queue
8. Categories & taxonomy management
9. Cities/locations management (Siem Reap zones: Wat Bo, Riverside, Pub Street, Kouk Chak, etc. — reuse your SiemReapLife location clusters)
10. CMS — manage blog posts, static pages, homepage featured sections, banners
11. Coupons/promotions management
12. Email/notification template editor
13. Reports & analytics — top providers, top tours, conversion funnel, cancellation rate
14. Support ticket inbox (linked to chat widget escalations)
15. Settings — commission rate, payout schedule, currency exchange rate override, site-wide announcement banner

---

## 3. Database Schema (Expanded Core — ~24 tables)

Building on your condensed 14-table version, here's the expanded shape once you add reviews-with-photos, promotions, and payouts as first-class features:

```
users
  id, name, email, phone, password, role (customer/provider/admin),
  avatar_url, language_pref, email_verified_at, created_at

providers
  id, user_id, business_name, bio, service_area, verification_status,
  id_document_url, avg_rating, total_bookings, commission_rate, created_at

provider_payout_accounts
  id, provider_id, method (bank/wing/aba), account_details_encrypted, created_at

activities  (the "tours"/services)
  id, provider_id, category_id, city_id, title, slug, description,
  itinerary_json, meeting_point_lat, meeting_point_lng, duration_minutes,
  min_group, max_group, base_price_usd, status (draft/pending/live/paused),
  is_featured, created_at

activity_images
  id, activity_id, url, sort_order, alt_text

activity_categories
  id, name, slug, parent_id, icon, description   -- supports your SEO topic clusters

cities  (Siem Reap zones)
  id, name, slug, description, hero_image_url    -- Wat Bo, Riverside, Pub Street, Kouk Chak

time_slots
  id, activity_id, date, start_time, capacity, booked_count, price_override

bookings
  id, booking_ref, user_id, activity_id, time_slot_id, traveler_count,
  status (pending/confirmed/completed/cancelled/refunded), total_price,
  commission_amount, currency, payment_method, created_at

booking_addons
  id, booking_id, name, price, quantity

booking_status_history
  id, booking_id, status, changed_by, note, created_at

payments
  id, booking_id, provider_ref (KHQR/Stripe txn id), amount, currency,
  status, method, paid_at

refunds
  id, payment_id, amount, reason, status, processed_by, created_at

payouts
  id, provider_id, period_start, period_end, gross_amount, commission,
  net_amount, status (pending/paid), paid_at

coupons
  id, code, type (percent/fixed), value, min_spend, usage_limit,
  used_count, expires_at, applies_to_provider_id (nullable)

reviews
  id, booking_id, user_id, activity_id, rating, comment, created_at

review_images
  id, review_id, url

favorites
  id, user_id, activity_id, created_at

messages
  id, thread_id, sender_id, recipient_id, body, read_at, created_at

message_threads
  id, booking_id, customer_id, provider_id

notifications
  id, user_id, type, payload_json, read_at, created_at

blog_posts
  id, author_id, title, slug, body_html, cover_image_url, published_at

support_tickets
  id, user_id, subject, status, ai_handled (bool), escalated_at

languages / currencies  (lookup tables)
  id, code, label
```

---

## 4. Step-by-Step Build Plan

### Phase 1 — Foundations (Week 1–2)

1. Set up Laravel 11 project (`laravel new angkorwatdaytour-api`), configure `.env`, MySQL, Redis
2. Install Sanctum, configure CORS for the React frontend origin
3. Install Spatie Permission for role-based access (customer/provider/admin)
4. Set up Expo SDK 54 project (`npx create-expo-app`) for the customer mobile app; Expo Router for file-based navigation, NativeWind for Tailwind-style styling using the design tokens from Section 1, EAS configured for iOS/Android builds
5. Set up React 18 + Vite projects for Vendor Dashboard and Admin Dashboard (these stay web-only — internal tools don't need to be native), and a slim Next.js (or WordPress) project for the SEO marketing site from 2.1b
6. Configure Zustand store structure (auth, cart/booking-in-progress, UI state) and TanStack Query client
7. Set up Redis for cache + Laravel queue driver
8. Set up Cloudflare R2 bucket + Laravel filesystem disk config for image uploads
9. Set up Gmail API OAuth 2.0 credentials for transactional email sending
10. Set up Git repo structure, CI basics (lint + test on push)

### Phase 2 — Core Data Layer (Week 2–3)

11. Write migrations for all tables in Section 3
12. Build Eloquent models with relationships (Provider hasMany Activities, Activity hasMany TimeSlots, etc.)
13. Seed database with categories, Siem Reap cities/zones, and demo activities for local dev
14. Build factories for testing (bookings, users, providers)

### Phase 3 — Auth & Accounts (Week 3–4)

15. Sanctum-based register/login/logout API endpoints (customer + provider)
16. Google OAuth login (Socialite)
17. Email verification flow (Gmail API sender)
18. Password reset flow
19. Role middleware (customer/provider/admin route protection)
20. Expo: build Login, Register, Forgot Password screens matching design system
21. Expo: auth state persistence (Zustand + expo-secure-store for Sanctum token, since mobile uses token auth rather than SPA cookie auth)

### Phase 4 — Public Browsing Experience (Week 4–6)

22. API: `GET /activities` with filters (category, city, price range, date, rating, language)
23. API: `GET /activities/{slug}` full detail payload
24. API: `GET /categories`, `GET /cities`
25. Expo: Home screen — hero search bar, featured categories grid, featured tours carousel, testimonials, "How it works" strip
26. Expo: Search results screen — filter bottom-sheet, sort control, result cards (FlashList for scroll performance), map toggle (react-native-maps)
27. Expo: Category screens — SEO content mirrored from marketing site data, reuse entity/topic-cluster approach from SiemReapLife
28. Expo: Activity detail screen — image gallery (lightbox modal), sticky floating booking CTA, itinerary accordion, meeting-point map, reviews list, FAQ accordion
29. Expo: Provider profile screen — bio, verified badge, rating breakdown, other listings by same provider
30. Implement multi-currency display toggle (USD/KHR) using a daily exchange-rate cache job (shared endpoint, consumed by app + both dashboards)
31. Implement language toggle (EN/KM) — i18next + react-i18next (works the same in Expo), Noto Sans Khmer bundled as a custom font via `expo-font`
32. Build the slim marketing/SEO website (2.1b) in parallel — homepage, category/tour landing pages, blog, static pages, "Open in App" deep-link buttons, App/Play Store badges

### Phase 5 — Booking & Payments (Week 6–8)

32. API: availability check endpoint (per time slot, remaining capacity)
33. API: create booking (pending status) → reserve slot with short TTL lock (Redis) to prevent overbooking during checkout
34. Expo: booking flow screens — date/time picker, traveler count stepper, add-ons selection, price summary
35. Expo: checkout screen — guest vs logged-in, promo code application, payment method selection
36. Integrate Bakong KHQR — generate QR, display via in-app `WebView`/image, poll or webhook for payment confirmation (Bakong has no native Expo SDK, so QR render + status poll is the standard mobile pattern)
37. Integrate Visa/Mastercard via Stripe React Native SDK or ABA PayWay
38. API: payment webhook handlers → mark booking confirmed → decrement slot capacity → trigger confirmation email
39. Generate e-ticket PDF/QR code (booking reference) — emailed via Gmail API, also viewable/downloadable in-app (expo-print or a rendered QR component)
40. Expo: booking confirmation screen + "My Trips" tab (upcoming/past bookings)
41. Handle booking cancellation + refund logic (policy rules: full refund >48h, partial <48h, etc. — define your cancellation policy explicitly)

### Phase 6 — Reviews, Wishlist, Messaging (Week 8–9)

42. API + Expo: leave a review (only after completed booking), photo upload via `expo-image-picker`
43. API + Expo: wishlist/favorites toggle
44. API + Expo: customer↔provider messaging thread per booking, push notification (Expo Push) on new message
45. AI chat widget: OpenAI `gpt-4o-mini` powered FAQ/support bot with escalation-to-human path into `support_tickets`

### Phase 7 — Vendor Dashboard (Week 9–11)

46. Provider onboarding wizard (multi-step form, document upload, review pending state)
47. Dashboard home — earnings summary widgets, upcoming bookings list
48. Listing CRUD — rich itinerary builder, multi-image upload with drag-reorder, pricing & group-size rules
49. Availability calendar UI (recurring schedule + one-off blackout dates)
50. Booking management table — filters, detail drawer, contact customer
51. Payouts view — transaction history, next payout date/amount, downloadable CSV/PDF statement
52. Promotions — create/manage coupon codes scoped to their own listings
53. Provider notification preferences

### Phase 8 — Admin Dashboard (Week 11–13)

54. Overview dashboard — GMV chart, bookings today, pending provider approvals count
55. Provider approval queue — review documents, approve/reject, set custom commission rate
56. Listing moderation queue — approve/reject/feature
57. Booking oversight — manual refund/cancel tools, dispute flag
58. Payout batch processing — weekly Monday run, approve/export bank file
59. Reviews moderation queue (flagged/reported reviews)
60. CMS — blog post editor (rich text + cover image), static page editor, homepage banner/featured-section manager
61. Category & city management CRUD
62. Reports — top providers, top tours, cancellation rate, conversion funnel (search → view → booking)
63. Settings — global commission rate, exchange rate override, maintenance-mode toggle

### Phase 9 — SEO, Content, Performance (Week 13–14)

64. Marketing site: server-rendered meta tags / OpenGraph per activity & category page — this is now clean since the marketing site is a normal SSR/static web app, not the booking app itself
65. Structured data (schema.org `TouristAttraction`, `Product`, `Review`, `AggregateRating`) on the marketing site — reuse your entity-based SEO framework from SiemReapLife
66. Blog/travel guide section wired into internal linking (three-way linking system, same pattern as SiemReapLife)
67. Image optimization pipeline (WebP conversion, responsive `srcset`) on upload to R2, consumed by both marketing site and app
68. App Store & Google Play listing SEO — screenshots, keywords, preview video (App Store Optimization matters as much as web SEO now)
69. Sitemap generation for the marketing site (activities, categories, cities, blog posts) + deep-link testing (universal links / app links so Google search results and marketing-site CTAs open the app directly when installed)

### Phase 10 — QA, Launch Prep (Week 14–16)

70. End-to-end test critical paths (search → book → pay → confirm) with Playwright
71. Load-test booking slot locking (prevent double-booking race conditions)
72. Security pass — rate limiting, input validation, KHQR/Stripe webhook signature verification
73. Set up production infra (see Section 5)
74. Soft launch with a handful of real providers (tuktuk drivers/guides you already know) before public marketing push

---

## 5. Deployment Architecture

```
   ┌──────────────────┐        ┌──────────────────┐
   │  Expo App (iOS/  │        │  Marketing Site   │
   │  Android) — EAS  │        │  (Next.js, SEO)   │
   │  Build + Updates │        │  + Vendor/Admin   │
   └────────┬─────────┘        │  (React SPA)      │
            │                  └────────┬──────────┘
            │        HTTPS/API           │
            └─────────────┬──────────────┘
                           ▼
                     ┌──────────────────┐
                     │  Laravel 11 API   │
                     │  (Sanctum)        │
                     └───┬─────────┬─────┘
                          │         │
                 ┌────────▼──┐  ┌──▼─────────┐
                 │  MySQL 8   │  │  Redis      │
                 │ (bookings, │  │ (cache,     │
                 │  users...) │  │  queue,     │
                 └────────────┘  │  slot locks)│
                                 └─────────────┘
                          │
                 ┌────────▼──────────┐
                 │ Cloudflare R2 +CDN │
                 │ (images/assets)    │
                 └────────────────────┘
                          │
                 ┌────────▼──────────┐
                 │ Gmail API (email) │
                 │ Bakong KHQR/Stripe │
                 │ OpenAI gpt-4o-mini │
                 └────────────────────┘
```

- **Hosting:** DigitalOcean/Hetzner VPS or Laravel Forge + a managed MySQL instance is enough for v1 — no need for k8s at this scale.
- **Queue workers:** Laravel Horizon for payout batch jobs, email sending, image processing.
- **Backups:** nightly MySQL dump to R2, 30-day retention.
- **Mobile releases:** EAS Build for native binaries submitted to App Store/Play Store; EAS Update for over-the-air JS bundle pushes between store releases (fast-follow bug fixes without a full app review cycle).

---

## 6. Suggested Timeline

| Phase | Duration | Cumulative |
|---|---|---|
| 1–2 Foundations + Data Layer | 3 weeks | Week 3 |
| 3–4 Auth + Public Browsing | 3 weeks | Week 6 |
| 5–6 Booking/Payments + Reviews | 3 weeks | Week 9 |
| 7 Vendor Dashboard | 2 weeks | Week 11 |
| 8 Admin Dashboard | 2 weeks | Week 13 |
| 9 SEO/Performance | 1 week | Week 14 |
| 10 QA + Launch | 2 weeks | **Week 16 (~4 months)** |

This assumes one experienced full-stack developer working solo, reusing patterns you've already built (Sanctum auth, Zustand/TanStack Query setup, R2 image pipeline) rather than starting from zero — considerably faster than the 12–24 month estimate for a full GetYourGuide-scale clone, because you're deliberately scoping to Siem Reap only. Add 1–2 weeks buffer around Week 14–16 for App Store / Play Store review cycles (Apple review can take a few days to a couple of weeks, especially for a first submission with payments involved).

---

## Appendix A — API Endpoint Groups (high-level)

```
/auth/*                register, login, logout, verify-email, forgot-password
/activities             list, detail, availability
/categories, /cities    list
/bookings               create, list (mine), detail, cancel
/payments/khqr          generate-qr, webhook
/payments/stripe        create-intent, webhook
/reviews                create, list-by-activity
/favorites              toggle, list
/messages               thread, send
/provider/*             onboarding, listings CRUD, availability, bookings, payouts, promotions
/admin/*                users, providers, listings, bookings, payouts, reviews, cms, reports, settings
```

## Appendix B — Screen/Page Count Estimate (v1)

| App | Screens/Pages |
|---|---|
| Expo customer app | ~19–22 screens |
| Marketing/SEO website | ~8–12 pages |
| Vendor dashboard (web) | ~14–18 pages |
| Admin dashboard (web) | ~20–26 pages |
| **Total** | **~61–78** |

Far leaner than the 250+ screen GetYourGuide-scale estimate — appropriately scoped for a single-city launch.

## Appendix C — Expo SDK 54 Specifics Worth Locking Down Early

Since SDK 54 is what you're building on, a few version-specific things worth confirming at Phase 1 kickoff rather than discovering mid-build:

- **New Architecture:** SDK 54 has the New Architecture (Fabric/TurboModules) on by default — confirm any third-party libraries you pull in (maps, KHQR WebView, image picker) have New-Arch-compatible releases before committing to them.
- **Expo Router version pinning:** match the Expo Router version to what SDK 54 expects (`npx expo install` rather than manual `npm install` for any Expo-adjacent package, so versions stay compatible).
- **EAS config:** set up `eas.json` build profiles (development/preview/production) at Phase 1, not later — saves rework once native modules (maps, in-app payment WebViews) are added.
- **Push notifications:** Expo Push requires a dev build (not Expo Go) once you add native payment/maps modules — plan for `eas build --profile development` early rather than assuming Expo Go will carry you through the whole build.

---

*This plan reflects your React Native + Expo SDK 54 decision as the primary customer app, keeps your other stack decisions and 5% commission / weekly payout model intact, and adds a slim companion marketing site purely for SEO/app-store discovery since the app itself isn't crawlable by Google.*
