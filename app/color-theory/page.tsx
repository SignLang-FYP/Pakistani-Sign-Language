"use client";

import { useRouter } from "next/navigation";
import AuthGuard from "@/components/common/AuthGuard";
import { colorThemes } from "@/data/colorThemes";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function ColorTheoryPage() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  async function saveTheme(themeId: string) {
  if (!auth.currentUser) {
    alert("User not logged in");
    return;
  }

  try {
    await setDoc(
      doc(db, "users", auth.currentUser.uid, "settings", "theme"),
      {
        themeId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    setSelectedTheme(themeId);
    alert("Theme saved successfully.");
  } catch (error: any) {
    alert(error.message);
  }
}

  return (
    <AuthGuard>
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-5xl">

          <button
            onClick={() => router.push("/home")}
            className="rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)]"
          >
            ← Back
          </button>

          <h2 className="mt-6 text-3xl font-bold text-white text-center">
            Color Theory
          </h2>

          <div className="mt-10 space-y-6 text-white">
            <div className="rounded-2xl bg-white/20 p-6 backdrop-blur-md">
              <h3 className="text-xl font-bold">What is Color Theory?</h3>
              <p className="mt-3">
                Color theory is the study of how colors affect perception,
                attention, and emotions. In learning environments, colors can
                influence focus, comfort, and engagement levels.
              </p>
            </div>

            <div className="rounded-2xl bg-white/20 p-6 backdrop-blur-md">
              <h3 className="text-xl font-bold">
                Colors and Learning Behavior
              </h3>
              <p className="mt-3">
                Calm colors such as soft blue, green, and light purple are often
                used to create a relaxed and focused environment. Bright colors
                like orange can increase energy but may also feel intense for
                some users.
              </p>
              <p className="mt-3">
                Every individual responds differently, so allowing users to
                choose their preferred theme improves comfort and usability.
              </p>
            </div>

            <div className="rounded-2xl bg-white/20 p-6 backdrop-blur-md">
              <h3 className="text-xl font-bold">
                Choose Your Preferred Theme
              </h3>
              <p className="mt-3">
                You can select a color theme that feels most comfortable. This
                will update the entire application appearance for your account.
              </p>
            </div>

          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {colorThemes.map((theme) => {
    const selected = selectedTheme === theme.id;

    return (
      <div
        key={theme.id}
onClick={() => saveTheme(theme.id)}        className={`cursor-pointer rounded-2xl p-5 text-center shadow-md ${
          selected ? "ring-4 ring-white" : ""
        }`}
        style={{
          background: `linear-gradient(to bottom right, ${theme.from}, ${theme.via}, ${theme.to})`,
        }}
      >
        <h3 className="text-lg font-bold text-white">{theme.name}</h3>
        <p className="mt-2 text-sm text-white/90">{theme.description}</p>

        {selected && (
          <div className="mt-3 text-sm font-bold text-white">
            Selected
          </div>
        )}
      </div>
    );
  })}
</div>
        </div>
      </div>
    </AuthGuard>
  );
}