import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "AMS - Attendance Management System",
  description: "Simple, Fast, and Reliable Attendance Management system with role-based panels for Admin, Teacher, and Student.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="min-h-full flex flex-col text-slate-900 relative">
        {/* Global Flowing Waves Background Image */}
        <div 
          className="fixed inset-0 -z-30 w-full h-full pointer-events-none bg-cover bg-center bg-no-repeat bg-slate-50"
          style={{ backgroundImage: 'url("/bg-waves.jpg")' }}
        />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
