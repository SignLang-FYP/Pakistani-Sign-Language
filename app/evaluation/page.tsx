"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/common/AuthGuard";
import ProtectedCard from "@/components/common/ProtectedCard";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { availableSigns } from "@/data/availableSigns";

export default function EvaluationPage() {
  const router = useRouter();

  const [testsCompleted, setTestsCompleted] = useState<
    Record<string, { score: number; total: number }>
  >({});

  const [showAddTest, setShowAddTest] = useState(false);
  const [selectedSigns, setSelectedSigns] = useState<string[]>([]);
  const [customTests, setCustomTests] = useState<any[]>([]);

  useEffect(() => {
    async function loadTestProgress() {
      if (!auth.currentUser) return;

      try {
        const testsRef = doc(
          db,
          "users",
          auth.currentUser.uid,
          "progress",
          "tests"
        );

        const testsSnap = await getDoc(testsRef);

        if (testsSnap.exists()) {
          setTestsCompleted(
            testsSnap.data() as Record<string, { score: number; total: number }>
          );
        }
      } catch (error) {
        console.log(error);
      }
    }

    loadTestProgress();
  }, []);

  useEffect(() => {
    async function loadCustomTests() {
      if (!auth.currentUser) return;

      try {
        const testsRef = collection(
          db,
          "users",
          auth.currentUser.uid,
          "customTests"
        );

        const snap = await getDocs(testsRef);

        const loadedTests = snap.docs.map((testDoc) => ({
          id: testDoc.id,
          ...testDoc.data(),
        }));

        setCustomTests(loadedTests);
      } catch (error) {
        console.log(error);
      }
    }

    loadCustomTests();
  }, []);

  async function handleCreateTest() {
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
      const testsRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "customTests"
      );

      const newTest = {
        title: `Test ${customTests.length + 3}`,
        signs: selectedSignObjects,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(testsRef, newTest);

      setCustomTests((prev) => [
        ...prev,
        {
          id: docRef.id,
          ...newTest,
        },
      ]);

      setSelectedSigns([]);
      setShowAddTest(false);

      alert("Test created successfully.");
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function handleDeleteTest(testId: string) {
    if (!auth.currentUser) return;

    const confirmDelete = confirm("Delete this custom test?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, "users", auth.currentUser.uid, "customTests", testId)
      );

      setCustomTests((prev) => prev.filter((test) => test.id !== testId));

      alert("Test deleted.");
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen w-full px-6 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.push("/home")}
              className="rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)]"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-white">Evaluation</h2>

            <button
              onClick={() => setShowAddTest(true)}
              className="rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)]"
            >
              + Add Test
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((test) => {
              const previousTestCompleted =
                test === 1 ? true : !!testsCompleted[`test${test - 1}`];

              const isCompleted = !!testsCompleted[`test${test}`];

              return (
                <ProtectedCard
                  key={test}
                  title={`Test ${test}`}
                  subtitle="PSL Evaluation Test"
                  locked={!previousTestCompleted}
                  completed={isCompleted}
                  onClick={() => router.push(`/evaluation/${test}`)}
                />
              );
            })}

            {customTests.map((test, index) => (
              <div key={test.id} className="relative">
                <ProtectedCard
                  title={test.title || `Test ${index + 3}`}
                  subtitle="PSL Evaluation Test"
                  locked={false}
                  completed={!!testsCompleted[`custom_${test.id}`]}
                  onClick={() => router.push(`/evaluation/custom/${test.id}`)}
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTest(test.id);
                  }}
                  className="absolute right-3 top-3 rounded-lg bg-red-600 px-3 py-1 text-sm font-bold text-white shadow"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {showAddTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-xl font-bold text-[var(--theme-main)]">
                Select 5 Signs
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Selected: {selectedSigns.length}/5
              </p>

              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {availableSigns.map((sign) => {
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
                          className="mx-auto h-16 w-16 rounded-lg object-cover"
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
              </div>

              <div className="mt-6 flex justify-between gap-4">
                <button
                  onClick={() => {
                    setShowAddTest(false);
                    setSelectedSigns([]);
                  }}
                  className="rounded-xl bg-gray-200 px-4 py-2 font-bold text-gray-700"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateTest}
                  disabled={selectedSigns.length !== 5}
                  className="rounded-xl bg-[var(--theme-main)] px-4 py-2 font-bold text-white disabled:opacity-50"
                >
                  Create Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
} 