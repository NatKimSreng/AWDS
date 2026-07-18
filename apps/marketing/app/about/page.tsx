import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About AngkorWatDayTour — Local Tours in Siem Reap",
  description:
    "AngkorWatDayTour connects travelers with verified local guides, drivers, and photographers in Siem Reap.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1 bg-sand-bg">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-stone-charcoal">About Us</h1>
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 space-y-4 text-stone-gray">
            <p>
              AngkorWatDayTour is a marketplace that connects visitors to Siem Reap with verified local providers — from tuk-tuk drivers and private taxis to expert temple guides and photographers.
            </p>
            <p>
              Our mission is to make it easy for travelers to discover, compare, and book authentic Cambodian experiences while helping local providers grow their businesses.
            </p>
            <p>
              Every listing is reviewed, every booking is confirmed instantly, and every payment is handled securely through the AngkorWatDayTour app.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
