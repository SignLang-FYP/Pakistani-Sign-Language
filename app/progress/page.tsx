"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/common/AuthGuard";
import PageHeader from "@/components/common/PageHeader";
import { db } from "@/lib/firebase";
import { useCurrentUser } from "@/components/common/useCurrentUser";
import { doc, getDoc } from "firebase/firestore";
import { lessons } from "@/data/lessons";
import { tests } from "@/data/tests";

export default function ProgressPage() {
  const { user } = useCurrentUser();
  const [lessonsCompleted, setLessonsCompleted] = useState<Record<string, boolean>>({});
  const [testsCompleted, setTestsCompleted] = useState<Record<string, { score: number; total: number }>>({});

  useEffect(() => {
    async function loadProgress() {
      if (!user) return;

      try {
        const lessonsRef = doc(db, "users", user.uid, "progress", "lessons");
        const testsRef = doc(db, "users", user.uid, "progress", "tests");

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
  }, [user]);

  // Derived from the actual catalogues so the denominators can never drift
  // out of sync with how many lessons/tests really exist.
  const lessonIds = Object.keys(lessons).map(Number).sort((a, b) => a - b);
  const testIds = Object.keys(tests).map(Number).sort((a, b) => a - b);

  const completedLessonCount = lessonIds.filter(
    (id) => lessonsCompleted[`lesson${id}`]
  ).length;
  const completedTestCount = testIds.filter(
    (id) => testsCompleted[`test${id}`]
  ).length;

  const totalItems = lessonIds.length + testIds.length;
  const totalCompleted = completedLessonCount + completedTestCount;
  const progressPercent =
    totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0;

  return (
    <AuthGuard>
      <div className="page">
        <div className="shell">
          <PageHeader
            eyebrow="Progress"
            title="Your progress"
            description="Lessons and tests you have completed so far."
          />

          <section className="mt-10">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="stat">
                <p className="stat-value">
                  {completedLessonCount}/{lessonIds.length}
                </p>
                <p className="stat-label">Lessons</p>
              </div>
              <div className="stat">
                <p className="stat-value">
                  {completedTestCount}/{testIds.length}
                </p>
                <p className="stat-label">Tests</p>
              </div>
              <div className="stat">
                <p className="stat-value">{Math.round(progressPercent)}%</p>
                <p className="stat-label">Overall</p>
              </div>
            </div>

            <div
              className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]"
              role="progressbar"
              aria-valuenow={Math.round(progressPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall progress"
            >
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </section>

          <section className="mt-14">
            <h2 className="section-title">Lessons</h2>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {lessonIds.map((lesson) => {
                const isCompleted = lessonsCompleted[`lesson${lesson}`];

                return (
                  <div key={lesson} className="card">
                    <p className="text-[15px] font-medium">Lesson {lesson}</p>
                    <p
                      className={`mt-1 text-[13.5px] ${
                        isCompleted ? "text-[var(--accent)]" : "faint"
                      }`}
                    >
                      {isCompleted ? "Completed" : "Not completed"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="section-title">Tests</h2>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {testIds.map((test) => {
                const result = testsCompleted[`test${test}`];

                return (
                  <div key={test} className="card">
                    <p className="text-[15px] font-medium">Test {test}</p>
                    <p
                      className={`mt-1 text-[13.5px] ${
                        result ? "text-[var(--accent)]" : "faint"
                      }`}
                    >
                      {result
                        ? `Scored ${result.score}/${result.total}`
                        : "Not attempted"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
