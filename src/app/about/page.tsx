import Link from "next/link";
import { GraduationCap, Heart, Award, Users, BookOpen, Sparkles, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-brand to-accent flex items-center justify-center text-white mx-auto shadow-xl">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-ink">
          About BTECHBUDDY
        </h1>
        <p className="text-base sm:text-lg text-ink-2 max-w-2xl mx-auto">
          &ldquo;Your Engineering Journey, Simplified.&rdquo; — Built by engineers, for engineers across India.
        </p>
      </div>

      {/* Mission Section */}
      <div className="p-8 sm:p-10 rounded-3xl bg-surface border border-line shadow-md space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-ink">
          Our Mission & Vision
        </h2>
        <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
          Every semester, millions of B.Tech students in India struggle with scattered syllabus notes, outdated photocopied booklets, confusing textbook theories, and frantic exam-eve preparation. Inspired by the clarity and student-first culture of India&apos;s leading EdTech pioneers, BTECHBUDDY was founded to bring structured, modern, and accessible engineering education to every student.
        </p>
        <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
          We combine university topper handwritten notes, solved past 5-year question papers (PYQs), interactive video lectures, live doubt-clearing sessions, and self-assessment test engines into one unified, responsive platform.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-line shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-ink">Verified Academic Quality</h3>
          <p className="text-xs text-ink-3">
            Every study note and PYQ solution is vetted by university rank-holders and faculty before being published.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-line shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-ok-soft text-ok flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-ink">100% Free Core Access</h3>
          <p className="text-xs text-ink-3">
            We believe fundamental semester notes, formula sheets, and mock tests must remain free for every student in India.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-line shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-warn-soft text-warn flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-ink">Placement Oriented</h3>
          <p className="text-xs text-ink-3">
            Our curriculum bridges the gap between college university exams and high-paying tech company placement rounds.
          </p>
        </div>
      </div>
    </div>
  );
}
