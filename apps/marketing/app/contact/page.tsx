import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact AngkorWatDayTour",
  description: "Get in touch with the AngkorWatDayTour team for support, partnerships, or media inquiries.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col flex-1 bg-sand-bg">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-stone-charcoal">Contact Us</h1>
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 space-y-4 text-stone-gray">
            <p>
              Have a question, partnership idea, or need help with a booking? Reach out to us anytime.
            </p>
            <ul className="space-y-2">
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:hello@angkorwatdaytour.com"
                  className="text-angkor-orange hover:underline"
                >
                  hello@angkorwatdaytour.com
                </a>
              </li>
              <li>
                <strong>Support hours:</strong> 8:00 AM – 8:00 PM (ICT), 7 days a week
              </li>
              <li>
                <strong>Office:</strong> Siem Reap, Cambodia
              </li>
            </ul>
            <p>
              For booking support, you can also use the help section inside the mobile app.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
