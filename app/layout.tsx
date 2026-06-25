import type { Metadata } from "next";
import { Suspense } from "react";
import { Fraunces, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import StatusBar from "@/components/StatusBar";
import LaunchOverlay from "@/components/LaunchOverlay";
import Toast from "@/components/Toast";
import CommandPalette from "@/components/CommandPalette";
import DataProvider from "@/components/DataProvider";
import ThemeInit from "@/components/ThemeInit";
import { getAllSkills, getAppsMap, getNav, getWikiSlugMap, getWikiTitlesMap } from "@/lib/queries";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ADA AI Labs — Research Workbench",
  description:
    "Alpha Data Architects AI Labs — institutional research, development, knowledge, and deployment workspace.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch from the database on the server, then hand to the client store.
  const [appsMap, wikiSlugMap, wikiTitlesMap, skills, nav] = await Promise.all([
    getAppsMap(),
    getWikiSlugMap(),
    getWikiTitlesMap(),
    getAllSkills(),
    getNav(),
  ]);

  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${fraunces.variable} ${plexSans.variable} ${jetbrains.variable}`}>
      {/* Flash-free theme restore: inline script runs before first CSS paint.
          suppressHydrationWarning on <head> and <script> silences the React
          hydration mismatch caused by data-theme mutation before hydration. */}
      <head suppressHydrationWarning>
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('ada-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();` }} />
      </head>
      {/* suppressHydrationWarning here covers browser extensions (e.g. Scholarcy) that */}
      {/* inject attributes into <body> before React hydrates — not an app bug. */}
      <body suppressHydrationWarning>
        <DataProvider
          appsMap={appsMap}
          wikiSlugMap={wikiSlugMap}
          wikiTitlesMap={wikiTitlesMap}
          skills={skills}
          nav={nav}
        >
          <ThemeInit />
          <div className="app-bg relative z-[1] grid h-screen grid-cols-[240px_1fr] max-[1024px]:grid-cols-[200px_1fr]">
            {/* Suspense boundary: Sidebar uses useSearchParams(), which Next 16
                requires to be wrapped for static prerendering to succeed. */}
            <Suspense fallback={<aside className="border-r border-line bg-bg-1" />}>
              <Sidebar nav={nav} />
            </Suspense>
            <main className="flex flex-col overflow-hidden bg-bg-0">
              <TopBar />
              <div className="relative flex-1 overflow-hidden">
                <div className="page-enter absolute inset-0 overflow-y-auto">{children}</div>
              </div>
              <StatusBar />
            </main>
          </div>
          <LaunchOverlay />
          <CommandPalette />
          <Toast />
        </DataProvider>
      </body>
    </html>
  );
}
