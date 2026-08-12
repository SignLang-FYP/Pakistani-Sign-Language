"use client";

import AuthGuard from "@/components/common/AuthGuard";
import PageHeader from "@/components/common/PageHeader";
import { colorThemes } from "@/data/colorThemes";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useModal } from "@/components/common/ModalProvider";
import { useAppTheme } from "@/components/theme/useAppTheme";

export default function ColorTheoryPage() {
  const modal = useModal();

  // useAppTheme is a live Firestore subscription, so the selected card and the
  // rest of the UI both update the moment the save lands — no local mirror.
  const activeTheme = useAppTheme();
  const selectedTheme = activeTheme.id;

  const [saving, setSaving] = useState<string | null>(null);

  async function saveTheme(themeId: string) {
    if (!auth.currentUser) {
      await modal.error("User not logged in");
      return;
    }

    setSaving(themeId);

    try {
      await setDoc(
        doc(db, "users", auth.currentUser.uid, "settings", "theme"),
        {
          themeId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await modal.success("Theme saved successfully.", "Theme updated");
    } catch (error: any) {
      await modal.error(error.message);
    } finally {
      setSaving(null);
    }
  }

  return (
    <AuthGuard>
      <div className="page">
        <div className="shell">
          <PageHeader
            eyebrow="Preferences"
            title="Colour Theory"
            description="Colour affects attention, comfort and how long a learner stays engaged. Pick the accent that feels easiest on your eyes."
          />

          <section className="mt-12 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="section-title">Why it matters</h2>
              <p className="lede mt-3">
                Colour theory studies how colour affects perception, attention
                and emotion. In a learning environment it influences focus,
                comfort and engagement.
              </p>
              <p className="lede mt-3">
                Calm tones — blue, green, soft purple — tend to feel relaxed and
                focused. Brighter tones such as orange raise energy but can feel
                intense over a long session.
              </p>
            </div>

            <div className="card-muted">
              <h2 className="text-lg">How this works here</h2>
              <p className="muted mt-3 text-[15px] leading-relaxed">
                The interface stays deliberately plain — white background, high
                contrast text, no busy gradients — so nothing competes with the
                signs you are learning.
              </p>
              <p className="muted mt-3 text-[15px] leading-relaxed">
                Your chosen colour is applied as a single accent, used for
                highlights and primary actions across the whole app.
              </p>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="section-title">Choose your accent</h2>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {colorThemes.map((theme) => {
                const selected = selectedTheme === theme.id;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => saveTheme(theme.id)}
                    aria-pressed={selected}
                    className="card-interactive"
                    style={
                      selected
                        ? { borderColor: theme.accent }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span
                        aria-hidden="true"
                        className="h-6 w-6 rounded-full"
                        style={{ background: theme.accent }}
                      />
                      {saving === theme.id ? (
                        <span className="tag">Saving…</span>
                      ) : (
                        selected && <span className="tag">Selected</span>
                      )}
                    </div>

                    <h3 className="mt-4 text-base">{theme.name}</h3>
                    <p className="muted mt-1 text-[13.5px] leading-relaxed">
                      {theme.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
