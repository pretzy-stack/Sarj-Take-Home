export function stripGutenbergBoilerplate(raw: string): string {
  const startMatch = raw.match(/\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*/i)
  const endMatch = raw.match(/\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*/i)

  const start = startMatch?.index !== undefined ? startMatch.index + startMatch[0].length : 0
  const end = endMatch?.index !== undefined ? endMatch.index : raw.length

  let cleaned = raw.slice(start, end).trim()

  // Optional: skip first 1000 characters if it looks like more clutter
  return cleaned.length > 1000 ? cleaned.slice(1000).trim() : cleaned
}
