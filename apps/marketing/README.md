# AngkorWatDayTour — Marketing / SEO Website

Next.js marketing site for Google discovery and app-store funneling.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- next/font (Google Fonts)

## Getting Started

```bash
cd apps/marketing
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000.

## SEO Checklist

- [ ] Server-rendered meta tags per page
- [ ] Schema.org structured data (TouristAttraction, Product, LocalBusiness)
- [ ] Sitemap + robots.txt
- [ ] Category/tour/blog landing pages
- [ ] Deep-link CTAs to mobile app

## Project Structure

```
app/
  layout.tsx     # Root layout + fonts + global metadata
  page.tsx       # Homepage
  (pages)/       # Category, tour, blog, legal pages
public/
  images, icons
```
