"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/common/AuthGuard";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { getDoc } from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

import { onAuthStateChanged } from "firebase/auth";

export default function ProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid, "profile", "info");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFullName(data.name || "");
        setAddress(data.address || "");
        setContactNumber(data.contact || "");
        if (data.photoUrl) {
          setPhotoPreview(data.photoUrl);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingProfile(false);
    }
  });

  return () => unsubscribe();
}, []);


if (loadingProfile) {
  return (
    <AuthGuard>
      <div className="min-h-screen w-full bg-gradient-to-br from-[var(--theme-main)] via-[var(--theme-main)] to-white flex items-center justify-center">
        <div className="rounded-2xl bg-white/20 px-8 py-6 text-xl font-bold text-white shadow-xl backdrop-blur-md">
          Loading profile...
        </div>
      </div>
    </AuthGuard>
  );
}



  return (
    <AuthGuard>
      <div className="min-h-screen w-full bg-gradient-to-br from-[var(--theme-main)] via-[var(--theme-main)] to-white px-6 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/home")}
              className="rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)]"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-white">Profile Management</h2>

            <div />
          </div>

          <div className="mt-12 rounded-3xl bg-white/20 p-8 shadow-xl backdrop-blur-md">
            <div className="flex flex-col items-center">
  <div className="h-32 w-32 overflow-hidden rounded-full bg-white/80 border-4 border-white shadow-lg">
  {photoPreview ? (
    <img
      src={photoPreview}
      alt="Profile"
      className="block h-full w-full object-cover"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--theme-main)]">
      Profile Photo
    </div>
  )}
</div>

  <input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  }
}}
/>

  <button
    onClick={() => fileInputRef.current?.click()}
    className="mt-4 rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)]"
  >
    Edit Photo
  </button>
</div>

            <div className="mt-10 grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 outline-none text-gray-800 placeholder:text-gray-500"
              />

              <input
                type="text"
                placeholder="Home Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 outline-none text-gray-800 placeholder:text-gray-500"
              />

              <input
                type="text"
                placeholder="Contact Number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 outline-none text-gray-800 placeholder:text-gray-500"
              />

              <button
  onClick={async () => {
  if (!auth.currentUser) {
    alert("User not logged in");
    return;
  }

  try {
    await setDoc(
  doc(db, "users", auth.currentUser.uid, "profile", "info"),
  {
    name: fullName,
    address: address,
    contact: contactNumber,
    photoUrl: photoPreview,
  },
  { merge: true }
);

    alert("Profile saved successfully");
  } catch (error: any) {
    alert(error.message);
    console.log(error);
  }
}}
  className="mt-2 rounded-xl bg-white py-3 font-bold text-[var(--theme-main)]"
>
  Save Changes
</button>  
            </div>

            <div className="my-10 h-px w-full bg-white/40" />

            <h3 className="text-xl font-bold text-white">Change Password</h3>

            <div className="mt-4 grid grid-cols-1 gap-4">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 outline-none text-gray-800 placeholder:text-gray-500"
              />

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 outline-none text-gray-800 placeholder:text-gray-500"
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 outline-none text-gray-800 placeholder:text-gray-500"
              />

              <button
  onClick={async () => {
    if (!auth.currentUser || !auth.currentUser.email) {
      alert("User not logged in");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      alert("Password updated successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      alert(error.message);
    }
  }}
  className="mt-2 rounded-xl bg-white py-3 font-bold text-[var(--theme-main)]"
>
  Update Password
</button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}