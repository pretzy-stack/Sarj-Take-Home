"use client"

import React from "react"

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
    <div className="mt-12 max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Character Interaction Summary</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedCharacters.map(([name, stats]) => (
          <div key={name} className="border p-4 rounded shadow-sm bg-white dark:bg-gray-900">
            <h4 className="font-bold text-lg mb-2">{name}</h4>
            <p>Total Interactions: {stats.total}</p>
            <p className="text-green-600">Positive: {stats.positive}</p>
            <p className="text-red-600">Negative: {stats.negative}</p>
            <p className="text-gray-600">Neutral: {stats.neutral}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
