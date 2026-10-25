"use client";

import Image from "next/image";
import logo from "../eluda_logo.png";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Top Header */}
          {/* Top Header */}
      <header className="bg-black text-white p-3 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          {/* Logo Container - no forced circle, just a square with rounded corners */}
          <div className="w-10 h-10 rounded-md overflow-hidden bg-black border border-yellow-600 flex items-center justify-center">
            <Image 
              src="/eluda-logo.png" 
              alt="ELUDA Logo" 
              width={50} 
              height={50} 
              className="object-contain" 
            />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-[#FFD700]">ELUDA</h1>
        </div>
        
        {/* Kampala location */}
        <div className="text-xs font-semibold text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
          📍 Kampala
        </div>
      </header>

      {/* Main Feed (Placeholder for now) */}
      <div className="p-4 flex flex-col items-center justify-center mt-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Discover Connections</h2>
        <p className="text-gray-500 text-center mb-6">
          Find verified hookups, dates, and friends near you.
        </p>
        
        {/* A placeholder Card */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="h-64 bg-pink-100 flex items-center justify-center text-pink-400">
            [ Girl's Photo Will Go Here ]
          </div>
          <div className="p-4">
            <h3 className="text-xl font-bold text-gray-800">Natasha, 25</h3>
            <p className="text-gray-500">📍 Ntinda, Kampala</p>
            <div className="mt-4 flex gap-2">
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">VIP</span>
              <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold">Casual</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}