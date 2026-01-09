import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Chatbot } from "@/components/ai/Chatbot";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TwineCapital - Intelligent Accounting",
  description: "Professional accounting software for modern businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <ToastProvider>
          {children}
          <Chatbot />
        </ToastProvider>
      </body>
    </html>
  );
}
