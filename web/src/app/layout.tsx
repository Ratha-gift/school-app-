import type { Metadata } from "next";
import { Kantumruy_Pro } from "next/font/google";
import "./globals.css";

// Kantumruy Pro supports both Khmer and Latin text.
const kantumruy = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer", "latin"],
});

export const metadata: Metadata = {
  title: "School Admin",
  description: "ផ្ទាំងគ្រប់គ្រងសាលា",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="km" className={`${kantumruy.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) add
          attributes to <body> before React loads. Only affects this tag. */}
      <body className="min-h-full font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
