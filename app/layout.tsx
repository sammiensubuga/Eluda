import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const fraunces = Fraunces({ subsets: ["latin"], weight: "600", variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "Eluda — Real connections, your pace",
  description: "A thoughtful, privacy-minded way to find genuine connection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={fraunces.variable} lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
