"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Search,
  Upload,
  BookOpen,
  School,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminPYQPage() {
  const [activeTab, setActiveTab] = useState<"papers" | "questions">("papers");
  const [papers, setPapers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Paper Form State
  const [paperModalOpen, setPaperModalOpen] = useState(false);
  const [paperForm, setPaperForm] = useState({
    universityId: "",
    branchId: "",
    subjectId: "",
    examYear: "2024",
    examType: "END_TERM",
    title: "",
    pdfUrl: "/sample-notes/unit1-sample.pdf",
    fileSize: "1.8 MB",
  });

  // New Question Form State
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    subjectId: "",
    topicTag: "",
    questionText: "",
    marks: "10",
    difficulty: "MEDIUM",
    frequencyCount: "1",
    isImportant: false,
    solutionText: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, qRes, uRes, sRes, bRes] = await Promise.all([
        fetch("/api/pyq/papers").then((r) => r.json()),
        fetch("/api/pyq/questions").then((r) => r.json()),
        fetch("/api/universities").then((r) => r.json()),
        fetch("/api/academic/subjects").then((r) => (r.ok ? r.json() : { subjects: [] })),
        fetch("/api/academic/branches").then((r) => (r.ok ? r.json() : { branches: [] })),
      ]);

      if (pRes?.papers) setPapers(pRes.papers);
      if (qRes?.questions) setQuestions(qRes.questions);
      if (uRes?.universities) setUniversities(uRes.universities);
      if (sRes?.subjects) setSubjects(sRes.subjects);
      if (bRes?.branches) setBranches(bRes.branches);
    } catch (err) {
      console.error("Error fetching admin PYQ data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/pyq/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paperForm),
      });
      if (res.ok) {
        setStatusMessage("Exam paper uploaded successfully!");
        setPaperModalOpen(false);
        fetchData();
        setTimeout(() => setStatusMessage(null), 3500);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create paper");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/pyq/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionForm),
      });
      if (res.ok) {
        setStatusMessage("Question added to QuestionBank!");
        setQuestionModalOpen(false);
        fetchData();
        setTimeout(() => setStatusMessage(null), 3500);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add question");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col font-sans transition-colors">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AdminSidebar />

          <main className="flex-1 w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-line shadow-xs">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-ink flex items-center gap-2">
                  <FileText className="w-6 h-6 text-danger" />
                  PYQ & Question Bank Management
                </h1>
                <p className="text-xs sm:text-sm text-ink-3 mt-1">
                  Upload university semester question papers and curate repeated important questions.
                </p>
              </div>

              <div className="flex gap-2">
                {activeTab === "papers" ? (
                  <button
                    onClick={() => setPaperModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger/90 shadow-xs transition"
                  >
                    <Plus className="w-4 h-4" /> Upload Exam Paper
                  </button>
                ) : (
                  <button
                    onClick={() => setQuestionModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger/90 shadow-xs transition"
                  >
                    <Plus className="w-4 h-4" /> Add Question
                  </button>
                )}
              </div>
            </div>

            {/* Status Alert */}
            {statusMessage && (
              <div className="p-4 rounded-xl bg-ok-soft border border-ok/35 text-ok text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Tab Nav */}
            <div className="flex border-b border-line gap-6">
              <button
                onClick={() => setActiveTab("papers")}
                className={`pb-3 text-sm font-bold border-b-2 transition ${
                  activeTab === "papers"
                    ? "border-danger text-danger"
                    : "border-transparent text-ink-3 hover:text-ink-2"
                }`}
              >
                Exam Papers ({papers.length})
              </button>
              <button
                onClick={() => setActiveTab("questions")}
                className={`pb-3 text-sm font-bold border-b-2 transition ${
                  activeTab === "questions"
                    ? "border-danger text-danger"
                    : "border-transparent text-ink-3 hover:text-ink-2"
                }`}
              >
                Question Bank ({questions.length})
              </button>
            </div>

            {/* Content Tab: Papers */}
            {activeTab === "papers" && (
              <div className="bg-surface rounded-2xl border border-line overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-2 text-ink-3 font-bold border-b border-line uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Title / Year</th>
                        <th className="py-3 px-4">University</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Branch</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Downloads</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {papers.map((p) => (
                        <tr key={p.id} className="hover:bg-surface-2/50">
                          <td className="py-3 px-4">
                            <span className="font-bold text-ink block">
                              {p.title}
                            </span>
                            <span className="text-[11px] text-ink-3">Exam Year: {p.examYear}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-brand">
                            {p.university?.code}
                          </td>
                          <td className="py-3 px-4 text-ink-2">
                            {p.subject?.name}
                          </td>
                          <td className="py-3 px-4 text-ink-2">
                            {p.branch?.code}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-warn-soft text-warn text-[10px] font-bold">
                              {p.examType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-ink-2">
                            {p.downloadCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Content Tab: Questions */}
            {activeTab === "questions" && (
              <div className="bg-surface rounded-2xl border border-line overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-2 text-ink-3 font-bold border-b border-line uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Topic / Question</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Marks</th>
                        <th className="py-3 px-4">Difficulty</th>
                        <th className="py-3 px-4">Repeat Freq</th>
                        <th className="py-3 px-4">Important</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {questions.map((q) => (
                        <tr key={q.id} className="hover:bg-surface-2/50">
                          <td className="py-3 px-4 max-w-md">
                            <span className="px-2 py-0.5 rounded-md bg-brand-soft text-brand font-bold text-[10px] mr-2">
                              {q.topicTag}
                            </span>
                            <p className="text-ink mt-1 line-clamp-2">
                              {q.questionText}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-ink-2">
                            {q.subject?.name}
                          </td>
                          <td className="py-3 px-4 font-bold text-ink">
                            {q.marks}M
                          </td>
                          <td className="py-3 px-4 uppercase text-[10px] font-bold">
                            {q.difficulty}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-danger-soft text-danger font-extrabold text-[11px]">
                              {q.frequencyCount}x
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {q.isImportant ? (
                              <span className="text-warn font-bold">⭐ High</span>
                            ) : (
                              <span className="text-ink-3">Regular</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Upload Paper Modal */}
      {paperModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-line shadow-2xl">
            <h3 className="text-lg font-bold text-ink mb-4">
              Upload PYQ Exam Paper
            </h3>
            <form onSubmit={handleCreatePaper} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Paper Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures End-Term Paper 2024"
                  value={paperForm.title}
                  onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">University</label>
                  <select
                    required
                    value={paperForm.universityId}
                    onChange={(e) => setPaperForm({ ...paperForm, universityId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                  >
                    <option value="">Select University</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.code} - {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Branch</label>
                  <select
                    required
                    value={paperForm.branchId}
                    onChange={(e) => setPaperForm({ ...paperForm, branchId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Subject</label>
                  <select
                    required
                    value={paperForm.subjectId}
                    onChange={(e) => setPaperForm({ ...paperForm, subjectId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Exam Year</label>
                  <input
                    type="text"
                    required
                    value={paperForm.examYear}
                    onChange={(e) => setPaperForm({ ...paperForm, examYear: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Exam Type</label>
                  <select
                    value={paperForm.examType}
                    onChange={(e) => setPaperForm({ ...paperForm, examType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                  >
                    <option value="END_TERM">End Term</option>
                    <option value="MID_TERM">Mid Term</option>
                    <option value="BACKLOG">Backlog</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">PDF File URL</label>
                <input
                  type="text"
                  required
                  value={paperForm.pdfUrl}
                  onChange={(e) => setPaperForm({ ...paperForm, pdfUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setPaperModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-ink-3 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-danger text-white font-bold hover:bg-danger/90"
                >
                  Upload Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-line shadow-2xl">
            <h3 className="text-lg font-bold text-ink mb-4">
              Add Question to Question Bank
            </h3>
            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Subject</label>
                  <select
                    required
                    value={questionForm.subjectId}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, subjectId: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Topic Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asymptotic Analysis, Tree Traversals"
                    value={questionForm.topicTag}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, topicTag: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Question Text</label>
                <textarea
                  required
                  rows={3}
                  value={questionForm.questionText}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, questionText: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Marks</label>
                  <input
                    type="number"
                    value={questionForm.marks}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, marks: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Difficulty</label>
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, difficulty: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Times Repeated</label>
                  <input
                    type="number"
                    value={questionForm.frequencyCount}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, frequencyCount: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Step-by-step Solution</label>
                <textarea
                  rows={3}
                  placeholder="Enter full proof, solution steps, or code..."
                  value={questionForm.solutionText}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, solutionText: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-line bg-surface-2"
                />
              </div>

              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={questionForm.isImportant}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, isImportant: e.target.checked })
                  }
                  className="rounded-sm text-danger focus:ring-danger w-4 h-4"
                />
                <span>High Probability Exam Question ⭐</span>
              </label>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-ink-3 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-danger text-white font-bold hover:bg-danger/90"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
