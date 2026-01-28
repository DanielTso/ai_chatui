# Project Plan: Glassmorphic Local AI Chat

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (with `backdrop-blur` for Glassmorphism)
- **Icons:** Lucide React
- **AI Integration:** Vercel AI SDK (Ollama Provider) or direct Fetch
- **Database:** SQLite (via `better-sqlite3` and `drizzle-orm` for type safety and speed)
- **Theme:** `next-themes` for Dark/Light mode

## Hardware Context
- **GPU:** AMD 6650XT (8GB)
- **RAM:** 32GB
- **Recommended Models:**
    - **General:** `llama3` (8B) or `mistral` (7B) - Fast, fits in VRAM.
    - **Coding:** `deepseek-coder` (6.7B or similar).
    - **Vision:** `llava` (7B or 13B) - Fits in 8GB (just barely for 13B, 7B is safe).

## Phases

### Phase 1: Initialization & UI Scaffold
**Goal:** A running Next.js app with the basic visual structure (Sidebar + Chat Area) and Theme switching.
1.  Initialize Next.js project.
2.  Install dependencies (`lucide-react`, `next-themes`, `clsx`, `tailwind-merge`).
3.  Configure Tailwind for Glassmorphism (extend colors, background images).
4.  Create Layout: Sidebar (Projects/History) + Main (Chat).
5.  Implement Dark/Light mode toggle.
6.  **Test:** App starts, Theme toggle works, responsive layout.

### Phase 2: Ollama Integration
**Goal:** Chat with the local LLM.
1.  Install `ai` SDK and `ollama-ai-provider` (or create custom API route).
2.  Create `api/chat` route for streaming responses.
3.  Create `api/models` route to fetch installed models from Ollama (`GET /api/tags`).
4.  Implement `ChatInterface` component with Input and Message list.
5.  Implement Model Selector (Dropdown).
6.  **Test:** Can select a model, send a message, and receive a streaming response.

### Phase 3: Data Persistence (SQLite)
**Goal:** Save Projects and Chat History.
1.  Set up `drizzle-orm` and `better-sqlite3`.
2.  Define Schema: `Project` (id, name, icon), `Chat` (id, projectId, title), `Message` (id, chatId, role, content).
3.  Create Server Actions or API routes for CRUD operations.
4.  Connect UI: Create Project -> New Chat -> Save Messages.
5.  **Test:** Data persists across restarts. "Folders" (Projects) organize chats correctly.

### Phase 4: Polish & Refinement
**Goal:** Beautiful Glassmorphism and specialized features.
1.  Enhance UI: Add nice background gradients/blobs to emphasize glass effect.
2.  Markdown support for AI responses (Code blocks with syntax highlighting).
3.  Error handling (Ollama not running, model not found).
4.  **Test:** Full end-to-end usage flow.

## Next Step
Execute Phase 1.
