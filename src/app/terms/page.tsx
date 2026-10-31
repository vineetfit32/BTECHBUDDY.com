export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Terms and Conditions
        </h1>
        <p className="text-xs text-slate-400">Effective Date: October 2026</p>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Platform Usage & Academic Integrity</h2>
          <p>
            BTECHBUDDY is an educational platform intended for study, self-assessment, and exam preparation. All study materials, notes, PDFs, and video lectures are provided for personal educational use.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Intellectual Property</h2>
          <p>
            Educational study notes uploaded by rank-holders and instructors remain protected. Users may not bulk-scrape, redistribute, or resell BTECHBUDDY materials on unauthorized commercial websites.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. User Conduct</h2>
          <p>
            Users agree not to disrupt live classes, misuse discussion links, or attempt unauthorized access to administrative controls.
          </p>
        </section>
      </div>
    </div>
  );
}
