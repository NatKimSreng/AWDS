"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/authApi";
import { useAuthStore } from "@/stores/authStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const trimmedEmail = email.trim();

    try {
      await login(trimmedEmail, password);
      router.push(returnTo);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      console.error("[Login] failed:", { email: trimmedEmail, error: message, err });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-sand-bg">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gyg-border shadow-card p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gyg-navy mb-2">Sign in</h1>
          <p className="text-sm text-gyg-muted mb-6">
            to save your favorite tours and manage your bookings
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
              {error}
              <div className="mt-1 text-xs text-red-500">
                Check browser console (F12 → Console) for debug details.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label htmlFor="password" className="text-sm font-medium text-gyg-text">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gyg-muted" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gyg-text cursor-pointer">
                <input type="checkbox" className="rounded border-gyg-border text-gyg-navy focus:ring-gyg-navy" />
                Keep me signed in
              </label>
              <Link href="/contact" className="text-gyg-navy font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gyg-navy hover:bg-black text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gyg-border text-center text-sm text-gyg-muted">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register?returnTo=${encodeURIComponent(returnTo)}`}
              className="text-gyg-navy font-semibold hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-sand-bg">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-md h-96 bg-gray-100 rounded-2xl animate-pulse" />
          </main>
          <Footer />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
