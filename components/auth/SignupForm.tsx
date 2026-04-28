"use client";


import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";


import Link from "next/link";
import { useState } from "react";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  return (
    <div className="mt-10 w-full rounded-2xl bg-white/20 backdrop-blur-md p-6 shadow-xl">
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 outline-none mb-4 text-gray-800 placeholder:text-gray-500"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 outline-none mb-4 text-gray-800 placeholder:text-gray-500"
      />

      {/* Password */}
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

      {/* Confirm Password */}
      <div className="relative mb-4">
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 pr-16 outline-none text-gray-800 placeholder:text-gray-500"
        />
        <button
          type="button"
          onClick={() => setShowConfirm((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#FF6D00]"
        >
          {showConfirm ? "Hide" : "Show"}
        </button>
      </div>

      <button
    onClick={async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

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
      alert(error.message);
    }
  }}
  className="w-full rounded-xl bg-white text-[#FF6D00] font-bold py-3 transition hover:scale-[1.01]"
>
  Sign Up
</button>

      <p className="mt-4 text-center text-white">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold underline">
          Login
        </Link>
      </p>
    </div>
  );
}