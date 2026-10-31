import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import OfflineBanner from "@/components/ui/OfflineBanner";
import MobileBottomNav from "@/components/ui/MobileBottomNav";

export const metadata: Metadata = {
  title: "BTECHBUDDY — The Engineer's Study Desk",
  description:
    "Complete B.Tech learning platform across India. Download handwritten topper notes, solved previous year question papers (PYQs), watch video lectures, join live classes, and take practice quizzes for CSE, IT, AIML, ECE, EE, ME, and Civil.",
  keywords: [
    "B.Tech Notes",
    "Engineering Syllabus",
    "AKTU Notes",
    "B.Tech Computer Science",
    "Data Structures",
    "Operating Systems",
    "Engineering Mathematics",
    "PYQ Solved Papers",
    "Live Classes B.Tech",
  ],
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B1020" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('btechbuddy_theme') === 'dark' || (!('btechbuddy_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-desk-canvas text-slate-800 dark:text-slate-100 antialiased selection:bg-primary-violet selection:text-white">
        <OfflineBanner />
        <Navbar />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
