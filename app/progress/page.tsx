"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/common/AuthGuard";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProgressPage() {
  const router = useRouter();

  const [lessonsCompleted, setLessonsCompleted] = useState<Record<string, boolean>>({});
  const [testsCompleted, setTestsCompleted] = useState<Record<string, { score: number; total: number }>>({});

  useEffect(() => {
    async function loadProgress() {
      if (!auth.currentUser) return;

      try {
        const lessonsRef = doc(db, "users", auth.currentUser.uid, "progress", "lessons");
        const testsRef = doc(db, "users", auth.currentUser.uid, "progress", "tests");

        const lessonsSnap = await getDoc(lessonsRef);
        const testsSnap = await getDoc(testsRef);

        if (lessonsSnap.exists()) {
          setLessonsCompleted(lessonsSnap.data() as Record<string, boolean>);
        }

        if (testsSnap.exists()) {
          setTestsCompleted(
            testsSnap.data() as Record<string, { score: number; total: number }>
          );
        }
      } catch (error) {
        console.log(error);
      }
    }

    loadProgress();
  }, []);

  const completedLessonCount = Object.values(lessonsCompleted).filter(Boolean).length;
  const completedTestCount = Object.keys(testsCompleted).length;
  const totalCompleted = completedLessonCount + completedTestCount;
  const progressPercent = (totalCompleted / 10) * 100;

  return (
    <AuthGuard>
      <div className="min-h-screen w-full bg-gradient-to-br from-[var(--theme-main)] via-[var(--theme-main)] to-white px-6 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/home")}
              className="rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)]"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-white">Your Progress</h2>

            <div />
          </div>

          <div className="mt-12 rounded-3xl bg-white/20 p-8 shadow-xl backdrop-blur-md">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white">
                {completedLessonCount} of 5 Lessons · {completedTestCount} of 5 Tests
              </h3>

              <div className="mx-auto mt-6 h-4 w-full max-w-2xl rounded-full bg-white/40">
                <div
                  className="h-4 rounded-full bg-white transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-12">
              <h4 className="text-2xl font-bold text-white">Lessons Completed</h4>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[1, 2, 3, 4, 5].map((lesson) => {
                  const isCompleted = lessonsCompleted[`lesson${lesson}`];

                  return (
                    <div
                      key={lesson}
                      className="rounded-2xl bg-white/80 p-4 text-center shadow-md"
                    >
                      <p className="font-bold text-[var(--theme-main)]">Lesson {lesson}</p>
                      <p className="mt-2 text-gray-600">
                        {isCompleted ? "Completed" : "Locked"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-12">
              <h4 className="text-2xl font-bold text-white">Tests Completed</h4>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[1, 2, 3, 4, 5].map((test) => {
                  const result = testsCompleted[`test${test}`];

                  return (
                    <div
                      key={test}
                      className="rounded-2xl bg-white/80 p-4 text-center shadow-md"
                    >
                      <p className="font-bold text-[var(--theme-main)]">Test {test}</p>
                      <p className="mt-2 text-gray-600">
                        {result ? `${result.score}/${result.total}` : "Not Attempted"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}