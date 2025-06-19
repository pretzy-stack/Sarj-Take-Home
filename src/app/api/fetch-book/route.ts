// src/app/api/fetch-book/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { bookId } = await req.json();

    const gutendexRes = await fetch(`https://gutendex.com/books/${bookId}`);
    if (!gutendexRes.ok) {
      return NextResponse.json({ error: "Book not found in Gutendex." }, { status: 404 });
    }

    const gutendexData = await gutendexRes.json();
    const title = gutendexData.title || "Unknown Title";

    const contentUrls = [
      `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`,
      `https://www.gutenberg.org/files/${bookId}/${bookId}.txt`,
    ];

    let content = "";
    for (const url of contentUrls) {
      const res = await fetch(url);
      if (res.ok) {
        content = await res.text();
        break;
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: "Text version not found for this book ID." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      title,
      content: content.slice(0, 10000), // Trim for LLM
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch book content." },
      { status: 500 }
    );
  }
}
