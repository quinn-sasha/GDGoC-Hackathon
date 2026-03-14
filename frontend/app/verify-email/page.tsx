"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const defaultToken = searchParams.get("token") ?? "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    const token = String(formData.get("token") ?? "").trim();

    const result = await verifyEmail({ token });

    if (!result.ok) {
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("Email verified. Redirecting to dashboard...");
    setTimeout(() => {
      router.push("/dashboard");
    }, 700);
    setIsSubmitting(false);
  };

  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="verify-title">
        <p className="login-kicker">Verification</p>
        <h1 id="verify-title">Verify your email</h1>
        <p className="login-subtitle">
          Paste your verification token or open this page from your email link.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="token">Verification token</label>
          <input
            id="token"
            name="token"
            type="text"
            placeholder="token"
            defaultValue={defaultToken}
            minLength={6}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify email"}
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
          Need to register first?{" "}
          <Link href="/register" className="text-link">
            Go to register
          </Link>
        </p>
      </section>
    </main>
  );
}
