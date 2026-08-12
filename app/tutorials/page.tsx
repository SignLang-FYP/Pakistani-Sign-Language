"use client";

import { useRouter } from "next/navigation";
import AuthGuard from "@/components/common/AuthGuard";
import PageHeader from "@/components/common/PageHeader";

const categories = [
  { name: "English Alphabet", route: "/tutorials/english" },
  { name: "Urdu Alphabet", route: "/tutorials/urdu" },
  { name: "Fruits", route: "/tutorials/fruits" },
  { name: "Geography", route: "/tutorials/geography" },
  { name: "Birds", route: "/tutorials/birds" },
  { name: "Colors", route: "/tutorials/colors" },
];

export default function TutorialsPage() {
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="page">
        <div className="shell">
          <PageHeader
            eyebrow="Tutorials"
            title="Video tutorials"
            description="Short lessons grouped by category. Pick one to start watching."
          />

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => router.push(category.route)}
                className="card-interactive"
              >
                <h2 className="text-lg">{category.name}</h2>
                <p className="muted mt-1 text-[14px]">View lessons →</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
