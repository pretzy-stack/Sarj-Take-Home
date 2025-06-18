"use client"

import { useState } from "react"
import { Eye, Download, Share2, Sparkles } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20">
      <div className="container mx-auto px-6 py-12">
        <BookInput onAnalysisCompleted={handleAnalysis} />

        {bookText && (
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Book Preview</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Text Analysis Preview</h2>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                  {bookText.slice(0, 500)}...
                </p>
              </div>
              
              <div className="mt-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Showing first 500 characters</span>
                <div className="flex gap-3">
                  <button className="flex items-center gap-1 hover:text-purple-600 transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button className="flex items-center gap-1 hover:text-purple-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {analysisData && (
          <>
            <Timeline interactions={analysisData.interactions} />
            <CharacterSummary interactions={analysisData.interactions} />
          </>
        )}

        {/* Footer */}
        <footer className="mt-24 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Powered by AI & Literature Analysis</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Discover the hidden relationships and emotional dynamics within classic literature
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}