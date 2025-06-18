"use client"

import React from "react"
import { BarChart3 } from "lucide-react"

type Interaction = {
  from: string
  to: string
  count: number
  sentiment: string
}

type CharacterSummaryProps = {
  interactions: Interaction[]
}

export default function CharacterSummary({ interactions }: CharacterSummaryProps) {
  const characterStats: Record<string, { total: number; positive: number; negative: number; neutral: number }> = {}

  interactions.forEach(i => {
    const participants = [i.from, i.to]
    participants.forEach(p => {
      if (!characterStats[p]) {
        characterStats[p] = { total: 0, positive: 0, negative: 0, neutral: 0 }
      }

      characterStats[p].total += i.count
      if (i.sentiment === "positive") characterStats[p].positive += i.count
      else if (i.sentiment === "negative") characterStats[p].negative += i.count
      else characterStats[p].neutral += i.count
    })
  })

  const sortedCharacters = Object.entries(characterStats).sort((a, b) => b[1].total - a[1].total)

  return (
    <div className="mt-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          <BarChart3 className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">Character Analytics</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Character Interaction Summary</h2>
        <p className="text-gray-600 dark:text-gray-300">Comprehensive analysis of character relationships and sentiment patterns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCharacters.map(([name, stats], index) => {
          const positivePercentage = (stats.positive / stats.total) * 100;
          const negativePercentage = (stats.negative / stats.total) * 100;
          const neutralPercentage = (stats.neutral / stats.total) * 100;

          return (
            <div key={name} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">{name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">{name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Character #{index + 1}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Total Interactions</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Positive</span>
                      </div>
                      <span className="font-semibold text-green-600">{stats.positive}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${positivePercentage}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Negative</span>
                      </div>
                      <span className="font-semibold text-red-600">{stats.negative}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${negativePercentage}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Neutral</span>
                      </div>
                      <span className="font-semibold text-gray-600">{stats.neutral}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gray-400 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${neutralPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {Math.round(positivePercentage)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Positivity Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}