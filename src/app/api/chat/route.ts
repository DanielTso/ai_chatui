import { createOllama } from 'ollama-ai-provider';
import { StreamingTextResponse, streamText } from 'ai';

const ollama = createOllama();

export async function POST(req: Request) {
  const { messages, model } = await req.json();
  const modelName = model || 'llama3:latest';

  const result = await streamText({
    // @ts-ignore - Version mismatch between ai sdk and provider types
    model: ollama(modelName) as any,
    messages,
  });

  return new StreamingTextResponse(result.toAIStream());
}
