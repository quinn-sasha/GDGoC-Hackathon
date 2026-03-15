"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { register } from "@/lib/auth-client";

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

    if (password !== passwordConfirm) {
      setErrorMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    const result = await register({ email, username, password });

    if (!result.ok) {
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage(
      "Registration complete. Please check your email and verify your account.",
    );
    event.currentTarget.reset();
    setIsSubmitting(false);
  };

  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="register-title">
        <p className="login-kicker">Create Account</p>
        <h1 id="register-title">Register with your email</h1>
        <p className="login-subtitle">
          We will send a verification email after successful registration.
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

          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="your-name"
            minLength={3}
            maxLength={24}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="8 to 32 characters"
            minLength={8}
            maxLength={32}
            required
          />

          <label htmlFor="passwordConfirm">Confirm Password</label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            minLength={8}
            maxLength={32}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create account"}
          </button>
        </form>

        {errorMessage ? (
          <p className="login-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="login-success" role="status">
            {successMessage}
          </p>
        ) : null}

        <p className="signup-note">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-link">
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}