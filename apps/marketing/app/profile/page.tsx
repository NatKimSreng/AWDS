"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore, type User as AuthUser } from "@/stores/authStore";
import { fetchProfile, updateProfile, uploadAvatar, fetchMyBookings, logout } from "@/lib/authApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionHeading from "@/components/SectionHeading";
import { Loader2, User, Mail, Phone, CalendarDays, LogOut, Save, ChevronRight, Camera, MapPin, Globe, FileText, Heart, Ticket, MessageSquare, Briefcase } from "lucide-react";

interface BookingSummary {
  id: number;
  booking_ref: string;
  status: string;
  total_price: string;
  currency: string;
  traveler_count: number;
  created_at: string;
  activity: { id: number; title: string; slug: string; hero_image?: string | null } | null;
  time_slot: { date: string; start_time: string } | null;
}

interface FormState {
  name: string;
  phone: string;
  date_of_birth: string;
  country: string;
  nationality: string;
  address: string;
  bio: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

function initialForm(profile: AuthUser | null): FormState {
  return {
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    date_of_birth: profile?.date_of_birth ?? "",
    country: profile?.country ?? "",
    nationality: profile?.nationality ?? "",
    address: profile?.address ?? "",
    bio: profile?.bio ?? "",
    emergency_contact_name: profile?.emergency_contact_name ?? "",
    emergency_contact_phone: profile?.emergency_contact_phone ?? "",
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<FormState>(initialForm(null));
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(`/login?returnTo=${encodeURIComponent("/profile")}`);
      return;
    }

    setIsLoading(true);
    Promise.all([
      fetchProfile().then((p) => {
        setProfile(p);
        setForm(initialForm(p));
      }),
      fetchMyBookings().then(setBookings),
    ])
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, router]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    const payload: Record<string, string | null | undefined> = {};
    (Object.keys(form) as Array<keyof FormState>).forEach((key) => {
      const value = form[key].trim();
      const current = profile?.[key] ?? "";
      if (value !== current.toString()) {
        payload[key] = value || null;
      }
    });

