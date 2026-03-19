"use client";
import { isMobileUA } from "@/lib/device";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { register } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(isMobileUA());
    const handleResize = () => setIsMobile(isMobileUA());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    // Save form reference because the synthetic event may be released after awaits
    const form = event.currentTarget as HTMLFormElement | null;
    const formData = new FormData(form ?? undefined);
    const email = String(formData.get("email") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

    if (password !== passwordConfirm) {
      setErrorMessage("パスワードが一致しません。");
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
      "登録が完了しました。メールを確認してアカウント認証を行ってください。",
    );
    form?.reset();
    setIsSubmitting(false);
  };

  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="register-title">
        <p className="login-kicker">アカウント作成</p>
        <h1 id="register-title">メールアドレスで登録</h1>
        <p className="login-subtitle">
          登録完了後に確認メールをお送りします。
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />

          <label htmlFor="username">ユーザー名</label>
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

          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="8〜32文字"
            minLength={8}
            maxLength={32}
            required
          />

          <label htmlFor="passwordConfirm">パスワード（確認）</label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            placeholder="パスワードを再入力"
            minLength={8}
            maxLength={32}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "登録中..." : "アカウントを作成"}
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
          すでにアカウントをお持ちの方は{" "}
          <Link href="/auth/login" className="text-link">
            サインインへ
          </Link>
        </p>
      </section>
    </main>
  );
}