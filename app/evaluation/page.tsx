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
import { tests } from "@/data/tests";
import { useCurrentUser } from "@/components/common/useCurrentUser";
import { useModal } from "@/components/common/ModalProvider";
import PageHeader from "@/components/common/PageHeader";
import SignPicker from "@/components/common/SignPicker";

export default function EvaluationPage() {
  const router = useRouter();
  const modal = useModal();
  const { user } = useCurrentUser();

  // Built from data/tests.ts so new tests appear without touching the page.
  const testIds = Object.keys(tests).map(Number).sort((a, b) => a - b);

  const [testsCompleted, setTestsCompleted] = useState<
    Record<string, { score: number; total: number }>
  >({});

  const [showAddTest, setShowAddTest] = useState(false);
  const [selectedSigns, setSelectedSigns] = useState<string[]>([]);
  const [customTests, setCustomTests] = useState<any[]>([]);

  useEffect(() => {
    async function loadTestProgress() {
      if (!user) return;

      try {
        const testsRef = doc(
          db,
          "users",
          user.uid,
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
  }, [user]);

  useEffect(() => {
    async function loadCustomTests() {
      if (!user) return;

      try {
        const testsRef = collection(
          db,
          "users",
          user.uid,
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
  }, [user]);

  async function handleCreateTest() {
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

      await modal.success("Test created successfully.", "Test created");
    } catch (error: any) {
      await modal.error(error.message);
    }
  }

  async function handleDeleteTest(testId: string) {
    if (!auth.currentUser) return;

    const confirmDelete = await modal.confirm({
      title: "Delete test?",
      message: "This custom test will be permanently deleted.",
      confirmText: "Delete",
      variant: "error",
    });
    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, "users", auth.currentUser.uid, "customTests", testId)
      );

      setCustomTests((prev) => prev.filter((test) => test.id !== testId));

      await modal.success("Test deleted.", "Test deleted");
    } catch (error: any) {
      await modal.error(error.message);
    }
  }

  return (
    <AuthGuard>
      <div className="page">
        <div className="shell">
          <PageHeader
            eyebrow="Assessment"
            title="Evaluation"
            description="Take a scored test, or build your own from any five signs."
            actions={
              <button
                onClick={() => setShowAddTest(true)}
                className="btn btn-sm"
              >
                + New test
              </button>
            }
          />

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testIds.map((test, index) => {
              const previousTestCompleted =
                index === 0
                  ? true
                  : !!testsCompleted[`test${testIds[index - 1]}`];

              const isCompleted = !!testsCompleted[`test${test}`];

              return (
                <ProtectedCard
                  key={test}
                  title={`Test ${test}`}
                  subtitle="Five signs, scored as you go."
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
                  subtitle="Your custom test."
                  locked={false}
                  completed={!!testsCompleted[`custom_${test.id}`]}
                  onClick={() => router.push(`/evaluation/custom/${test.id}`)}
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTest(test.id);
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
          open={showAddTest}
          title="Select five signs"
          confirmText="Create test"
          signs={availableSigns}
          selected={selectedSigns}
          onChange={setSelectedSigns}
          onCancel={() => {
            setShowAddTest(false);
            setSelectedSigns([]);
          }}
          onConfirm={handleCreateTest}
        />
      </div>
    </AuthGuard>
  );
}
