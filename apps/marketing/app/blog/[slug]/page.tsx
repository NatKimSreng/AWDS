import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const posts: Record<string, { title: string; date: string; content: string }> = {
  "angkor-wat-sunrise-guide": {
    title: "The Complete Angkor Wat Sunrise Guide",
    date: "2026-07-01",
    content: `
Watching the sun rise behind Angkor Wat is one of Southeast Asia's most iconic experiences. To get the best view, plan to arrive at the temple complex by 5:00 AM, especially during the busy season from November to February.

Bring a flashlight, water, and a fully charged phone or camera. The west-facing reflection pools near the main causeway offer the classic mirror image of the towers. After sunrise, head straight into the central sanctuary before the tour buses arrive.
    `,
  },
  "best-tuktuk-tours-siem-reap": {
    title: "Best TukTuk Tours in Siem Reap",
    date: "2026-06-20",
    content: `
Tuk-tuks are the most flexible and fun way to explore the Angkor Archaeological Park. A full-day small-circuit tour typically covers Angkor Wat, Angkor Thom, Ta Prohm, and Banteay Kdei. For a quieter day, ask your driver about the Grand Circuit or countryside routes to remote temples and floating villages.

Always agree on the route and price upfront, and confirm whether the quoted fare includes temple parking passes and petrol.
    `,
  },
  "what-to-pack-for-angkor-wat": {
    title: "What to Pack for a Day at Angkor Wat",
    date: "2026-06-10",
    content: `
Dress modestly: shoulders and knees must be covered to enter the upper levels of Angkor Wat. Lightweight, breathable clothing, a wide-brimmed hat, and comfortable walking shoes are essential.

Carry at least two liters of water, sunscreen, insect repellent, and a small towel. Cash is useful for drinks, snacks, and temple passes.
    `,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];

  return {
    title: post ? `${post.title} — AngkorWatDayTour` : "Post — AngkorWatDayTour",
    description: post?.content?.slice(0, 155) ?? "Travel guide article from AngkorWatDayTour.",
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    notFound();
  }

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
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-sand-bg py-12">
        <article className="max-w-3xl mx-auto px-6">
          <Link
            href="/blog"
            className="text-sm text-stone-gray hover:text-angkor-orange mb-4 inline-block"
          >
            ← Back to travel guide
          </Link>
          <time className="text-sm text-stone-gray">{post.date}</time>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-6">{post.title}</h1>
          <div className="bg-card-white rounded-xl p-6 md:p-8 shadow-sm">
            <p className="text-stone-gray leading-relaxed whitespace-pre-line">
              {post.content.trim()}
            </p>
          </div>
        </article>
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
