"use client";

import React from "react";
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

const sentimentColor = (sentiment: string) => {
  if (typeof sentiment !== "string") return "bg-black";
  switch (sentiment.toLowerCase()) {
    case "positive":
      return "bg-green-500";
    case "negative":
      return "bg-red-500";
    case "neutral":
      return "bg-gray-400";
    default:
      return "bg-black";
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
    <div className="space-y-6 mt-10">
      <h3 className="text-lg font-semibold mb-2">Character Interaction Timeline</h3>
      {characters.map(char => (
        <div key={char}>
          <div className="font-medium mb-2">{char}</div>
          <div className="relative h-10">
            <div className="absolute top-1/2 w-full h-[2px] bg-gray-300" />
            {grouped[char].flatMap((interaction, index) =>
              (interaction.positions || []).map((pos, pIndex) => {
                const left = `${(pos / maxPos) * 95}%`;
                const sentiment = typeof interaction.sentiment === "string" ? interaction.sentiment : "unknown";
                const quote =
                  interaction.quotes?.[pIndex] ||
                  interaction.quotes?.[0] ||
                  "No quote";
                const percentage = Math.round(pos * 100);

                return (
                  <div
                    key={`${index}-${pIndex}`}
                    className={`dot ${sentimentColor(sentiment)}`}
                    style={{ left }}
                    title={`[${interaction.from} → ${interaction.to}]\nSentiment: ${sentiment.toUpperCase()}\nAt: ~${percentage}% of book\n"${quote}"`}
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
