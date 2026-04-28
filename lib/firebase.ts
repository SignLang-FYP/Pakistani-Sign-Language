import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA1smCT3Sz5trOvKz6zQqF91GLNYdZBxMA",
  authDomain: "signlang-web.firebaseapp.com",
  projectId: "signlang-web",
  storageBucket: "signlang-web.firebasestorage.app",
  messagingSenderId: "821417202077",
  appId: "1:821417202077:web:f52eca3de60c9f935fdf74"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);