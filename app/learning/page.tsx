"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/common/AuthGuard";
import ProtectedCard from "@/components/common/ProtectedCard";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { lessons } from "@/data/lessons";
import { availableSigns } from "@/data/availableSigns";

export default function LearningPage() {
  const router = useRouter();

  const [lessonsCompleted, setLessonsCompleted] = useState<Record<string, boolean>>({});
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [selectedSigns, setSelectedSigns] = useState<string[]>([]);
  const [customLessons, setCustomLessons] = useState<any[]>([]);

  useEffect(() => {
    async function loadLessonProgress() {
      if (!auth.currentUser) return;

      try {
        const lessonsRef = doc(db, "users", auth.currentUser.uid, "progress", "lessons");
        const lessonsSnap = await getDoc(lessonsRef);

        if (lessonsSnap.exists()) {
          setLessonsCompleted(lessonsSnap.data() as Record<string, boolean>);
        }
      } catch (error) {
        console.log(error);
      }
    }

    loadLessonProgress();
  }, []);

  useEffect(() => {
    async function loadCustomLessons() {
      if (!auth.currentUser) return;

      try {
        const lessonsRef = collection(
          db,
          "users",
          auth.currentUser.uid,
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
  }, []);

  const unusedSigns = availableSigns;

  async function handleCreateLesson() {
    if (!auth.currentUser) {
      alert("User not logged in");
      return;
    }

    if (selectedSigns.length !== 5) {
      alert("Please select exactly 5 signs.");
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

      alert("Lesson created successfully.");
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function handleDeleteLesson(lessonId: string) {
  if (!auth.currentUser) return;

  const confirmDelete = confirm("Delete this custom lesson?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(
      doc(db, "users", auth.currentUser.uid, "customLessons", lessonId)
    );

    setCustomLessons((prev) =>
      prev.filter((lesson) => lesson.id !== lessonId)
    );

    alert("Lesson deleted.");
  } catch (error: any) {
    alert(error.message);
  }
}

  return (
    <AuthGuard>
     <div className="min-h-screen px-6 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.push("/home")}
              className="rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)]"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-white">Learning</h2>

            <button
              onClick={() => setShowAddLesson(true)}
              className="rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)]"
            >
              + Add Lesson
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2,].map((lesson) => {
              const previousLessonCompleted =
                lesson === 1 ? true : lessonsCompleted[`lesson${lesson - 1}`];

              const isCompleted = !!lessonsCompleted[`lesson${lesson}`];

              return (
                <ProtectedCard
                  key={lesson}
                  title={`Lesson ${lesson}`}
                  subtitle="PSL Lesson"
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
      subtitle="PSL lesson"
      locked={false}
      completed={false}
      onClick={() => router.push(`/learning/custom/${lesson.id}`)}
    />

    <button
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteLesson(lesson.id);
      }}
      className="absolute right-3 top-3 rounded-lg bg-red-600 px-3 py-1 text-sm font-bold text-white shadow"
    >
      Delete
    </button>
  </div>
))}
          </div>
        </div>

        {showAddLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-xl font-bold text-[var(--theme-main)]">
                Select 5 Signs
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Selected: {selectedSigns.length}/5
              </p>

              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                {unusedSigns.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {unusedSigns.map((sign) => {
                      const selected = selectedSigns.includes(sign.id);

                      return (
                        <div
                          key={sign.id}
                          onClick={() => {
                            if (selected) {
                              setSelectedSigns((prev) =>
                                prev.filter((id) => id !== sign.id)
                              );
                            } else if (selectedSigns.length < 5) {
                              setSelectedSigns((prev) => [...prev, sign.id]);
                            }
                          }}
                          className={`cursor-pointer rounded-xl border p-3 text-center transition ${
                            selected
                              ? "border-[var(--theme-main)] bg-orange-100"
                              : "border-gray-300 hover:border-[var(--theme-main)]"
                          }`}
                        >
                          <img
                            src={sign.imagePath}
                            alt={sign.modelLabel}
                            className="mx-auto h-20 w-20 rounded-lg object-cover"
                          />
                          <div className="mt-2 text-2xl font-bold text-gray-900">
                            {sign.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sign.modelLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl bg-orange-50 p-4 text-center font-semibold text-[var(--theme-main)]">
                    No unused signs available.
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between gap-4">
                <button
                  onClick={() => {
                    setShowAddLesson(false);
                    setSelectedSigns([]);
                  }}
                  className="rounded-xl bg-gray-200 px-4 py-2 font-bold text-gray-700"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateLesson}
                  disabled={selectedSigns.length !== 5}
                  className="rounded-xl bg-[var(--theme-main)] px-4 py-2 font-bold text-white disabled:opacity-50"
                >
                  Create Lesson
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}