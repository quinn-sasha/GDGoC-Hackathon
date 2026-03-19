"use client";
import { isMobileUA } from "@/lib/device";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { login } from "@/lib/auth-client";

export default function LoginPage() {
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

      // Store tokens if returned (localStorage/sessionStorage)
      // Use a safe access pattern to avoid TypeScript compile issues in build.
      const accessToken = (result as any)?.access as string | undefined;
      const refreshToken = (result as any)?.refresh as string | undefined;
      if (accessToken) {
        try {
          if (payload.remember) {
            localStorage.setItem("access_token", accessToken);
            if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
          } else {
            sessionStorage.setItem("access_token", accessToken);
            if (refreshToken) sessionStorage.setItem("refresh_token", refreshToken);
          }
        } catch {
          /* ignore storage errors in restricted environments */
        }
      }

      router.push("/home");
    } catch {
      setErrorMessage("通信エラーが発生しました。時間をおいて再試行してください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="login-title">
        <h1
          id="login-title"
          style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        >
          アカウントにサインイン
        </h1>

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

          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="パスワードを入力"
            minLength={8}
            maxLength={32}
            title="パスワードは8〜32文字で入力してください"
            required
          />

          <div className="login-row">
            <label className="remember-wrap" htmlFor="remember">
              <input id="remember" name="remember" type="checkbox" />
              ログイン状態を保持する
            </label>
            <Link href="/verify-email" className="text-link">
              メール認証
            </Link>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "サインイン中..." : "サインイン"}
          </button>
        </form>

        {errorMessage ? (
          <p className="login-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <p className="signup-note">
          アカウントをお持ちでない方は{" "}
          <Link href="/auth/register" className="text-link">
            新規登録
          </Link>
        </p>
      </section>
    </main>
  );
}