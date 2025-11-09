import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/Header"; // We will create this

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SASP Dashboard",
  description: "Sentiment-Analysis Sales Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100`}>
        {/* The Header is now part of the root layout */}
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
