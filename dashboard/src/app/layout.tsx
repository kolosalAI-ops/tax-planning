import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar, { SidebarProvider } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tax Planning Dashboard — Kolosal Tax Advisory",
  description: "Interactive 7-country tax comparison dashboard with corporate tax rates, R&D incentives, treaty analysis, and cross-border structuring.",
  openGraph: {
    title: "Tax Planning Dashboard — Kolosal Tax Advisory",
    description: "Interactive 7-country tax comparison dashboard covering corporate tax, VAT/GST, payroll, and investor analysis.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-[#0D0E0F] focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold">
            Skip to main content
          </a>
          <Sidebar />
          <div className="md:ml-60 min-h-screen flex flex-col">
            <Header />
            <main id="main-content" className="flex-1 p-4 md:p-8 overflow-x-hidden bg-background">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
