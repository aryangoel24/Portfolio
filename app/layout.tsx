import React from "react"
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";

import "./globals.css";

const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const _spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Aryan Goel | Portfolio",
  description:
    "An immersive 3D portfolio showcasing skills, projects, and experience through an interactive cosmic universe.",
};

export const viewport: Viewport = {
  themeColor: "#0a0e17",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${_spaceGrotesk.variable} ${_spaceMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
