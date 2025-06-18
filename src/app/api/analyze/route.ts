// src/app/api/analyze/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { stripGutenbergBoilerplate } from "@/lib/cleanText";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MAX_RETRIES = 3;
const CHUNK_SIZE = 2750;

export async function POST(req: Request) {
  const { content } = await req.json();
  if (!content || content.length === 0) {
    return NextResponse.json({ error: "No content provided." }, { status: 400 });
  }

  const cleanedText = stripGutenbergBoilerplate(content);

  const totalLength = cleanedText.length;
  const chunks: string[] = [];
  for (let i = 0; i < totalLength; i += CHUNK_SIZE) {
    chunks.push(cleanedText.slice(i, i + CHUNK_SIZE));
  }

  let allCharacters = new Set<string>();
  let allInteractions: any[] = [];

  for (const [chunkIndex, chunk] of chunks.entries()) {
    const prompt = `
You are a JSON-only response AI.

From the following text chunk, extract:
1. A list of characters
2. All interactions between characters
3. For each interaction:
   - who talks to whom
   - how many times
   - a few short quotes
   - the sentiment (positive, negative, neutral)
   - positions: an array of numbers between 0 and 1 (relative to this chunk)

Respond in strict JSON. No markdown or explanation.

Return format:
{
  "characters": [...],
  "interactions": [
    {
      "from": "",
      "to": "",
      "count": 0,
      "quotes": [""],
      "sentiment": "",
      "positions": [0.23, 0.54]
    }
  ]
}

Text:
"""${chunk}"""
`;

    let parsed: any;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Chunk ${chunkIndex + 1}, attempt ${attempt}`);
        const res = await openai.chat.completions.create({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: "You are a helpful assistant that returns only valid JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
        });

        let raw = res.choices?.[0]?.message?.content || "";
        const m = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonText = m
          ? m[1].replace(/[\u0000-\u001F]/g, "")
          : raw.replace(/[\u0000-\u001F]/g, "");
        parsed = JSON.parse(jsonText);
        break;
      } catch (err: any) {
        console.warn(`  attempt ${attempt} failed: ${err.message}`);
        if (attempt === MAX_RETRIES) {
          return NextResponse.json(
            { error: "LLM parsing failed", message: err.message },
            { status: 422 }
          );
        }
      }
    }

    for (const c of parsed.characters || []) {
      allCharacters.add(c);
    }

    for (const i of parsed.interactions || []) {
      const chunkLength = chunk.length;
      const baseOffset = chunkIndex * CHUNK_SIZE;
      const absPositions = (i.positions || []).map((p: number) => {
        const absoluteIndex = baseOffset + p * chunkLength;
        return Math.min(1, Math.max(0, absoluteIndex / totalLength));
      });
      allInteractions.push({
        from: i.from,
        to: i.to,
        count: i.count,
        quotes: (i.quotes || []).slice(0, 3),
        sentiment: i.sentiment || "neutral",
        positions: absPositions,
      });
    }
  }

  return NextResponse.json({
    characters: Array.from(allCharacters),
    interactions: allInteractions,
  });
}
