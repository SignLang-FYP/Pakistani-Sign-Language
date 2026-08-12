"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Firebase restores the signed-in session asynchronously, so `auth.currentUser`
 * is still null for the first moments after a page mounts. Reading it directly
 * inside a mount effect silently returns nothing on a hard refresh — which is
 * what used to leave progress, custom lessons and saved reports blank.
 *
 * Depend on the returned `user` instead: the effect re-runs once auth resolves.
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return { user, authReady };
}
