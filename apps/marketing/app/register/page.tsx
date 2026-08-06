"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { register } from "@/lib/authApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Mail, Lock, Eye, EyeOff, Loader2, Phone } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        password_confirmation: passwordConfirmation,
      });
      router.push(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-sand-bg">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gyg-border shadow-card p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gyg-navy mb-2">Create account</h1>
          <p className="text-sm text-gyg-muted mb-6">
            Save tours, track bookings, and book faster next time.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium text-gyg-text">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text placeholder:text-gyg-muted focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gyg-text">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text placeholder:text-gyg-muted focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="phone" className="text-sm font-medium text-gyg-text">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+855 12 345 678"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text placeholder:text-gyg-muted focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gyg-text">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text placeholder:text-gyg-muted focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gyg-muted hover:text-gyg-text"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password_confirmation" className="text-sm font-medium text-gyg-text">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
                <input
                  id="password_confirmation"
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gyg-border bg-gyg-bg text-gyg-text placeholder:text-gyg-muted focus:bg-white focus:border-gyg-navy focus:ring-2 focus:ring-gyg-navy/10 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gyg-navy hover:bg-black text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create account
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gyg-border text-center text-sm text-gyg-muted">
            Already have an account?{" "}
            <Link
              href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
              className="text-gyg-navy font-semibold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-sand-bg">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-md h-[500px] bg-gray-100 rounded-2xl animate-pulse" />
          </main>
          <Footer />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
