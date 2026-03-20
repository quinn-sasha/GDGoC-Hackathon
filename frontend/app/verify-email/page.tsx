"use client";
import { isMobileUA } from "@/lib/device";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { verifyEmail } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(isMobileUA());
    const handleResize = () => setIsMobile(isMobileUA());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [defaultToken, setDefaultToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const params = new URLSearchParams(window.location.search);
    return params.get("token") ?? "";
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const token = String(formData.get("token") ?? "").trim();

    const errs: { token?: string } = {};
    if (!token) errs.token = "認証トークンを入力してください";
    else if (token.length < 6) errs.token = "トークンは6文字以上で入力してください";
    if (Object.keys(errs).length > 0) {
      setErrorMessage(errs.token ?? "入力エラーがあります");
      setIsSubmitting(false);
      return;
    }

    const result = await verifyEmail({ token });

    if (!result.ok) {
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }
    // 保存されたトークンがあればストレージに格納する
    try {
      if ((result as any).access) {
        // 永続化の要否は既定で localStorage にする
        localStorage.setItem("access_token", (result as any).access);
        if ((result as any).refresh) localStorage.setItem("refresh_token", (result as any).refresh);
      }
    } catch {
      // 無視: 環境によっては storage が利用不可
    }

    setSuccessMessage("メール認証が完了しました。ホームへ移動します...");
    setTimeout(() => {
      router.push("/home");
    }, 700);
    setIsSubmitting(false);
  };

  return (
    <main className="login-shell auth-dark">
      <section className="login-card" aria-labelledby="verify-title">
        <p className="login-kicker">メール認証</p>
        <h1 id="verify-title">メールアドレスを認証する</h1>
        <p className="login-subtitle">
          認証トークンを入力するか、メールのリンクからこのページを開いてください。
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="token">認証トークン</label>
          <input
            id="token"
            name="token"
            type="text"
            placeholder="トークンを入力"
            value={defaultToken}
            onChange={(event) => setDefaultToken(event.target.value)}
            minLength={6}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "認証中..." : "メールを認証する"}
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
          アカウントをお持ちでない方は{" "}
          <Link href="/auth/register" className="text-link">
            新規登録
          </Link>
        </p>
      </section>
    </main>
  );
}
