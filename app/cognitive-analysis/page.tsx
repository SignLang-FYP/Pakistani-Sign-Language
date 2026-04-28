"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/common/AuthGuard";
import { cognitiveQuestions } from "@/data/cognitiveQuestions";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { collection, addDoc, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";

export default function CognitiveAnalysisPage() {
  const router = useRouter();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [scorePreview, setScorePreview] = useState<Record<string, number> | null>(null);
  const [lessonsCompleted, setLessonsCompleted] = useState<Record<string, boolean>>({});
const [testsCompleted, setTestsCompleted] = useState<Record<string, { score: number; total: number }>>({});
const [savedReports, setSavedReports] = useState<any[]>([]);

async function loadSavedReports() {
  if (!auth.currentUser) return;

  try {
    const ref = collection(
      db,
      "users",
      auth.currentUser.uid,
      "cognitiveReports"
    );

    const snap = await getDocs(ref);

    const reports = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSavedReports(
      reports.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  } catch (error) {
    console.log(error);
  }
}


function generateReportText(scores: Record<string, number>) {
  const getLevel = (score: number) => {
    if (score >= 85) return "strong";
    if (score >= 70) return "good";
    if (score >= 50) return "moderate";
    return "needs improvement";
  };

  return `
Cognitive Learning Analysis Report

This report summarizes the student's learning behavior based on questionnaire responses, lesson completion data, and evaluation performance inside the SignLang application.
Attention score is ${scores.attention || 0}%, which indicates ${getLevel(scores.attention || 0)} attention during learning tasks.
Memory score is ${scores.memory || 0}%, which indicates ${getLevel(scores.memory || 0)} recall of previously learned signs.
Motor coordination score is ${scores.motor || 0}%, which indicates ${getLevel(scores.motor || 0)} ability to copy and perform hand movements.
Learning speed score is ${scores.learning || 0}%, which indicates ${getLevel(scores.learning || 0)} learning progression.
Response score is ${scores.response || 0}%, which indicates ${getLevel(scores.response || 0)} response behavior during timed activities.
Engagement score is ${scores.engagement || 0}%, which indicates ${getLevel(scores.engagement || 0)} participation and interest.
Lesson progress score is ${scores.lessonProgress || 0}%, showing how much structured learning content has been completed.
Test performance score is ${scores.testPerformance || 0}%, showing how accurately the student performed signs during evaluation.
Learning consistency score is ${scores.learningConsistency || 0}%, showing the student's overall consistency across learning and testing activities.
This report is intended for educational support and progress tracking only. It should not be treated as a medical diagnosis.
`;
}

function downloadPDF(scores: Record<string, number>) {
  const doc = new jsPDF();
  const reportText = generateReportText(scores);

  doc.setFontSize(18);
  doc.text("Cognitive Analysis Report", 20, 20);

  doc.setFontSize(11);
  doc.text(`Date: ${new Date().toLocaleString()}`, 20, 30);

  const lines = doc.splitTextToSize(reportText, 170);

  let y = 45;

  lines.forEach((line: string) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.text(line, 20, y);
    y += 8;
  });

  // Chart helper
  function drawBarChart(
    title: string,
    chartData: { label: string; value: number }[],
    startY: number
  ) {
    doc.setFontSize(14);
    doc.text(title, 20, startY);

    const chartX = 25;
    const chartY = startY + 12;
    const barMaxWidth = 120;
    const barHeight = 8;
    const gap = 12;

    chartData.forEach((item, index) => {
      const yPos = chartY + index * gap;
      const barWidth = (item.value / 100) * barMaxWidth;

      doc.setFontSize(9);
      doc.text(item.label, chartX, yPos);

      doc.setFillColor(255, 109, 0);
      doc.rect(chartX + 45, yPos - 5, barWidth, barHeight, "F");

      doc.setTextColor(0, 0, 0);
      doc.text(`${item.value}%`, chartX + 170, yPos);
    });

    return chartY + chartData.length * gap + 10;
  }

  if (y > 180) {
    doc.addPage();
    y = 20;
  }

  y += 10;

  y = drawBarChart(
    "Chart 1: Cognitive Behavior Scores",
    [
      { label: "Attention", value: scores.attention || 0 },
      { label: "Memory", value: scores.memory || 0 },
      { label: "Motor", value: scores.motor || 0 },
      { label: "Learning", value: scores.learning || 0 },
      { label: "Response", value: scores.response || 0 },
      { label: "Engagement", value: scores.engagement || 0 },
    ],
    y
  );

  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  drawBarChart(
    "Chart 2: App Performance Scores",
    [
      { label: "Lessons", value: scores.lessonProgress || 0 },
      { label: "Tests", value: scores.testPerformance || 0 },
      { label: "Consistency", value: scores.learningConsistency || 0 },
    ],
    y + 10
  );

  doc.save("cognitive-analysis-report.pdf");
}
useEffect(() => {
  loadSavedReports();
}, []);


useEffect(() => {
  async function loadProgressData() {
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

  loadProgressData();
}, []);

async function saveAnalysis(scores: Record<string, number>) {
  if (!auth.currentUser) return;

  try {
    const ref = collection(
      db,
      "users",
      auth.currentUser.uid,
      "cognitiveReports"
    );

    await addDoc(ref, {
      scores,
      answers,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.log(error);
  }
}

  function handleSelect(qId: string, score: number) {
    setAnswers((prev) => ({
      ...prev,
      [qId]: score,
    }));
  }

  function calculateQuestionnaireScores() {
  const categories = {
    attention: [] as number[],
    memory: [] as number[],
    motor: [] as number[],
    learning: [] as number[],
    response: [] as number[],
    engagement: [] as number[],
  };

  cognitiveQuestions.forEach((q) => {
    const score = answers[q.id];
    if (score) {
      categories[q.category].push(score);
    }
  });

  const result: Record<string, number> = {};

  Object.entries(categories).forEach(([category, scores]) => {
    if (scores.length === 0) {
      result[category] = 0;
    } else {
      const average =
        scores.reduce((sum, value) => sum + value, 0) / scores.length;

      result[category] = Math.round((average / 5) * 100);
    }
  });

  return result;
}

function calculateAppPerformanceScores() {
  const completedLessonCount = Object.values(lessonsCompleted).filter(Boolean).length;

  const testResults = Object.values(testsCompleted);
  const totalTestScore = testResults.reduce((sum, test) => sum + test.score, 0);
  const totalTestMarks = testResults.reduce((sum, test) => sum + test.total, 0);

  const lessonProgressScore = Math.round((completedLessonCount / 5) * 100);

  const testPerformanceScore =
    totalTestMarks > 0 ? Math.round((totalTestScore / totalTestMarks) * 100) : 0;

  const learningConsistencyScore =
    testResults.length > 0
      ? Math.round(((completedLessonCount + testResults.length) / 10) * 100)
      : Math.round((completedLessonCount / 5) * 100);

  return {
    lessonProgress: lessonProgressScore,
    testPerformance: testPerformanceScore,
    learningConsistency: learningConsistencyScore,
  };
}

  return (
    <AuthGuard>
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.push("/home")}
            className="rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)]"
          >
            ← Back
          </button>

          <h2 className="mt-6 text-3xl font-bold text-white text-center">
            Cognitive Analysis Questionnaire
          </h2>

          <div className="mt-10 space-y-6">
            {cognitiveQuestions.map((q) => (
              <div
                key={q.id}
                className="rounded-2xl bg-white/20 p-6 backdrop-blur-md shadow"
              >
                <h3 className="font-bold text-white text-lg">
                  {q.question}
                </h3>

                <div className="mt-4 flex flex-wrap gap-3">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.score;

                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleSelect(q.id, opt.score)}
                        className={`rounded-xl px-4 py-2 font-bold ${
                          selected
                            ? "bg-white text-[var(--theme-main)]"
                            : "bg-white/30 text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
  onClick={() => {
    const questionnaireScores = calculateQuestionnaireScores();
const appScores = calculateAppPerformanceScores();

const finalScores = {
  ...questionnaireScores,
  ...appScores,
};

setScorePreview(finalScores);
saveAnalysis(finalScores).then(() => {
  loadSavedReports();
});  }}
  disabled={Object.keys(answers).length !== cognitiveQuestions.length}
  className="rounded-xl bg-white px-6 py-3 font-bold text-[var(--theme-main)] disabled:opacity-50"
>
  Generate Report
</button>
{scorePreview && (
  <div className="mt-8 rounded-2xl bg-white/20 p-6 text-white backdrop-blur-md">
    <h3 className="text-xl font-bold">Score Preview</h3>

    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Object.entries(scorePreview).map(([category, score]) => (
        <div key={category} className="rounded-xl bg-white/20 px-4 py-3">
          <div className="font-bold capitalize">{category}</div>
          <div>{score}%</div>
        </div>
      ))}
    </div>
    <div className="mt-6 text-center">
  <button
    onClick={() => downloadPDF(scorePreview)}
    className="rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)]"
  >
    Download PDF
  </button>
</div>
  </div>
)}


{savedReports.length > 0 && (
  <div className="mt-12">
    <h3 className="text-2xl font-bold text-white text-center">
      Previous Reports
    </h3>

    <div className="mt-6 space-y-4">
      {savedReports.map((report) => (
        <div
          key={report.id}
          className="rounded-2xl bg-white/20 p-5 text-white backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">Report Date:</div>
              <div>
                {new Date(report.createdAt).toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => setScorePreview(report.scores)}
              className="rounded-xl bg-white px-4 py-2 font-bold text-[var(--theme-main)]"
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}