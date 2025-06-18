"use client";

import React from "react";
import "./timeline.css";

type Interaction = {
  from: string;
  to: string;
  count: number;
  quotes: string[];
  sentiment: string;
  positions?: number[]; // Position of interaction in the book (0 to 1)
};

type TimelineProps = {
  interactions: Interaction[];
};

// Determine color based on sentiment
const sentimentColor = (sentiment: string) => {
  switch (sentiment.toLowerCase()) {
    case "positive":
      return "bg-green-500";
    case "negative":
      return "bg-red-500";
    case "neutral":
      return "bg-gray-400";
    default:
      return "bg-black"; // Unknown or unclassified sentiment
  }
};

export default function Timeline({ interactions }: TimelineProps) {
  // Gather all unique characters
  const characters = Array.from(
    new Set(interactions.flatMap(i => [i.from, i.to]))
  );

  // Group interactions by character
  const grouped: Record<string, Interaction[]> = {};
  characters.forEach(char => {
    grouped[char] = interactions.filter(
      i => i.from === char || i.to === char
    );
  });

  // Max position to normalize timeline
  const allPositions = interactions.flatMap(i => i.positions || []);
  const maxPos = allPositions.length ? Math.max(...allPositions) : 1;

  return (
    <div className="space-y-10 mt-10">
      <h3 className="text-2xl font-semibold mb-4 text-center">
        Character Interaction Timeline
      </h3>

      {characters.map(char => (
        <div key={char}>
          <div className="font-bold text-lg mb-2">{char}</div>

          <div className="relative h-10 bg-gray-200 rounded">
            <div className="absolute top-1/2 w-full h-[2px] bg-gray-400" />

            {grouped[char].flatMap((interaction, index) =>
              (interaction.positions || []).map((pos, pIndex) => {
                const left = `${(pos / maxPos) * 100}%`;
                const quote =
                  interaction.quotes[pIndex] ||
                  interaction.quotes[0] ||
                  "No quote";
                const sentiment = interaction.sentiment || "unknown";
                const percentage = Math.round(pos * 100);

                return (
                  <div
                    key={`${index}-${pIndex}`}
                    className={`dot ${sentimentColor(sentiment)}`}
                    style={{ left }}
                    title={`[${interaction.from} → ${interaction.to}]\nSentiment: ${sentiment.toUpperCase()}\nAt: ${percentage}% of book\n"${quote}"`}
                  />
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
