import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Siem Reap Travel Guide — AngkorWatDayTour Blog",
  description:
    "Travel tips, temple guides, and local insights for visiting Angkor Wat and Siem Reap.",
};

const posts = [
  {
    slug: "angkor-wat-sunrise-guide",
    title: "The Complete Angkor Wat Sunrise Guide",
    excerpt:
      "Where to stand, what time to leave, and how to avoid the crowds at Angkor Wat sunrise.",
    date: "2026-07-01",
  },
  {
    slug: "best-tuktuk-tours-siem-reap",
    title: "Best TukTuk Tours in Siem Reap",
    excerpt:
      "A local guide to hiring a tuk-tuk driver for temple hopping, countryside trips, and night tours.",
    date: "2026-06-20",
  },
  {
    slug: "what-to-pack-for-angkor-wat",
    title: "What to Pack for a Day at Angkor Wat",
    excerpt:
      "Sunscreen, water, dress code, and the small items that make a big difference.",
    date: "2026-06-10",
  },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col flex-1">
      <header className="bg-card-white border-b border-stone-gray/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-angkor-orange font-heading"
          >
            AngkorWatDayTour
          </Link>
          <nav className="hidden md:flex gap-6 text-sm text-stone-gray">
            <Link href="/tours" className="hover:text-angkor-orange">
              Tours
            </Link>
            <Link href="/blog" className="text-angkor-orange font-medium">
              Travel Guide
            </Link>
            <Link href="/become-a-provider" className="hover:text-angkor-orange">
              Become a Provider
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-sand-bg py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Siem Reap Travel Guide
          </h1>
          <p className="text-stone-gray mb-10">
            Tips, temple guides, and local insights for your Angkor adventure.
          </p>

          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-card-white rounded-xl p-6 shadow-sm"
              >
                <time className="text-xs text-stone-gray">{post.date}</time>
                <h2 className="text-xl font-semibold mt-1 mb-2 hover:text-angkor-orange transition">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-stone-gray">{post.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-card-white border-t border-stone-gray/10 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-gray">
          <span>© {new Date().getFullYear()} AngkorWatDayTour.com</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-angkor-orange">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-angkor-orange">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
