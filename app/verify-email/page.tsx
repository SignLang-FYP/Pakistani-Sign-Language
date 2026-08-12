"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { useModal } from "@/components/common/ModalProvider";
import SignLangBrand from "@/components/brand/SignLangBrand";
import AuthSlideshow from "@/components/auth/AuthSlideshow";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const modal = useModal();

  async function handleResend() {
    if (!auth.currentUser) {
      await modal.error("No user found. Please sign up again.");
      router.push("/signup");
      return;
    }

    setResending(true);

    try {
      await sendEmailVerification(auth.currentUser);
      await modal.success(
        "We have sent another verification link to your inbox.",
        "Email sent"
      );
    } catch (error: any) {
      await modal.error(error.message);
    } finally {
      setResending(false);
    }
  }

  async function handleVerified() {
    if (!auth.currentUser) {
      await modal.error("No user found. Please sign up again.");
      router.push("/signup");
      return;
    }

    setLoading(true);

    try {
      await auth.currentUser.reload();

      if (auth.currentUser.emailVerified) {
        await modal.success("Email verified successfully.");
        router.push("/login");
      } else {
        await modal.info(
          "Your email is still not verified. Please click the link in your inbox first.",
          "Not verified yet"
        );
      }
    } catch (error: any) {
      await modal.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <div className="hidden h-screen lg:block">
        <AuthSlideshow />
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[360px]">
          <SignLangBrand />

          <div className="mt-10">
            <p className="eyebrow">One more step</p>
            <h2 className="mt-2 text-2xl">Verify your email</h2>

            <p className="lede mt-3 text-[15px]">
              We have sent a verification link to your email address. Open your
              inbox and click the link, then come back here.
            </p>

            <button
              onClick={handleVerified}
              disabled={loading}
              className="btn btn-primary btn-block mt-6"
            >
              {loading ? "Checking…" : "I have verified my email"}
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="btn btn-block mt-3"
            >
              {resending ? "Sending…" : "Resend verification email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
