/**
 * Overlapping fixed-size text chunker with sentence-boundary awareness.
 * Breaks text into chunks of ~maxSize chars with ~overlap chars of overlap,
 * preferring to break at sentence boundaries.
 */

const SENTENCE_BOUNDARIES = ['. ', '.\n', '! ', '? ', '\n\n']

export function chunkText(
  text: string,
  maxSize: number = 2000,
  overlap: number = 400
): { index: number; content: string }[] {
  if (!text || text.trim().length === 0) return []
  if (text.length <= maxSize) return [{ index: 0, content: text }]

  const chunks: { index: number; content: string }[] = []
  let start = 0
  let chunkIndex = 0

  while (start < text.length) {
    let end = start + maxSize

    if (end >= text.length) {
      // Last chunk — take everything remaining
      chunks.push({ index: chunkIndex, content: text.slice(start) })
      break
    }

    // Try to find a sentence boundary in the last 20% of the chunk
    const searchStart = start + Math.floor(maxSize * 0.8)
    let bestBreak = -1

    for (const boundary of SENTENCE_BOUNDARIES) {
      const idx = text.lastIndexOf(boundary, end)
      if (idx >= searchStart && idx > bestBreak) {
        bestBreak = idx + boundary.length
      }
    }

    if (bestBreak > 0) {
      end = bestBreak
    }

    chunks.push({ index: chunkIndex, content: text.slice(start, end) })
    chunkIndex++
    start = end - overlap

    // Prevent infinite loop if overlap >= chunk size
    if (start <= chunks[chunks.length - 1].index && start + overlap >= text.length) {
      break
    }
  }

  return chunks
}
