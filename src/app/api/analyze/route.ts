import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MAX_RETRIES = 3;
const CHUNK_SIZE = 4000;

export async function POST(req: Request) {
  const { content } = await req.json();

  if (!content || content.length === 0) {
    return NextResponse.json({ error: "No content provided." }, { status: 400 });
  }

  const totalLength = content.length;
  const chunks: string[] = [];
  for (let i = 0; i < totalLength; i += CHUNK_SIZE) {
    chunks.push(content.slice(i, i + CHUNK_SIZE));
  }

  const allCharacters = new Set<string>();
  const allInteractions: {
    from: string;
    to: string;
    count: number;
    quotes: string[];
    sentiment: string;
    positions: number[];
  }[] = [];

  for (const [chunkIndex, chunk] of chunks.entries()) {
    const prompt = `
Extract the following in valid JSON ONLY. Do NOT include any markdown, prose, or explanation.

From the following text chunk, extract:
1. A list of named characters or commonly used named titles (Mr. Smith, Lady Catherine, Dr. Watson, etc.). Include recurring pronoun-titled characters (e.g. "The Judge", "The General") if they clearly refer to specific individuals. Avoid generic terms like "man", "someone", "people", etc.
2. All meaningful interactions between these characters
3. For each interaction:
   - from (who initiates or dominates the interaction)
   - to (who is receiving or participating)
   - count (number of mentions or interactions)
   - quotes (short supporting excerpts)
   - sentiment ("positive", "neutral", or "negative")
   - positions: array of floats between 0–1 indicating where this happened in the chunk

Respond with raw JSON ONLY in this format:

{
  "characters": ["Mr. Darcy", "Elizabeth Bennet"],
  "interactions": [
    {
      "from": "Elizabeth Bennet",
      "to": "Mr. Darcy",
      "count": 3,
      "quotes": ["I could easily forgive his pride...", "He was the last man..."],
      "sentiment": "negative",
      "positions": [0.23, 0.54]
    }
  ]
}

Text:
"""${chunk}"""
`.trim();

    let parsed: any;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Chunk ${chunkIndex + 1}, attempt ${attempt}`);

        const res = await openai.chat.completions.create({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content:
                "You are a JSON API. Always respond with ONLY a single valid JSON object. Never include explanations, prose, or markdown. Your output will be parsed with JSON.parse directly.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
        });

        const raw = res.choices?.[0]?.message?.content || "";
        const jsonText = raw.trim();

        if (!jsonText.startsWith("{") || !jsonText.endsWith("}")) {
          throw new Error("LLM response not in JSON object format");
        }

        parsed = JSON.parse(jsonText.replace(/[\u0000-\u001F]/g, ""));
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