    try {
      const updated = await updateProfile(payload);
      setProfile(updated);
      setForm(initialForm(updated));
      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");
    try {
      await uploadAvatar(file);
      const refreshed = await fetchProfile();
      setProfile(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Avatar upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogout = async () => {
    await logout();
    clearAuth();
    router.push("/");
  };

  const displayUser = profile || user;
  const stats = profile?.stats;

  const statItems = [
    { icon: Ticket, value: stats?.total_bookings ?? 0, label: "Bookings" },
    { icon: Briefcase, value: stats?.upcoming_bookings ?? 0, label: "Upcoming" },
    { icon: Heart, value: stats?.favorites_count ?? 0, label: "Favorites" },
    { icon: MessageSquare, value: stats?.unread_messages_count ?? 0, label: "Unread" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-sand-bg">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        <SectionHeading title="Your profile" subtitle="Manage your account, traveler details, and bookings" />

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gyg-navy" />
          </div>
        )}

        {!isLoading && displayUser && (
          <div className="mt-6 grid lg:grid-cols-3 gap-6">
            {/* Left column: profile card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-gyg-border p-6 shadow-card">
                <div className="flex flex-col items-center text-center mb-6">
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    className="relative w-24 h-24 rounded-full overflow-hidden mb-3 focus:outline-none focus:ring-2 focus:ring-gyg-navy/20 disabled:opacity-60"
                  >
                    {displayUser.avatar_url ? (
                      <img
                        src={displayUser.avatar_url}
                        alt={displayUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gyg-navy text-white flex items-center justify-center text-3xl font-bold">
                        {displayUser.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <h2 className="text-lg font-bold text-gyg-text">{displayUser.name}</h2>
                  <p className="text-sm text-gyg-muted">{displayUser.email}</p>
                  {displayUser.bio && (
                    <p className="text-sm text-gyg-text mt-2 leading-relaxed">{displayUser.bio}</p>
                  )}
                </div>

                {stats && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {statItems.map((item) => (
                      <div
                        key={item.label}
                        className="bg-gyg-bg rounded-xl p-3 text-center"
                      >
                        <item.icon className="w-4 h-4 text-gyg-navy mx-auto mb-1" />
                        <div className="text-lg font-bold text-gyg-text">{item.value}</div>
                        <div className="text-xs text-gyg-muted">{item.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gyg-text">
                    <Mail className="w-4 h-4 text-gyg-muted" />
                    {displayUser.email}
                  </div>
                  <div className="flex items-center gap-3 text-gyg-text">
                    <Phone className="w-4 h-4 text-gyg-muted" />
                    {displayUser.phone || "No phone added"}
                  </div>
                  {displayUser.country && (
                    <div className="flex items-center gap-3 text-gyg-text">
                      <Globe className="w-4 h-4 text-gyg-muted" />
                      {displayUser.country}
                    </div>
                  )}
                  {displayUser.nationality && (
                    <div className="flex items-center gap-3 text-gyg-text">
                      <MapPin className="w-4 h-4 text-gyg-muted" />
                      {displayUser.nationality}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gyg-text">
                    <CalendarDays className="w-4 h-4 text-gyg-muted" />
                    Member since{" "}
                    {displayUser.created_at
                      ? new Date(displayUser.created_at).toLocaleDateString()
                      : "—"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>

              <div className="bg-gyg-navy rounded-2xl p-6 text-white">
                <h3 className="font-bold mb-2">Become a provider</h3>
                <p className="text-sm text-white/80 mb-4">List your tours and start earning today.</p>
                <Link
                  href="/become-a-provider"
                  className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                >
                  Learn more <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right column: edit + bookings */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gyg-border p-6 shadow-card">
                <h2 className="text-lg font-bold text-gyg-navy mb-4">Edit profile</h2>

                {message && (
                  <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-sm font-medium">{message}</div>
                )}
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">{error}</div>
                )}

                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="name" className="text-sm font-medium text-gyg-text">Full name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
                        <input
                          id="name"
                          type="text"
                          value={form.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="phone" className="text-sm font-medium text-gyg-text">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
                        <input
                          id="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="+855 12 345 678"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text placeholder:text-gyg-muted focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="date_of_birth" className="text-sm font-medium text-gyg-text">Date of birth</label>
                      <input
                        id="date_of_birth"
                        type="date"
                        value={form.date_of_birth}
                        onChange={(e) => updateField("date_of_birth", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="country" className="text-sm font-medium text-gyg-text">Country of residence</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
                        <input
                          id="country"
                          type="text"
                          value={form.country}
                          onChange={(e) => updateField("country", e.target.value)}
                          placeholder="e.g. Cambodia"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text placeholder:text-gyg-muted focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="nationality" className="text-sm font-medium text-gyg-text">Nationality</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
                        <input
                          id="nationality"
                          type="text"
                          value={form.nationality}
                          onChange={(e) => updateField("nationality", e.target.value)}
                          placeholder="e.g. Cambodian"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text placeholder:text-gyg-muted focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="emergency_contact_name" className="text-sm font-medium text-gyg-text">Emergency contact name</label>
                      <input
                        id="emergency_contact_name"
                        type="text"
                        value={form.emergency_contact_name}
                        onChange={(e) => updateField("emergency_contact_name", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="emergency_contact_phone" className="text-sm font-medium text-gyg-text">Emergency contact phone</label>
                      <input
                        id="emergency_contact_phone"
                        type="tel"
                        value={form.emergency_contact_phone}
                        onChange={(e) => updateField("emergency_contact_phone", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="address" className="text-sm font-medium text-gyg-text">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gyg-muted" />
                      <textarea
                        id="address"
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="Street, city, postal code"
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text placeholder:text-gyg-muted focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="bio" className="text-sm font-medium text-gyg-text">Bio</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3.5 w-4 h-4 text-gyg-muted" />
                      <textarea
                        id="bio"
                        value={form.bio}
                        onChange={(e) => updateField("bio", e.target.value)}
                        placeholder="Tell us a little about yourself..."
                        rows={4}
                        maxLength={500}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text placeholder:text-gyg-muted focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition resize-none"
                      />
                    </div>
                    <p className="text-xs text-gyg-muted text-right">{form.bio.length}/500</p>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 bg-gyg-navy hover:bg-black text-white font-semibold px-5 py-2.5 rounded-xl transition disabled:opacity-60"
                    >
                      {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Save className="w-4 h-4" /> Save changes
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-gyg-border p-6 shadow-card">
                <h2 className="text-lg font-bold text-gyg-navy mb-4">Your bookings</h2>
                {bookings.length === 0 ? (
                  <p className="text-gyg-muted text-sm">You don&apos;t have any bookings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <Link
                        key={booking.id}
                        href={`/tours/${booking.activity?.slug || ""}`}
                        className="flex items-center justify-between p-4 rounded-xl border border-gyg-border hover:border-gyg-navy transition"
                      >
                        <div>
                          <div className="font-semibold text-gyg-text text-sm">
                            {booking.activity?.title || "Booking"}
                          </div>
                          <div className="text-xs text-gyg-muted mt-1">
                            {booking.booking_ref} • {booking.status} • {booking.traveler_count} traveler
                            {booking.traveler_count === 1 ? "" : "s"}
                          </div>
                          {booking.time_slot && (
                            <div className="text-xs text-gyg-muted">
                              {booking.time_slot.date} at {booking.time_slot.start_time}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gyg-navy">
                            ${Number(booking.total_price).toFixed(2)}
                          </div>
                          <div className="text-xs text-gyg-muted">{booking.currency}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
