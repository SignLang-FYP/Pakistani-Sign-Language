"use client";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { useState } from "react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  return (
    <div className="mt-10 w-full rounded-2xl bg-white/20 backdrop-blur-md p-6 shadow-xl">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 outline-none mb-4 text-gray-800 placeholder:text-gray-500"
      />

      <div className="relative mb-4">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 pr-16 outline-none text-gray-800 placeholder:text-gray-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#FF6D00]"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <button
  onClick={async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!userCredential.user.emailVerified) {
        alert("Please verify your email first.");
        return;
      }

      router.push("/home");
    } catch (error: any) {
      alert(error.message);
    }
  }}
  className="w-full rounded-xl bg-white text-[#FF6D00] font-bold py-3 transition hover:scale-[1.01]"
>
  Login
</button>

      <p className="mt-4 text-center text-white">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}