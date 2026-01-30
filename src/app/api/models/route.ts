import { NextResponse } from 'next/server';
import { getGeminiApiKey, getOllamaBaseUrl, getDashScopeApiKey, isCloudEnvironment } from '@/lib/settings';

export async function GET() {
  // Parallel settings fetch
  const [geminiApiKey, dashScopeApiKey, ollamaBaseUrl] = await Promise.all([
    getGeminiApiKey(),
    getDashScopeApiKey(),
    getOllamaBaseUrl(),
  ]);

  // Only include Gemini models if an API key is configured
  const geminiModels = geminiApiKey ? [
    { name: 'Gemini 3 Flash', model: 'gemini-3-flash-preview', digest: 'gemini-3-flash-preview' },
    { name: 'Gemini 3 Pro', model: 'gemini-3-pro-preview', digest: 'gemini-3-pro-preview' },
    { name: 'Gemini 3 Deep Think', model: 'gemini-3-deep-think', digest: 'gemini-3-deep-think' },
  ] : [];

  // Only include Qwen models if a DashScope API key is configured
  const qwenModels = dashScopeApiKey ? [
    { name: 'Qwen Flash', model: 'qwen-flash', digest: 'qwen-flash' },
    { name: 'Qwen Plus', model: 'qwen-plus', digest: 'qwen-plus' },
    { name: 'Qwen Max', model: 'qwen3-max', digest: 'qwen3-max' },
    { name: 'Qwen Coder', model: 'qwen3-coder-plus', digest: 'qwen3-coder-plus' },
  ] : [];

  // Try to fetch local Ollama models — skip entirely on cloud (no Ollama available)
  let ollamaModels: { name: string; model: string; digest: string }[] = [];
  if (!isCloudEnvironment()) {
    try {
      const ollamaRes = await fetch(`${ollamaBaseUrl}/api/tags`, {
        signal: AbortSignal.timeout(1000),
      });
      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        ollamaModels = data.models || [];
      }
    } catch {
      // Ollama not available, continue with cloud providers only
    }
  }

  // Combine all model types
  const allModels = [...geminiModels, ...qwenModels, ...ollamaModels];

  return NextResponse.json({ models: allModels }, {
    headers: {
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    }
  });
}
