import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ELUDA",
  description: "Private Connections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 pb-16`}>
        {children}
        
        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 shadow-lg z-50">
          <button className="text-black font-bold text-xs flex flex-col items-center">
            <span className="text-2xl mb-1">🔥</span> Discover
          </button>
          <button className="text-gray-400 font-bold text-xs flex flex-col items-center">
            <span className="text-2xl mb-1">💬</span> Chats
          </button>
          <button className="text-gray-400 font-bold text-xs flex flex-col items-center">
            <span className="text-2xl mb-1">⭐</span> VIP
          </button>
          <button className="text-gray-400 font-bold text-xs flex flex-col items-center">
            <span className="text-2xl mb-1">👤</span> Profile
          </button>
        </nav>
      </body>
    </html>
  );
}