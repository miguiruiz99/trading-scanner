"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Scanner } from "@/components/scanner"

export default function HomePage() {
  const [timeframe, setTimeframe] = useState("15m")

  return (
    <div className="min-h-screen bg-background">
      <Header timeframe={timeframe} setTimeframe={setTimeframe} />
      <main className="container mx-auto px-4 py-6">
        <Scanner />
      </main>
    </div>
  )
}
