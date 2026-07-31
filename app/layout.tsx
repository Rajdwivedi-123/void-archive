import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "VOID ARCHIVE — Impossible Collection",
  description:
    "Enter a cinematic WebGL archive of six impossible objects and the traces they leave behind.",
  applicationName: "VOID ARCHIVE",
  keywords: ["interactive art", "WebGL", "digital archive", "experimental experience"],
  creator: "VOID ARCHIVE",
  category: "art",
  openGraph: {
    title: "VOID ARCHIVE — Impossible Collection",
    description:
      "Enter a cinematic WebGL archive of six impossible objects and the traces they leave behind.",
    siteName: "VOID ARCHIVE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VOID ARCHIVE — Impossible Collection",
    description:
      "Enter a cinematic WebGL archive of six impossible objects and the traces they leave behind.",
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#030303",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
