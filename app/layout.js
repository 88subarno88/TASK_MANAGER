import { Syne, Outfit, DM_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
});

export const metadata = {
  title: "TaskFlow — Intelligent Task Management",
  description: "A secure, encrypted task management system.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${outfit.variable} ${dmMono.variable}`}
    >
      <body className="bg-void text-white font-body antialiased">
        {children}
      </body>
    </html>
  );
}
