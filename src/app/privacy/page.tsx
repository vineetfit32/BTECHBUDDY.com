export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400">Last updated: October 2026 • Compliant with Indian IT Act & DPDP Rules</p>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
          <p>
            When you register on BTECHBUDDY, we collect your name, email address, password hash, engineering branch, academic year, semester, and college name to customize your academic dashboard and syllabus recommendations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. How We Use Student Data</h2>
          <p>
            Your information is strictly used to authenticate your session, save your video progress, record test scores, and deliver relevant university notices. We do not sell or monetize personal student data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Security & Encryption</h2>
          <p>
            All passwords are encrypted with bcrypt hashes before being written to our database. Session tokens are signed cryptographically and delivered through HTTP-only security cookies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Account Deletion & Queries</h2>
          <p>
            Students can request account deletion or data portability anytime by contacting <span className="font-semibold text-indigo-600 dark:text-indigo-400">privacy@btechbuddy.in</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
