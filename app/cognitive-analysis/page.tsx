"use client";

import { useState, useEffect, useRef } from "react";
import AuthGuard from "@/components/common/AuthGuard";
import PageHeader from "@/components/common/PageHeader";
import { cognitiveQuestions } from "@/data/cognitiveQuestions";
import { lessons } from "@/data/lessons";
import { tests } from "@/data/tests";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { collection, addDoc, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import { useCurrentUser } from "@/components/common/useCurrentUser";

export default function CognitiveAnalysisPage() {
  const { user } = useCurrentUser();
  
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [scorePreview, setScorePreview] = useState<Record<string, number> | null>(null);
  // Which saved report the preview is showing, so the PDF carries its real date.
  const [previewCreatedAt, setPreviewCreatedAt] = useState<string | undefined>(undefined);
  const previewRef = useRef<HTMLElement | null>(null);
  const [lessonsCompleted, setLessonsCompleted] = useState<Record<string, boolean>>({});
const [testsCompleted, setTestsCompleted] = useState<Record<string, { score: number; total: number }>>({});
const [savedReports, setSavedReports] = useState<any[]>([]);

async function loadSavedReports() {
  if (!user) return;

  try {
    const ref = collection(
      db,
      "users",
      user.uid,
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

function downloadPDF(scores: Record<string, number>, createdAt?: string) {
  const doc = new jsPDF();
  const reportText = generateReportText(scores);

  doc.setFontSize(18);
  doc.text("Cognitive Analysis Report", 20, 20);

  doc.setFontSize(11);
  const reportDate = createdAt ? new Date(createdAt) : new Date();
  doc.text(`Date: ${reportDate.toLocaleString()}`, 20, 30);

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
}, [user]);


useEffect(() => {
  async function loadProgressData() {
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

  loadProgressData();
}, [user]);

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
      // Negatively-worded questions ("how often did the student get
      // distracted?") run the opposite way, so flip them onto the same
      // 1 = worst, 5 = best scale before averaging.
      categories[q.category].push(q.invert ? 6 - score : score);
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

  const totalLessons = Object.keys(lessons).length;
  const totalTests = Object.keys(tests).length;

  const lessonProgressScore =
    totalLessons > 0
      ? Math.round((completedLessonCount / totalLessons) * 100)
      : 0;

  const testPerformanceScore =
    totalTestMarks > 0 ? Math.round((totalTestScore / totalTestMarks) * 100) : 0;

  const learningConsistencyScore =
    testResults.length > 0
      ? Math.round(
          ((completedLessonCount + testResults.length) /
            Math.max(1, totalLessons + totalTests)) *
            100
        )
      : lessonProgressScore;

  return {
    lessonProgress: lessonProgressScore,
    testPerformance: testPerformanceScore,
    learningConsistency: learningConsistencyScore,
  };
}

  const allAnswered = Object.keys(answers).length === cognitiveQuestions.length;

  return (
    <AuthGuard>
      <div className="page">
        <div className="shell">
          <PageHeader
            eyebrow="Insights"
            title="Cognitive analysis"
            description="Answer a short questionnaire. It is combined with your lesson and test performance to produce a report."
          />

          <section className="mt-10 space-y-4">
            {cognitiveQuestions.map((q, index) => (
              <div key={q.id} className="card">
                <div className="flex gap-3">
                  <span className="faint text-[13px] tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-[17px] leading-snug">{q.question}</h2>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 pl-8">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.score;

                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleSelect(q.id, opt.score)}
                        aria-pressed={selected}
                        className={`btn btn-sm ${selected ? "btn-accent" : ""}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={() => {
                const questionnaireScores = calculateQuestionnaireScores();
                const appScores = calculateAppPerformanceScores();

                const finalScores = {
                  ...questionnaireScores,
                  ...appScores,
                };

                setScorePreview(finalScores);
                setPreviewCreatedAt(undefined);
                saveAnalysis(finalScores).then(() => {
                  loadSavedReports();
                });
              }}
              disabled={!allAnswered}
              className="btn btn-primary"
            >
              Generate report
            </button>

            {!allAnswered && (
              <p className="faint text-[13px]">
                {Object.keys(answers).length}/{cognitiveQuestions.length}{" "}
                answered
              </p>
            )}
          </div>

          {scorePreview && (
            <section className="mt-14" ref={previewRef}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="section-title">Score preview</h2>
                  <p className="faint mt-1 text-[13px]">
                    {previewCreatedAt
                      ? `Saved report from ${new Date(previewCreatedAt).toLocaleString()}`
                      : "Latest results"}
                  </p>
                </div>
                <button
                  onClick={() => downloadPDF(scorePreview, previewCreatedAt)}
                  className="btn btn-sm"
                >
                  Download PDF
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Object.entries(scorePreview).map(([category, score]) => (
                  <div key={category} className="stat">
                    <p className="stat-value tabular-nums">{score}%</p>
                    <p className="stat-label">
                      {category.replace(/([A-Z])/g, " $1")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {savedReports.length > 0 && (
            <section className="mt-14">
              <h2 className="section-title">Previous reports</h2>

              <div className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {savedReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <p className="muted text-[14px]">
                      {new Date(report.createdAt).toLocaleString()}
                    </p>

                    <button
                      onClick={() => {
                        setScorePreview(report.scores);
                        setPreviewCreatedAt(report.createdAt);
                        previewRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="btn btn-sm"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
