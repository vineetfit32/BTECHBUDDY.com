export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-ink">
          Privacy Policy
        </h1>
        <p className="text-xs text-ink-3">Last updated: October 2026 • Compliant with Indian IT Act & DPDP Rules</p>
      </div>

      <div className="p-8 rounded-3xl bg-surface border border-line shadow-2xs space-y-6 text-xs sm:text-sm text-ink-2 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">1. Information We Collect</h2>
          <p>
            When you register on BTECHBUDDY, we collect your name, email address, password hash, engineering branch, academic year, semester, and college name to customize your academic dashboard and syllabus recommendations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">2. How We Use Student Data</h2>
          <p>
            Your information is strictly used to authenticate your session, save your video progress, record test scores, and deliver relevant university notices. We do not sell or monetize personal student data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">3. Security & Encryption</h2>
          <p>
            All passwords are encrypted with bcrypt hashes before being written to our database. Session tokens are signed cryptographically and delivered through HTTP-only security cookies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">4. Account Deletion & Queries</h2>
          <p>
            Students can request account deletion or data portability anytime by contacting <span className="font-semibold text-brand">privacy@btechbuddy.in</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
