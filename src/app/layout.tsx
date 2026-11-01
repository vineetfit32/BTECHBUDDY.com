import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/noto-sans-devanagari";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import OfflineBanner from "@/components/ui/OfflineBanner";
import MobileBottomNav from "@/components/ui/MobileBottomNav";
import FocusExit from "@/components/ui/FocusExit";
import AppProviders from "@/components/providers/AppProviders";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Toaster from "@/components/motion/Toaster";
import MascotDock from "@/components/mascot/MascotDock";
import { PREFERENCES_BOOT_SCRIPT } from "@/lib/preferences";

export const metadata: Metadata = {
  title: "BTECHBUDDY — The Engineer's Study Board",
  description:
    "Complete B.Tech learning platform across India. Topper handwritten notes, solved PYQs, self-hosted video lectures, live classes, spaced-repetition flashcards and a private AI study buddy for CSE, IT, AIML, ECE, EE, ME and Civil.",
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
  icons: { icon: "/icons/buddy.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
    { media: "(prefers-color-scheme: light)", color: "#f6f5f0" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="dark"
      data-theme="study"
      data-saver="off"
      data-motion="full"
      data-focus="off"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFERENCES_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col bg-canvas text-ink antialiased">
        <a
          href="#main"
          className="sr-only z-[100] rounded-lg bg-brand px-4 py-2 font-bold text-on-brand focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <AppProviders>
          <OfflineBanner />
          <Navbar />
          <main id="main" className="relative z-10 flex-1 pb-20 lg:pb-0">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <FocusExit />
          <Toaster />
          <MascotDock />
          <SmoothScroll />
        </AppProviders>
      </body>
    </html>
  );
}
