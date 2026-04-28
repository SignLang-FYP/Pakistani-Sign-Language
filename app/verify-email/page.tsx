"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import SignLangBrand from "@/components/brand/SignLangBrand";
import AuthSlideshow from "@/components/auth/AuthSlideshow";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleVerified() {
    if (!auth.currentUser) {
      alert("No user found. Please sign up again.");
      router.push("/signup");
      return;
    }

    setLoading(true);

    try {
      await auth.currentUser.reload();

      if (auth.currentUser.emailVerified) {
        alert("Email verified successfully.");
        router.push("/login");
      } else {
        alert("Your email is still not verified. Please click the link in your inbox first.");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:block h-screen">
        <AuthSlideshow />
      </div>

      <div className="flex items-center justify-center bg-gradient-to-br from-[#FF6D00] via-[#FF8F00] to-white px-8">
        <div className="w-full max-w-md flex flex-col items-center">
          <SignLangBrand />

          <div className="mt-10 w-full rounded-2xl bg-white/20 backdrop-blur-md p-6 shadow-xl text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Verify Your Email
            </h2>

            <p className="text-white/90 leading-7">
              We have sent a verification link to your email address.
              Please open your inbox and click the verification link.
            </p>

            <button
              onClick={handleVerified}
              disabled={loading}
              className="w-full mt-6 rounded-xl bg-white text-[#FF6D00] font-bold py-3 transition hover:scale-[1.01] disabled:opacity-70"
            >
              {loading ? "Checking..." : "I Have Verified My Email"}
            </button>

            <button className="w-full mt-4 rounded-xl border border-white/50 text-white font-medium py-3">
              Resend Verification Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}