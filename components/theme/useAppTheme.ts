"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { colorThemes, defaultTheme } from "@/data/colorThemes";

export function useAppTheme() {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setTheme(defaultTheme);
        return;
      }

      try {
        const themeRef = doc(
          db,
          "users",
          user.uid,
          "settings",
          "theme"
        );

        const snap = await getDoc(themeRef);

        if (snap.exists()) {
          const data = snap.data();
          const selectedTheme = colorThemes.find(
            (t) => t.id === data.themeId
          );

          if (selectedTheme) {
            setTheme(selectedTheme);
          }
        } else {
          setTheme(defaultTheme);
        }
      } catch (error) {
        console.log(error);
        setTheme(defaultTheme);
      }
    });

    return () => unsubscribe();
  }, []);

  return theme;
}