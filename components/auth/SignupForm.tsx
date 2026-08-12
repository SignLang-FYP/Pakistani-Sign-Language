"use client";

import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { useState } from "react";
import { useModal } from "@/components/common/ModalProvider";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const modal = useModal();

  async function handleSignup() {
    if (password !== confirmPassword) {
      await modal.error("Passwords do not match", "Check your password");
      return;
    }

    setBusy(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }

      router.push("/verify-email");
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
        handleSignup();
      }}
    >
      <div>
        <label className="field-label" htmlFor="signup-name">
          Full name
        </label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          suppressHydrationWarning
          className="input"
        />
      </div>

      <div className="mt-4">
        <label className="field-label" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
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
        <label className="field-label" htmlFor="signup-password">
          Password
        </label>
        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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

      <div className="mt-4">
        <label className="field-label" htmlFor="signup-confirm">
          Confirm password
        </label>
        <div className="relative">
          <input
            id="signup-confirm"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            suppressHydrationWarning
            className="input pr-16"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            suppressHydrationWarning
            className="muted absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium hover:text-[var(--text)]"
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={busy}
        suppressHydrationWarning
        className="btn btn-primary btn-block mt-6"
      >
        {busy ? "Creating account…" : "Create account"}
      </button>

      <p className="faint mt-4 text-center text-[12.5px] leading-relaxed">
        SignLang needs your camera to recognise signs. Video stays on your
        device.{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-[var(--text)]"
        >
          Privacy &amp; data use
        </Link>
      </p>

      <p className="muted mt-6 text-center text-[14px]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--text)] underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
