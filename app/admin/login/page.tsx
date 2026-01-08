"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth-client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    posthog.capture("admin_login_attempted", {
      method: "google",
    });

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/admin",
      });
    } catch (err) {
      posthog.capture("admin_login_failed", {
        method: "google",
        reason: "google_auth_error",
      });
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    posthog.capture("admin_login_attempted", {
      email: email,
      method: "email",
    });

    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email,
        password,
      });

      if (signInError) {
        posthog.capture("admin_login_failed", {
          email: email,
          method: "email",
          reason: signInError.message || "invalid_credentials",
        });
        setError(
          signInError.message || "Invalid credentials. Please try again."
        );
        setIsLoading(false);
        return;
      }

      if (data) {
        posthog.identify(email, {
          email: email,
          role: "admin",
        });
        posthog.capture("admin_login_success", {
          email: email,
          method: "email",
        });
        router.push("/admin");
      }
    } catch (err) {
      posthog.capture("admin_login_failed", {
        email: email,
        method: "email",
        reason: "unknown_error",
      });
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-black dark:text-white uppercase">
            AWURABA
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 font-light tracking-wide">
            Admin Dashboard Access
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white rounded-lg py-4 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-3"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-black px-4 text-neutral-500">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  placeholder="admin@awuraba.co"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-black dark:bg-white text-white dark:text-black rounded-lg py-4 text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-center text-xs text-neutral-500 dark:text-neutral-600">
            &copy; {new Date().getFullYear()} AWURABA Collective. All rights
            reserved.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
