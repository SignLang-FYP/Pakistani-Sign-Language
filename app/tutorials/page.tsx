"use client";

import { useRouter } from "next/navigation";
import AuthGuard from "@/components/common/AuthGuard";

export default function TutorialsPage() {
  const router = useRouter();

  const categories = [
    { name: "English Alphabet", route: "/tutorials/english" },
    { name: "Urdu Alphabet", route: "/tutorials/urdu" },
    { name: "Fruits", route: "/tutorials/fruits" },
    { name: "Geography", route: "/tutorials/geography" },
    { name: "Birds", route: "/tutorials/birds" },
    { name: "Colors", route: "/tutorials/colors" },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen px-6 py-10">
        <button
  onClick={() => router.push("/home")}
  className="rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)]"
>
  ← Back
</button>
        <h2 className="text-3xl font-bold text-white text-center">
          Video Tutorials
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => router.push(cat.route)}
              className="cursor-pointer rounded-2xl bg-white p-6 text-center font-bold text-[var(--theme-main)] shadow-lg hover:scale-105 transition"
            >
              {cat.name}
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}