import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const MAX_RETRIES = 3;

export async function POST(req: Request) {
  const { content } = await req.json();

  const prompt = `
You are a JSON-only response AI.

From the following text, extract:
1. A list of characters
2. All interactions between characters
3. For each interaction:
   - who talks to whom
   - how many times
   - a few quotes
   - the sentiment (positive, negative, neutral)
   - an approximate position in the text (a number between 0 and 1) representing when this interaction occurs

Respond in strict valid JSON. Do not include any explanations or markdown.

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
      "position": 0.0
    }
  ]
}

Text:
"""${content}"""
`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt}: calling LLM and parsing response`);

      const response = await openai.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      });

      const raw = response.choices?.[0]?.message?.content || '';

      let jsonText = '';
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1].trim();
      } else {
        const firstBrace = raw.indexOf('{');
        const lastBrace = raw.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonText = raw.slice(firstBrace, lastBrace + 1).trim();
        } else {
          throw new Error('No JSON block found');
        }
      }

      const parsed = JSON.parse(jsonText);
      console.log(` Success on attempt ${attempt}`);
      return NextResponse.json(parsed);

    } catch (err: any) {
      console.warn(` Attempt ${attempt} failed: ${err.message}`);
      if (attempt === MAX_RETRIES) {
        console.error(' Final parse error:', err.message);
        return NextResponse.json(
          { error: 'Failed to parse JSON from LLM.', message: err.message },
          { status: 422 }
        );
      }
    }
  }

  return NextResponse.json({ error: 'Unexpected failure' }, { status: 500 });
}
