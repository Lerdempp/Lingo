import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lingo Quiz",
  description: "A modern vocabulary and flashcard app for language learners.",
};

import BottomNav from "@/components/BottomNav";
import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Providers>
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

