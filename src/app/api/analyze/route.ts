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

  const chunks: string[] = [];
  for (let i = 0; i < content.length; i += CHUNK_SIZE) {
    chunks.push(content.slice(i, i + CHUNK_SIZE));
  }

  let allCharacters: Set<string> = new Set();
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
   - an approximate position in the text (0 to 1) for each quote in "positions": [0.23, 0.54]

Respond in strict JSON. No markdown. No explanation.

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
      "positions": [0.0]
    }
  ]
}

Text:
"""${chunk}"""
`;

    let success = false;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Chunk ${chunkIndex + 1}, attempt ${attempt}`);

        const response = await openai.chat.completions.create({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that returns only strict valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
        });

        let raw = response.choices?.[0]?.message?.content || "";

        let jsonText = "";
        const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonText = match[1].trim();
        } else {
          const first = raw.indexOf("{");
          const last = raw.lastIndexOf("}");
          if (first !== -1 && last !== -1 && last > first) {
            jsonText = raw.slice(first, last + 1);
          } else {
            throw new Error("No JSON block found in response.");
          }
        }

        // Clean control characters that break JSON
        jsonText = jsonText.replace(/[\u0000-\u001F]/g, "");

        const parsed = JSON.parse(jsonText);

        for (const c of parsed.characters || []) allCharacters.add(c);

        for (const i of parsed.interactions || []) {
          allInteractions.push({
            from: i.from,
            to: i.to,
            count: i.count,
            quotes: Array.isArray(i.quotes) ? i.quotes.slice(0, 3) : [],
            sentiment: i.sentiment || "neutral",
            positions: Array.isArray(i.positions)
              ? i.positions.map(Number).filter(p => p >= 0 && p <= 1)
              : [],
          });
        }

        console.log(` Success on chunk ${chunkIndex + 1}, attempt ${attempt}`);
        success = true;
        break;
      } catch (err: any) {
        console.warn(` Attempt ${attempt} failed: ${err.message}`);
        if (attempt === MAX_RETRIES) {
          return NextResponse.json(
            { error: "LLM parsing failed", message: err.message },
            { status: 422 }
          );
        }
      }
    }

    if (!success) {
      console.error(`Failed to process chunk ${chunkIndex + 1}`);
    }
  }

  return NextResponse.json({
    characters: Array.from(allCharacters),
    interactions: allInteractions,
  });
}
