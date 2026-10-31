"use client";

import { useState } from "react";
import {
  FileText,
  Printer,
  Sparkles,
  Plus,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
} from "lucide-react";

export default function ResumeBuilderPage() {
  const [resumeData, setResumeData] = useState({
    name: "Aman Sharma",
    email: "aman.sharma@example.com",
    phone: "+91 98765 43210",
    linkedin: "linkedin.com/in/amansharma",
    github: "github.com/amansharma",
    location: "Noida, Uttar Pradesh",
    objective:
      "Passionate B.Tech Computer Science student with strong foundations in Data Structures, Algorithms, and Full-Stack Web Development. Looking to apply problem-solving and engineering skills in a dynamic software engineering role.",
    education: [
      {
        degree: "B.Tech in Computer Science & Engineering",
        institution: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
        year: "2021 - 2025",
        score: "CGPA: 8.6 / 10.0",
      },
      {
        degree: "Senior Secondary (Class XII - CBSE)",
        institution: "Delhi Public School",
        year: "2021",
        score: "Percentage: 92.4%",
      },
    ],
    skills: {
      languages: "C++, Java, Python, TypeScript, JavaScript, SQL",
      frameworks: "React, Next.js, Node.js, Express, Tailwind CSS, Prisma",
      tools: "Git, GitHub, Docker, Postman, VS Code, Linux",
      coursework: "Data Structures & Algorithms, OS, DBMS, Computer Networks, OOP",
    },
    projects: [
      {
        title: "BTECHBUDDY — EdTech Engineering Platform",
        tech: "Next.js, TypeScript, PostgreSQL, Prisma, Tailwind",
        link: "github.com/amansharma/btechbuddy",
        bullets: [
          "Architected full-stack learning portal serving university past exam papers, lecture tracking, and timed quizzes.",
          "Implemented JWT authentication with bcrypt and role-based access control for student and instructor dashboards.",
          "Optimized database queries with Prisma ORM achieving sub-50ms API response times.",
        ],
      },
      {
        title: "Distributed File Sharing & Storage Engine",
        tech: "Node.js, Express, Redis, AWS S3",
        link: "github.com/amansharma/file-engine",
        bullets: [
          "Developed high-throughput chunked file uploader handling uploads up to 2GB with resume capabilities.",
          "Integrated Redis caching layer to reduce repeat metadata lookups by 60%.",
        ],
      },
    ],
    experience: [
      {
        role: "Software Engineering Intern",
        company: "TechNova Solutions Pvt Ltd",
        duration: "June 2024 - Aug 2024",
        bullets: [
          "Built responsive client portals using React and Tailwind CSS, increasing mobile user engagement by 25%.",
          "Wrote automated unit test suites with Jest reducing regression bugs in production releases.",
        ],
      },
    ],
    achievements: [
      "Solved 350+ DSA problems on LeetCode and GeeksforGeeks (Max Rating: 1650).",
      "Ranked Top 5 in National Smart India Hackathon (Internal College Round).",
      "Secured 98.2 percentile in JEE Main 2021.",
    ],
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex flex-col font-sans transition-colors">
      <div className="print:hidden">
              </div>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Controls (Hidden on print) */}
        <div className="print:hidden mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1C2541] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ATS-Optimized B.Tech Resume Format</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Interactive B.Tech Resume Builder
            </h1>
            <p className="text-xs text-slate-500">
              Fill in your details below. The single-column ATS format on the right updates in real-time.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md hover:bg-indigo-700 transition"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>

        {/* Builder Layout: Form on Left, Live ATS Sheet on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: EDITING FORM (Hidden on print) */}
          <div className="print:hidden lg:col-span-5 space-y-6">
            {/* Personal Details Card */}
            <div className="bg-white dark:bg-[#1C2541] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Personal Details
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.name}
                    onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold block mb-1">Email</label>
                    <input
                      type="email"
                      value={resumeData.email}
                      onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Phone</label>
                    <input
                      type="text"
                      value={resumeData.phone}
                      onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold block mb-1">LinkedIn Handle</label>
                    <input
                      type="text"
                      value={resumeData.linkedin}
                      onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">GitHub Handle</label>
                    <input
                      type="text"
                      value={resumeData.github}
                      onChange={(e) => setResumeData({ ...resumeData, github: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Career Objective</label>
                  <textarea
                    rows={3}
                    value={resumeData.objective}
                    onChange={(e) => setResumeData({ ...resumeData, objective: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white dark:bg-[#1C2541] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Technical Skills
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Languages</label>
                  <input
                    type="text"
                    value={resumeData.skills.languages}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, languages: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Frameworks & Libraries</label>
                  <input
                    type="text"
                    value={resumeData.skills.frameworks}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, frameworks: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Tools & Platforms</label>
                  <input
                    type="text"
                    value={resumeData.skills.tools}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, tools: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE ATS PREVIEW SHEET (What gets printed) */}
          <div className="lg:col-span-7 bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-300 font-sans print:p-0 print:border-none print:shadow-none print:w-full print:m-0">
            {/* Header */}
            <div className="text-center border-b pb-4 mb-4 border-slate-300">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {resumeData.name}
              </h2>
              <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-slate-700 mt-1.5 font-medium">
                <span>{resumeData.email}</span>
                <span>•</span>
                <span>{resumeData.phone}</span>
                <span>•</span>
                <span>{resumeData.linkedin}</span>
                <span>•</span>
                <span>{resumeData.github}</span>
              </div>
            </div>

            {/* Objective */}
            <div className="mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                Professional Summary
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                {resumeData.objective}
              </p>
            </div>

            {/* Education */}
            <div className="mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Education
              </h3>
              <div className="space-y-2 text-xs">
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-slate-700">{edu.institution}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-slate-600 font-medium">{edu.year}</div>
                      <div className="font-bold text-slate-900">{edu.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Skills */}
            <div className="mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                Technical Skills
              </h3>
              <div className="space-y-1 text-xs text-slate-800">
                <div>
                  <strong>Programming Languages:</strong> {resumeData.skills.languages}
                </div>
                <div>
                  <strong>Web & Frameworks:</strong> {resumeData.skills.frameworks}
                </div>
                <div>
                  <strong>Developer Tools:</strong> {resumeData.skills.tools}
                </div>
                <div>
                  <strong>Core CS Subjects:</strong> {resumeData.skills.coursework}
                </div>
              </div>
            </div>

            {/* Projects */}
            <div className="mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Technical Projects
              </h3>
              <div className="space-y-3 text-xs">
                {resumeData.projects.map((proj, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div className="font-bold text-slate-900">
                        {proj.title} <span className="font-normal text-slate-600">| {proj.tech}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{proj.link}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                      {proj.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Work Experience / Internships
              </h3>
              <div className="space-y-3 text-xs">
                {resumeData.experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div className="font-bold text-slate-900">
                        {exp.role} <span className="font-normal text-slate-600">| {exp.company}</span>
                      </div>
                      <span className="text-slate-600 font-medium">{exp.duration}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                Achievements & Co-Curricular
              </h3>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-700">
                {resumeData.achievements.map((ach, idx) => (
                  <li key={idx}>{ach}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
              </div>
    </div>
  );
}
