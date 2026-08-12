"use client";

import { useRef, useState } from "react";
import AuthGuard from "@/components/common/AuthGuard";
import PageHeader from "@/components/common/PageHeader";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { getDoc } from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

import { onAuthStateChanged } from "firebase/auth";
import { useModal } from "@/components/common/ModalProvider";

export default function ProfilePage() {  const modal = useModal();

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
        <div className="flex min-h-screen items-center justify-center">
          <p className="faint text-sm">Loading profile…</p>
        </div>
      </AuthGuard>
    );
  }

  async function handleSaveProfile() {
    if (!auth.currentUser) {
      await modal.error("User not logged in");
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

      await modal.success("Profile saved successfully", "Profile updated");
    } catch (error: any) {
      console.log(error);
      await modal.error(error.message);
    }
  }

  async function handleUpdatePassword() {
    if (!auth.currentUser || !auth.currentUser.email) {
      await modal.error("User not logged in");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      await modal.error("New passwords do not match", "Check your password");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      await modal.success("Password updated successfully", "Password changed");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      await modal.error(error.message);
    }
  }

  return (
    <AuthGuard>
      <div className="page">
        <div className="shell-narrow">
          <PageHeader
            eyebrow="Account"
            title="Profile"
            description="Manage your details and password."
          />

          <section className="mt-10 flex items-center gap-5">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)]">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="block h-full w-full object-cover"
                />
              ) : (
                <div className="faint flex h-full w-full items-center justify-center text-[11px]">
                  No photo
                </div>
              )}
            </div>

            <div>
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
                      setPhotoPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-sm"
              >
                Change photo
              </button>
              <p className="faint mt-2 text-[12.5px]">JPG or PNG.</p>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="section-title">Details</h2>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="field-label" htmlFor="profile-name">
                  Full name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  suppressHydrationWarning
                  className="input"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="profile-address">
                  Home address
                </label>
                <input
                  id="profile-address"
                  type="text"
                  placeholder="Street, city"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  suppressHydrationWarning
                  className="input"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="profile-contact">
                  Contact number
                </label>
                <input
                  id="profile-contact"
                  type="text"
                  placeholder="03xx xxxxxxx"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  suppressHydrationWarning
                  className="input"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="btn btn-primary"
                >
                  Save changes
                </button>
              </div>
            </div>
          </section>

          <hr className="divider my-12" />

          <section>
            <h2 className="section-title">Change password</h2>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="field-label" htmlFor="profile-current-pass">
                  Current password
                </label>
                <input
                  id="profile-current-pass"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  suppressHydrationWarning
                  className="input"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="profile-new-pass">
                  New password
                </label>
                <input
                  id="profile-new-pass"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  suppressHydrationWarning
                  className="input"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="profile-confirm-pass">
                  Confirm new password
                </label>
                <input
                  id="profile-confirm-pass"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  suppressHydrationWarning
                  className="input"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  className="btn btn-primary"
                >
                  Update password
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
