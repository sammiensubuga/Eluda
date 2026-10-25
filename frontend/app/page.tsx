"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [girls, setGirls] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetching data from your Django backend!
    fetch("http://127.0.0.1:8000/api/girls/")
      .then((res) => res.json())
      .then((data) => setGirls(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to connect to the backend.");
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F0E8] p-6">
      <h1 className="text-3xl font-bold text-[#32152F] mb-6">Discover</h1>
      
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-4">
        {girls.length === 0 && !error ? (
          <p className="text-[#746B73]">Loading profiles from Django...</p>
        ) : (
          girls.map((girl: any) => (
            <div key={girl.id} className="bg-white p-5 rounded-2xl shadow-sm border border-[#C5A56A]/30">
              <h2 className="text-xl font-bold text-[#32152F]">{girl.name}, {girl.age}</h2>
              <p className="text-sm text-[#746B73] mt-1">📍 {girl.location}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-[#D97991]/10 text-[#D97991] text-xs font-bold rounded-full">
                {girl.category}
              </span>
            </div>
          ))
        )}
      </div>
    </main>
  );
}