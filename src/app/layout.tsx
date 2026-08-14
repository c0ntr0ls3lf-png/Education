import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ContentProtection from "@/components/layout/ContentProtection";
import ExtensionErrorSuppressor from "@/components/layout/ExtensionErrorSuppressor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduLMS - Smart Learning Platform",
  description:
    "A comprehensive Learning Management System for Class 1-12 with advanced math editor, interactive exams, and progress tracking",
  keywords: [
    "EduLMS",
    "education",
    "learning",
    "LMS",
    "MCQ exams",
    "creative questions",
    "Class 1-12",
    "online study",
    "interactive lessons",
    "Bangladesh education",
    "exam preparation",
  ],
  authors: [{ name: "EduLMS Team" }],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "EduLMS - Smart Learning Platform",
    description:
      "A comprehensive Learning Management System for Class 1-12 with advanced math editor, interactive exams, and progress tracking",
    url: "https://edulms.com",
    siteName: "EduLMS",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduLMS - Smart Learning Platform",
    description:
      "A comprehensive Learning Management System for Class 1-12 with advanced math editor, interactive exams, and progress tracking",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ExtensionErrorSuppressor />
        <ContentProtection />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </body>
    </html>
  );
}
