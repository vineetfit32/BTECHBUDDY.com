export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-ink">
          Terms and Conditions
        </h1>
        <p className="text-xs text-ink-3">Effective Date: October 2026</p>
      </div>

      <div className="p-8 rounded-3xl bg-surface border border-line shadow-2xs space-y-6 text-xs sm:text-sm text-ink-2 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">1. Platform Usage & Academic Integrity</h2>
          <p>
            BTECHBUDDY is an educational platform intended for study, self-assessment, and exam preparation. All study materials, notes, PDFs, and video lectures are provided for personal educational use.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">2. Intellectual Property</h2>
          <p>
            Educational study notes uploaded by rank-holders and instructors remain protected. Users may not bulk-scrape, redistribute, or resell BTECHBUDDY materials on unauthorized commercial websites.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">3. User Conduct</h2>
          <p>
            Users agree not to disrupt live classes, misuse discussion links, or attempt unauthorized access to administrative controls.
          </p>
        </section>
      </div>
    </div>
  );
}
