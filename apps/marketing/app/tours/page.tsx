import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchActivities } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TourResultsClient from "@/components/TourResultsClient";
import TourFilters from "@/components/TourFilters";
import FilterSidebar from "@/components/FilterSidebar";
import SearchBar from "@/components/SearchBar";
import FilterChips from "@/components/FilterChips";
import SectionHeading from "@/components/SectionHeading";
import { FadeIn } from "@/components/MotionWrapper";
import { X } from "lucide-react";

export const metadata: Metadata = {
  title: "Tours & Activities in Cambodia — AngkorWatDayTour",
  description:
    "Browse sunrise Angkor Wat tours, local guides, transport, photography, and multi-day experiences in Cambodia.",
};

import type { Activity } from "@/lib/types";

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const categorySlug = typeof params.category === "string" ? params.category : "";
  const citySlug = typeof params.city === "string" ? params.city : "";
  const serviceTypeSlug = typeof params.service_type === "string" ? params.service_type : "";
  const transportModeSlug = typeof params.transport_mode === "string" ? params.transport_mode : "";
  const sort = typeof params.sort === "string" ? params.sort : "";
  const duration = typeof params.duration === "string" ? params.duration : "";
  const minPrice = typeof params.min_price === "string" ? params.min_price : "";
  const maxPrice = typeof params.max_price === "string" ? params.max_price : "";
  const instantBook = params.instant_book === "1" ? "1" : "";
  const date = typeof params.date === "string" ? params.date : "";
  const participants = typeof params.participants === "string" ? params.participants : "";

  const apiParams: Record<string, string> = { per_page: "24" };
  if (query) apiParams.query = query;
  if (categorySlug) apiParams.category = categorySlug;
  if (citySlug) apiParams.city = citySlug;
  if (serviceTypeSlug) apiParams.service_type = serviceTypeSlug;
  if (transportModeSlug) apiParams.transport_mode = transportModeSlug;
  if (sort) apiParams.sort = sort;
  if (duration) apiParams.duration = duration;
  if (minPrice) apiParams.min_price = minPrice;
  if (maxPrice) apiParams.max_price = maxPrice;
  if (instantBook) apiParams.instant_book = instantBook;
  if (date) apiParams.date = date;
  if (participants) apiParams.group_size = participants;

  const activities = (await fetchActivities(apiParams)) as Activity[];

  const hasFilters = query || date || participants || serviceTypeSlug || transportModeSlug;
  const activeFilterChips = [
    query ? { label: `Search: ${query}`, href: "/tours" } : null,
    date ? { label: `Date: ${date}`, href: "/tours" } : null,
    participants ? { label: `${participants} participant${participants === "1" ? "" : "s"}`, href: "/tours" } : null,
    serviceTypeSlug ? { label: `Service: ${serviceTypeSlug.replace(/-/g, " ")}`, href: "/tours" } : null,
    transportModeSlug ? { label: `Transport: ${transportModeSlug.replace(/-/g, " ")}`, href: "/tours" } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  const heading = query
    ? `Results for "${query}"`
    : citySlug
      ? `Tours in ${citySlug.replace(/-/g, " ")}`
      : categorySlug
        ? `${categorySlug.replace(/-/g, " ")} tours`
        : serviceTypeSlug
          ? `${serviceTypeSlug.replace(/-/g, " ")} services`
          : transportModeSlug
            ? `Tours by ${transportModeSlug.replace(/-/g, " ")}`
            : "Tours & activities";
  const subtitle = query ? "" : "Most popular things to do in Cambodia";

  return (
    <div className="flex flex-col flex-1 bg-sand-bg">
      <Header />

      <section className="bg-white border-b border-gyg-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <Suspense fallback={<div className="h-14 bg-gray-100 rounded-full animate-pulse" />}>
            <SearchBar initialQuery={query} />
          </Suspense>
          <Suspense fallback={<div className="h-10 bg-gray-100 rounded-full animate-pulse" />}>
            <FilterChips />
          </Suspense>
        </div>
      </section>

      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 w-full">
        <FadeIn>
          <FilterSidebar filterContent={<TourFilters variant="sidebar" />}>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="text-sm text-gyg-muted">
                  {activities.length} {activities.length === 1 ? "result" : "results"}
                  {query ? ` for "${query}"` : ""}
                </div>
                <div className="lg:hidden">
                  <TourFilters />
                </div>
              </div>

              {hasFilters && activeFilterChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  {activeFilterChips.map((chip) => (
                    <Link
                      key={chip.label}
                      href={chip.href}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gyg-navy text-white text-xs font-medium hover:bg-black transition"
                    >
                      {chip.label}
                      <X className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              )}

              <SectionHeading title={heading} subtitle={subtitle} />

              <TourResultsClient
                activities={activities}
                heading={heading}
                subtitle={subtitle}
              />
            </div>
          </FilterSidebar>
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
