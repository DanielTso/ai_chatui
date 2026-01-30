import { getOllamaBaseUrl } from './settings'
import { saveMessageEmbedding, getEmbeddingsForChat, getEmbeddingsForProject, getAllEmbeddings } from '@/app/actions'

const EMBEDDING_MODEL = 'nomic-embed-text'

/**
 * Check if the embedding model is available via Ollama.
 * Returns false if Ollama is down or the model isn't installed.
 */
export async function ensureEmbeddingModel(): Promise<boolean> {
  try {
    const baseUrl = await getOllamaBaseUrl()
    const res = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return false

    const data = await res.json()
    const models: { name: string }[] = data.models || []
    return models.some(m => m.name.startsWith(EMBEDDING_MODEL))
  } catch {
    return false
  }
}

/**
 * Generate an embedding vector for the given text using Ollama's nomic-embed-text model.
 * Returns a 768-dimensional float array.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const baseUrl = await getOllamaBaseUrl()
  const res = await fetch(`${baseUrl}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      prompt: text,
    }),
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    throw new Error(`Embedding generation failed: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return data.embedding
}

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 and 1 (1 = identical direction).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  if (denominator === 0) return 0

  return dotProduct / denominator
}

/**
 * Find messages semantically similar to the query embedding.
 * Searches within the specified scope (chat, project, or all).
 */
export async function findSimilarMessages(
  queryEmbedding: number[],
  scope: { chatId?: number; projectId?: number },
  topK: number = 5,
  threshold: number = 0.7
): Promise<{ content: string; similarity: number; chatId: number; messageId: number }[]> {
  // Load embeddings based on scope
  let embeddings
  if (scope.projectId) {
    embeddings = await getEmbeddingsForProject(scope.projectId)
  } else if (scope.chatId) {
    embeddings = await getEmbeddingsForChat(scope.chatId)
  } else {
    embeddings = await getAllEmbeddings()
  }

  // Compute similarities
  const scored = embeddings.map(e => {
    const vector = JSON.parse(e.embedding) as number[]
    return {
      content: e.content,
      similarity: cosineSimilarity(queryEmbedding, vector),
      chatId: e.chatId,
      messageId: e.messageId,
    }
  })

  // Filter and sort
  return scored
    .filter(s => s.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
}

/**
 * Generate an embedding for a message and store it in the database.
 * Silently fails if Ollama is unavailable.
 */
export async function embedAndStore(
  messageId: number,
  chatId: number,
  projectId: number | null,
  content: string
): Promise<void> {
  const embedding = await generateEmbedding(content)
  await saveMessageEmbedding(messageId, chatId, projectId, content, embedding)
}
