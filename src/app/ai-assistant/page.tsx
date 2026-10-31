"use client";

import { useState } from "react";
import {
  Sparkles,
  Send,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Bot,
  User,
  Key,
  HelpCircle,
} from "lucide-react";

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content:
        "Hello! I am **BTECHBUDDY AI Copilot**. Ask me any engineering concept, algorithm step, formula proof, or university PYQ topic, and I will explain it with unit syllabus citations.",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerStatus, setProviderStatus] = useState<any>(null);

  const suggestedPrompts = [
    "Explain Asymptotic Notations (Big O, Omega, Theta) with proofs",
    "What are the 4 Coffman conditions for Deadlock in OS?",
    "Explain Database Normalization: 1NF, 2NF, 3NF and BCNF",
    "How do AVL Tree LL, RR, LR, RL rotations work?",
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || loading) return;

    const userMsg = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setProviderStatus(data);

      let botResponseContent = "";

      if (data.configured && data.answer) {
        botResponseContent = data.answer;
      } else if (data.instantAnswer) {
        botResponseContent = `### 📚 ${data.instantAnswer.title}\n\n**Subject Citation:** ${data.instantAnswer.subject} • ${data.instantAnswer.unit}\n\n${data.instantAnswer.explanation}\n\n> 🎯 **Exam Frequency:** ${data.instantAnswer.pyqAppeared}`;
      } else {
        botResponseContent = `I am currently operating in offline concept mode. ${data.message || ""}\n\nTry asking about: *Big O notation, Deadlock conditions, Normalization, or AVL trees* for instant database answers!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: botResponseContent,
          instantAnswer: data.instantAnswer,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an issue processing your request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full flex flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                BTECHBUDDY AI Copilot
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold border border-indigo-200 dark:border-indigo-800">
                  Engineering RAG
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Step-by-step engineering answers cited with university syllabus units and PYQ frequencies.
              </p>
            </div>
          </div>
        </div>

        {/* Not Configured Banner (If external API key is unset) */}
        {providerStatus && !providerStatus.configured && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
            <Key className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">
                External AI Provider Key Not Configured (Safe Boundary Active)
              </span>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                {providerStatus.message}
                <br />
                {providerStatus.setupInstructions}
                <br />
                <em>Instant engineering rule-based answers from the local syllabus database remain active!</em>
              </p>
            </div>
          </div>
        )}

        {/* Chat Messages Container */}
        <div className="flex-1 bg-white dark:bg-[#1C2541] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-4 flex flex-col justify-between overflow-hidden min-h-[450px]">
          <div className="space-y-4 overflow-y-auto pr-2 max-h-[500px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs sm:text-sm ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-2xl leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white font-medium rounded-tr-xs"
                      : "bg-slate-50 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-tl-xs"
                  }`}
                >
                  {m.content}
                </div>

                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                <span>AI Copilot is retrieving concept citations and formulating answer...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block mb-2">
              Popular Engineering Inquiries:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about Data Structures, OS, DBMS, Math formulas..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C2541] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputPrompt.trim()}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </main>

          </div>
  );
}
