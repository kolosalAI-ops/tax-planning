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
  title: "Tax Planning Dashboard",
  description: "Interactive 7-country tax comparison dashboard",
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
          <Sidebar />
          <div className="md:ml-56 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-8 overflow-x-hidden bg-background">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
