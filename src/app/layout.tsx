import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "もりさわ保育園",
  description: "森澤保育園の保護者・保育士向けアプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-[#f5f7fa]">
        <AuthProvider>
          <Navigation />
          <main className="md:ml-60 pb-20 md:pb-4">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
