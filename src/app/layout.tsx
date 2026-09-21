import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "@fontsource/open-runde/400.css";
import "@fontsource/open-runde/500.css";
import "@fontsource/open-runde/600.css";
import "@fontsource/open-runde/700.css";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CELPIP Practice & Mock Exams | Shilu",
  description:
    "Ace the CELPIP with 4,000+ practice questions, 60+ timed mock tests, sample answers for every CLB level, and instant AI scoring on Speaking & Writing.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
