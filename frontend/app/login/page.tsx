"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      remember: formData.get("remember") === "on",
    };

    try {
      const result = await login(payload);

      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      router.push("/dashboard");
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="login-title">
        <p className="login-kicker">Welcome Back</p>
        <h1 id="login-title">Sign in to your account</h1>
        <p className="login-subtitle">
          Continue with your email and password to access the dashboard.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            minLength={8}
            maxLength={32}
            title="Password must be 8 to 32 characters"
            required
          />

          <div className="login-row">
            <label className="remember-wrap" htmlFor="remember">
              <input id="remember" name="remember" type="checkbox" />
              Remember me
            </label>
            <Link href="/verify-email" className="text-link">
              Verify email
            </Link>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {errorMessage ? (
          <p className="login-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <p className="signup-note">
          New here?{" "}
          <Link href="/register" className="text-link">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
