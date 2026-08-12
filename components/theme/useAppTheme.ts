"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { colorThemes, defaultTheme } from "@/data/colorThemes";

export function useAppTheme() {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    // Tracks the Firestore listener for whichever user is currently signed in.
    let unsubscribeTheme: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeTheme?.();
      unsubscribeTheme = null;

      if (!user) {
        setTheme(defaultTheme);
        return;
      }

      const themeRef = doc(db, "users", user.uid, "settings", "theme");

      // A live subscription rather than a one-shot read: saving a new theme on
      // the Colour Theory page now applies immediately, instead of only after
      // a hard refresh or a re-login.
      unsubscribeTheme = onSnapshot(
        themeRef,
        (snap) => {
          const themeId = snap.exists() ? snap.data().themeId : null;
          const selected = colorThemes.find((t) => t.id === themeId);

          setTheme(selected ?? defaultTheme);
        },
        (error) => {
          console.log(error);
          setTheme(defaultTheme);
        }
      );
    });

    return () => {
      unsubscribeTheme?.();
      unsubscribeAuth();
    };
  }, []);

  return theme;
}
