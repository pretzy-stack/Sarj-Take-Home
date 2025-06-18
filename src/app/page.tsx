"use client"

import { useState } from "react"
import BookInput from "@/components/BookInput"
import Timeline from "@/components/Timeline"
import CharacterSummary from "@/components/CharacterSummary"

export default function Home() {
  const [bookText, setBookText] = useState("")
  const [analysisData, setAnalysisData] = useState<any | null>(null)

  const handleAnalysis = (data: any, rawText: string) => {
    setBookText(rawText)
    setAnalysisData(data)
  }

  return (
    <main className="p-6 min-h-screen bg-background text-foreground">
      <BookInput onAnalysisCompleted={handleAnalysis} />

      {bookText && (
        <div className="mt-10 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-2">Book Preview:</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {bookText.slice(0, 500)}...
          </p>
        </div>
      )}

      {analysisData && (
        <>
          <Timeline interactions={analysisData.interactions} />
          <CharacterSummary interactions={analysisData.interactions} />
        </>
      )}
    </main>
  )
}
