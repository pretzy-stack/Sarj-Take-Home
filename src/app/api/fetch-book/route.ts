import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { bookId } = await req.json()

    const contentUrls = [
      `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`,
      `https://www.gutenberg.org/files/${bookId}/${bookId}.txt`,
    ]

    let content = ""
    for (const url of contentUrls) {
      const res = await fetch(url)
      if (res.ok) {
        content = await res.text()
        break
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: "Text version not found for this book ID." },
        { status: 404 }
      )
    }

    const metadataUrl = `https://www.gutenberg.org/ebooks/${bookId}`
    const metadataRes = await fetch(metadataUrl)
    const metadataHtml = await metadataRes.text()

    return NextResponse.json({
      content: content.slice(0, 10000), // trim for LLM
      metadataUrl,
      metadataPreview: metadataHtml.slice(0, 300), // optional preview
    })
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch book content." },
      { status: 500 }
    )
  }
}
