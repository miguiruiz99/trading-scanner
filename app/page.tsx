"use client";

import { useState } from "react";
import { Header, Timeframe } from "@/components/header";
import { Scanner } from "@/components/scanner";

export default function HomePage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("5m");

  return (
    <div className="min-h-screen bg-background">
      <Header timeframe={timeframe} setTimeframe={setTimeframe} />
      <main className="w-full max-w-7xl mx-auto px-6 py-6">
        <Scanner />
      </main>
    </div>
  );
}
