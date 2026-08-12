"use client";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { useState } from "react";
import { useModal } from "@/components/common/ModalProvider";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const modal = useModal();

  async function handleLogin() {
    setBusy(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!userCredential.user.emailVerified) {
        await modal.info(
          "Please verify your email first.",
          "Email not verified"
        );
        return;
      }

      router.push("/home");
    } catch (error: any) {
      await modal.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="mt-10"
      onSubmit={(event) => {
        event.preventDefault();
        handleLogin();
      }}
    >
      <div>
        <label className="field-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          suppressHydrationWarning
          className="input"
        />
      </div>

      <div className="mt-4">
        <label className="field-label" htmlFor="login-password">
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            suppressHydrationWarning
            className="input pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            suppressHydrationWarning
            className="muted absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium hover:text-[var(--text)]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={busy}
        suppressHydrationWarning
        className="btn btn-primary btn-block mt-6"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <p className="muted mt-6 text-center text-[14px]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-[var(--text)] underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
