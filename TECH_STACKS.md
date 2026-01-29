# Implemented Tech Stack

This document outlines the final technology choices used in the "Glassmorphic Local AI Chat" application.

## Core Framework
*   **Next.js 16 (App Router):** Chosen for its robust server-side rendering, API route capabilities, and seamless integration with Vercel AI SDK.
*   **TypeScript:** Used throughout for type safety and developer productivity.

## User Interface (UI)
*   **Tailwind CSS v4:** For utility-first styling and easy implementation of the "Glassmorphism" aesthetic.
*   **Lucide React:** For lightweight, consistent iconography.
*   **Next-Themes:** For reliable Dark/Light mode switching.
*   **React Markdown:** To render AI responses with proper formatting (code blocks, bold text, etc.).

## AI & Streaming
*   **Vercel AI SDK v6 (`ai@^6.0`, `@ai-sdk/react@^3.0`):** A powerful library for handling streaming responses from LLMs. Upgraded to v6 for latest features.
    *   Uses `DefaultChatTransport` for API communication
    *   Uses `UIMessage` format with `parts` array (not `content` string)
    *   Server uses `convertToModelMessages()` and `toUIMessageStreamResponse()`
*   **Ollama AI Provider (`ai-sdk-ollama`):** For connecting to locally hosted models (Llama 3, Mistral, Qwen, etc.).
*   **Google Generative AI SDK (`@ai-sdk/google`):** For integrating Gemini cloud models (Gemini 3, Gemini 2.5, etc.).

## Data Persistence
*   **SQLite (better-sqlite3):** A high-performance, serverless SQL database perfect for local, private data storage.
*   **Drizzle ORM:** A lightweight, type-safe ORM for interacting with the SQLite database.

## Deployment / Runtime
*   **Node.js:** The runtime environment.
*   **Localhost:** Primarily designed to run locally on the user's machine to ensure data privacy and access to local Ollama instances.