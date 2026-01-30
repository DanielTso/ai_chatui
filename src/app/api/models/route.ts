import { NextResponse } from 'next/server';
import { getGeminiApiKey, getOllamaBaseUrl, getDashScopeApiKey } from '@/lib/settings';

export async function GET() {
  // Only include Gemini models if an API key is configured
  const geminiApiKey = await getGeminiApiKey();
  const geminiModels = geminiApiKey ? [
    { name: 'Gemini 3 Flash', model: 'gemini-3-flash-preview', digest: 'gemini-3-flash-preview' },
    { name: 'Gemini 3 Pro', model: 'gemini-3-pro-preview', digest: 'gemini-3-pro-preview' },
    { name: 'Gemini 3 Deep Think', model: 'gemini-3-deep-think', digest: 'gemini-3-deep-think' },
  ] : [];

  // Only include Qwen models if a DashScope API key is configured
  const dashScopeApiKey = await getDashScopeApiKey();
  const qwenModels = dashScopeApiKey ? [
    { name: 'Qwen Flash', model: 'qwen-flash', digest: 'qwen-flash' },
    { name: 'Qwen Plus', model: 'qwen-plus', digest: 'qwen-plus' },
    { name: 'Qwen Max', model: 'qwen3-max', digest: 'qwen3-max' },
    { name: 'Qwen Coder', model: 'qwen3-coder-plus', digest: 'qwen3-coder-plus' },
  ] : [];

  // Try to fetch local Ollama models using configured URL
  const ollamaBaseUrl = await getOllamaBaseUrl();
  let ollamaModels: { name: string; model: string; digest: string }[] = [];
  try {
    const ollamaRes = await fetch(`${ollamaBaseUrl}/api/tags`, {
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    if (ollamaRes.ok) {
      const data = await ollamaRes.json();
      ollamaModels = data.models || [];
    }
  } catch {
    // Ollama not available, continue with other providers
    console.log('[Models API] Ollama not available, using cloud models only');
  }

  // Combine all model types
  const allModels = [...geminiModels, ...qwenModels, ...ollamaModels];

  return NextResponse.json({ models: allModels }, {
    headers: {
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    }
  });
}
