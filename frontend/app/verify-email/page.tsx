
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

    const formData = new FormData(event.currentTarget);
    const token = String(formData.get("token") ?? "").trim();

    const result = await verifyEmail({ token });

    if (!result.ok) {
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("メール認証が完了しました。ホームへ移動します...");
    setTimeout(() => {
      router.push("/home");
    }, 700);
    setIsSubmitting(false);
  };

  // ナビバー共通
  const NavBar = isMobile ? (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        background: "#1a1a1a",
        borderTop: "1px solid #2a2a2a",
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0 calc(10px + env(safe-area-inset-bottom))",
        zIndex: 100,
      }}
    >
      <button style={{ background: "none", border: "none", color: "#fff", font: "inherit", fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push("/home")}>ホーム</button>
      <button style={{ background: "none", border: "none", color: "#fff", font: "inherit", fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push("/chat")}>チャット</button>
      <button style={{ background: "none", border: "none", color: "#fff", font: "inherit", fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push("/profile/me")}>プロフィール</button>
    </nav>
  ) : null;

  return (
    <main className="login-shell">
      {NavBar}
      <section className="login-card" aria-labelledby="verify-title">
        <p className="login-kicker">メール認証</p>
        <h1 id="verify-title">メールアドレスを認証する</h1>
        <p className="login-subtitle">
          認証トークンを入力するか、メールのリンクからこのページを開いてください。
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
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
