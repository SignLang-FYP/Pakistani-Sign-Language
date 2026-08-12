"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/common/AuthGuard";
import ProtectedCard from "@/components/common/ProtectedCard";
import { auth, db } from "@/lib/firebase";
import { useCurrentUser } from "@/components/common/useCurrentUser";
import { doc, getDoc, collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { lessons } from "@/data/lessons";
import { availableSigns } from "@/data/availableSigns";
import { useModal } from "@/components/common/ModalProvider";
import PageHeader from "@/components/common/PageHeader";
import SignPicker from "@/components/common/SignPicker";

export default function LearningPage() {
  const router = useRouter();
  const modal = useModal();
  const { user } = useCurrentUser();

  // Built from data/lessons.ts so new lessons appear without touching the page.
  const lessonIds = Object.keys(lessons).map(Number).sort((a, b) => a - b);

  const [lessonsCompleted, setLessonsCompleted] = useState<Record<string, boolean>>({});
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [selectedSigns, setSelectedSigns] = useState<string[]>([]);
  const [customLessons, setCustomLessons] = useState<any[]>([]);

  useEffect(() => {
    async function loadLessonProgress() {
      if (!user) return;

      try {
        const lessonsRef = doc(db, "users", user.uid, "progress", "lessons");
        const lessonsSnap = await getDoc(lessonsRef);

        if (lessonsSnap.exists()) {
          setLessonsCompleted(lessonsSnap.data() as Record<string, boolean>);
        }
      } catch (error) {
        console.log(error);
      }
    }

    loadLessonProgress();
  }, [user]);

  useEffect(() => {
    async function loadCustomLessons() {
      if (!user) return;

      try {
        const lessonsRef = collection(
          db,
          "users",
          user.uid,
          "customLessons"
        );

        const snap = await getDocs(lessonsRef);

        const loadedLessons = snap.docs.map((lessonDoc) => ({
          id: lessonDoc.id,
          ...lessonDoc.data(),
        }));

        setCustomLessons(loadedLessons);
      } catch (error) {
        console.log(error);
      }
    }

    loadCustomLessons();
  }, [user]);

  const unusedSigns = availableSigns;

  async function handleCreateLesson() {
    if (!auth.currentUser) {
      await modal.error("User not logged in");
      return;
    }

    if (selectedSigns.length !== 5) {
      await modal.info("Please select exactly 5 signs.", "Selection incomplete");
      return;
    }

    const selectedSignObjects = availableSigns.filter((sign) =>
      selectedSigns.includes(sign.id)
    );

    try {
      const lessonsRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "customLessons"
      );

      const newLesson = {
        title: `Lesson ${customLessons.length + 3}`,
        signs: selectedSignObjects,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(lessonsRef, newLesson);

      setCustomLessons((prev) => [
        ...prev,
        {
          id: docRef.id,
          ...newLesson,
        },
      ]);

      setSelectedSigns([]);
      setShowAddLesson(false);

      await modal.success("Lesson created successfully.", "Lesson created");
    } catch (error: any) {
      await modal.error(error.message);
    }
  }

  async function handleDeleteLesson(lessonId: string) {
  if (!auth.currentUser) return;

  const confirmDelete = await modal.confirm({
    title: "Delete lesson?",
    message: "This custom lesson will be permanently deleted.",
    confirmText: "Delete",
    variant: "error",
  });
  if (!confirmDelete) return;

  try {
    await deleteDoc(
      doc(db, "users", auth.currentUser.uid, "customLessons", lessonId)
    );

    setCustomLessons((prev) =>
      prev.filter((lesson) => lesson.id !== lessonId)
    );

    await modal.success("Lesson deleted.", "Lesson deleted");
  } catch (error: any) {
    await modal.error(error.message);
  }
}

  return (
    <AuthGuard>
      <div className="page">
        <div className="shell">
          <PageHeader
            eyebrow="Practice"
            title="Learning"
            description="Work through the built-in lessons, or build your own from any five signs."
            actions={
              <button
                onClick={() => setShowAddLesson(true)}
                className="btn btn-sm"
              >
                + New lesson
              </button>
            }
          />

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessonIds.map((lesson, index) => {
              const previousLessonCompleted =
                index === 0
                  ? true
                  : lessonsCompleted[`lesson${lessonIds[index - 1]}`];

              const isCompleted = !!lessonsCompleted[`lesson${lesson}`];

              return (
                <ProtectedCard
                  key={lesson}
                  title={`Lesson ${lesson}`}
                  subtitle="Five signs, practised one at a time."
                  locked={!previousLessonCompleted}
                  completed={isCompleted}
                  onClick={() => router.push(`/learning/${lesson}`)}
                />
              );
            })}

            {customLessons.map((lesson, index) => (
              <div key={lesson.id} className="relative">
                <ProtectedCard
                  title={lesson.title || `Lesson ${index + 3}`}
                  subtitle="Your custom lesson."
                  locked={false}
                  completed={false}
                  onClick={() => router.push(`/learning/custom/${lesson.id}`)}
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLesson(lesson.id);
                  }}
                  className="btn btn-sm btn-danger absolute right-3 top-3"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <SignPicker
          open={showAddLesson}
          title="Select five signs"
          confirmText="Create lesson"
          signs={unusedSigns}
          selected={selectedSigns}
          onChange={setSelectedSigns}
          onCancel={() => {
            setShowAddLesson(false);
            setSelectedSigns([]);
          }}
          onConfirm={handleCreateLesson}
        />
      </div>
    </AuthGuard>
  );
}
