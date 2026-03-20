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
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; username?: string; password?: string; passwordConfirm?: string }>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setFieldErrors({});

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

    const errs: { email?: string; username?: string; password?: string; passwordConfirm?: string } = {};
    if (!email) errs.email = "メールアドレスを入力してください";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "有効なメールアドレスを入力してください";
    if (!username) errs.username = "ユーザー名を入力してください";
    else if (username.length < 3) errs.username = "ユーザー名は3文字以上で入力してください";
    if (!password) errs.password = "パスワードを入力してください";
    else if (password.length < 8) errs.password = "パスワードは8文字以上で入力してください";
    if (password !== passwordConfirm) errs.passwordConfirm = "パスワードが一致しません";

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setIsSubmitting(true);
    const result = await register({ email, username, password });

    if (!result.ok) {
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("登録が完了しました。メールを確認してアカウント認証を行ってください。");
    form?.reset();
    setIsSubmitting(false);
  };

  return (
    <main className="login-shell auth-dark">
      <section className="login-card" aria-labelledby="register-title">
        <p className="login-kicker">アカウント作成</p>
        <h1 id="register-title">メールアドレスで登録</h1>
        <p className="login-subtitle">
          登録完了後に確認メールをお送りします。
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email && <div id="email-error" role="alert" style={{ color: "#ff8f8f", marginTop: 6 }}>{fieldErrors.email}</div>}

          <label htmlFor="username">ユーザー名</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="your-name"
            minLength={3}
            maxLength={24}
            aria-invalid={fieldErrors.username ? true : undefined}
            aria-describedby={fieldErrors.username ? "username-error" : undefined}
          />
          {fieldErrors.username && <div id="username-error" role="alert" style={{ color: "#ff8f8f", marginTop: 6 }}>{fieldErrors.username}</div>}

          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="8〜32文字"
            minLength={8}
            maxLength={32}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
          />
          {fieldErrors.password && <div id="password-error" role="alert" style={{ color: "#ff8f8f", marginTop: 6 }}>{fieldErrors.password}</div>}

          <label htmlFor="passwordConfirm">パスワード（確認）</label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            placeholder="パスワードを再入力"
            minLength={8}
            maxLength={32}
            aria-invalid={fieldErrors.passwordConfirm ? true : undefined}
            aria-describedby={fieldErrors.passwordConfirm ? "passwordConfirm-error" : undefined}
          />
          {fieldErrors.passwordConfirm && <div id="passwordConfirm-error" role="alert" style={{ color: "#ff8f8f", marginTop: 6 }}>{fieldErrors.passwordConfirm}</div>}

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