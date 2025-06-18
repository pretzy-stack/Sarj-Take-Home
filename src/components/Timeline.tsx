// src/components/Timeline.tsx
"use client";

import React from "react";
import { Clock } from "lucide-react";
import "./timeline.css";

type Interaction = {
  from: string;
  to: string;
  count: number;
  quotes: string[];
  sentiment: string;
  positions?: number[];
};

type TimelineProps = {
  interactions: Interaction[];
};

const sentimentColor = (sentiment: any) => {
  const s = String(sentiment).toLowerCase();
  switch (s) {
    case "positive":
      return "bg-green-500 shadow-green-500/50";
    case "negative":
      return "bg-red-500 shadow-red-500/50";
    case "neutral":
      return "bg-gray-400 shadow-gray-400/50";
    default:
      return "bg-purple-500 shadow-purple-500/50";
  }
};

export default function Timeline({ interactions }: TimelineProps) {
  const characters = Array.from(
    new Set(interactions.flatMap(i => [i.from, i.to]))
  );
  const grouped: Record<string, Interaction[]> = {};
  characters.forEach(char => {
    grouped[char] = interactions.filter(
      i => i.from === char || i.to === char
    );
  });

  const allPositions = interactions.flatMap(i => i.positions || []);
  const maxPos = allPositions.length ? Math.max(...allPositions) : 1;

  return (
    <div className="mt-16 animate-fade-in-up">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Story Timeline</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Character Interaction Timeline</h2>
        <p className="text-gray-600 dark:text-gray-300">Visualize how characters connect across the story</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="space-y-12">
          {characters.map(char => (
            <div key={char}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{char.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{char}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {grouped[char].reduce((sum, i) => sum + i.count, 0)} total interactions
                  </p>
                </div>
              </div>

              <div className="relative h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                <div className="absolute top-1/2 w-full h-1 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 transform -translate-y-1/2" />

                {grouped[char].flatMap((interaction, idx) =>
                  (interaction.positions || []).map((pos, pIdx) => {
                    const percentage = Math.round(pos * 100);
                    const left = `${(pos / maxPos) * 90 + 5}%`;
                    const quote = interaction.quotes[pIdx] || interaction.quotes[0] || "No quote";
                    const sentiment = String(interaction.sentiment).toUpperCase();

                    return (
                      <div
                        key={`${idx}-${pIdx}`}
                        className={`dot ${sentimentColor(interaction.sentiment)} transition-all duration-300`}
                        style={{ left }}
                        title={
                          `${interaction.from} → ${interaction.to}\n` +
                          `Sentiment: ${sentiment}\n` +
                          `At ~${percentage}% of book\n` +
                          `"${quote}"`
                        }
                      />
                    );
                  })
                )}

                {[0, 25, 50, 75, 100].map(p => (
                  <div
                    key={p}
                    className="absolute top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"
                    style={{ left: `${p * 0.9 + 5}%` }}
                  >
                    <div className="absolute -bottom-5 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400">
                      {p}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-6">
          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div>Positive</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div>Negative</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-400 rounded-full"></div>Neutral</span>
        </div>
      </div>
    </div>
  );
}
