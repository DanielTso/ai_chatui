# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Run production server
npm run lint         # Run ESLint
npx drizzle-kit push # Push schema changes to SQLite database
npm test             # Run Vitest unit/integration tests
npm run test:watch   # Run Vitest in watch mode
npm run test:e2e     # Run Playwright E2E tests (starts dev server automatically)
npm run test:all     # Run both Vitest and Playwright
```

Path alias: `@/*` → `./src/*`.

## Environment Setup

Create `.env.local` with:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

API keys and Ollama URL can also be configured at runtime via the **Settings dialog** (stored in the `settings` SQLite table). DB values take priority over `.env.local`.

For local models, run Ollama: `ollama serve` (default port 11434). Both providers are optional — the app works with either or both.

## Architecture Overview

Next.js 16 App Router chat application with hybrid AI backend (Google Gemini cloud + Ollama local models). Local-first design — all data stored in SQLite (`sqlite.db`).

### Data Flow

1. **Client** (`src/app/page.tsx`) — Single-page chat UI using `useChat` from `@ai-sdk/react`. All application state lives here (projects, chats, messages, model selection).
2. **Server Actions** (`src/app/actions.ts`) — "use server" functions for all DB reads/writes (CRUD for projects, chats, messages, settings).
3. **API Routes**:
   - `POST /api/chat` — Streams LLM responses. Routes to Gemini or Ollama based on model name prefix (`gemini` → Google, else → Ollama). Applies context compression (summary + last 20 messages) when summary exists.
   - `GET /api/models` — Lists available models from both providers. Caches for 5 minutes.
   - `POST /api/summarize` — Compresses older messages into an LLM-generated summary. Auto-triggers at 30+ messages, keeps last 10 in full detail.

### Component Structure

- `src/components/chat/` — Chat-specific components: `Sidebar` (project/chat navigation, collapsible with icon-only mode), `MessagesList` (markdown rendering with Framer Motion animations), `ChatHeader`, `ChatContextMenu`, `MessageActions`, `CodeBlock`
- `src/components/ui/` — Reusable UI: `CommandPalette` (Cmd+K), `PersonaSelector` (6 built-in presets), `ModelSelect`, `SettingsDialog` (tabbed settings with API, Appearance, Model Defaults), `SystemPromptDialog`, `RenameDialog`, `DeleteConfirmDialog`, `Toaster` (sonner)
- `src/components/settings/` — Settings tab components: `ApiSettingsTab` (Gemini key, Ollama URL + test), `AppearanceSettingsTab` (theme, font size, density), `ModelDefaultsSettingsTab` (default model, system prompt, persona management)
- `src/hooks/` — `useLocalStorage<T>` (generic localStorage with SSR safety, deferred hydration to avoid mismatch), `usePersonas` (persona management), `useCollapseState` (sidebar section state), `useAppearanceSettings` (font size + message density)
- `src/lib/` — `utils.ts` (`cn()` via clsx + tailwind-merge), `formatTime.ts` (relative timestamps), `settings.ts` (server-side DB-first/env-fallback settings helper)

### Database

SQLite with Drizzle ORM. Schema at `src/db/schema.ts`, connection at `src/db/index.ts`.

Four tables: `projects` → `chats` → `messages` (cascade deletes), plus `settings` (key-value store). Key chat fields: `archived` (soft delete), `systemPrompt`, `summary`, `summaryUpToMessageId`. Settings table: `key` (text PK), `value` (text), `updatedAt` (timestamp).

### State Management

- **Server state**: SQLite via server actions (projects, chats, messages, settings)
- **Server-accessible settings**: API keys, Ollama URL, default model/prompt stored in `settings` table via `src/lib/settings.ts` (DB-first, env-fallback)
- **UI persistence**: `useLocalStorage` hook (sidebar collapse, custom personas, font size, message density). Uses deferred hydration — initializes with default value, reads localStorage in `useEffect` to avoid SSR hydration mismatch
- **Theme**: `next-themes` with class-based dark/light/system switching (configurable in Settings dialog)
- **Refs for closures**: Dynamic values (selectedModel, activeChatId) use `useRef` to avoid stale closures in `useChat` transport

### Styling

Tailwind CSS v4 with a glassmorphism design system. Key patterns:
- Glass panels: `bg-background/60 backdrop-blur-xl` (defined as `.glass-panel` in `globals.css`)
- Design tokens as CSS custom properties in `globals.css` (HSL format, light/dark variants)
- Animations via Framer Motion (message entrance) and CSS keyframes (streaming cursor)
- Radix UI primitives for accessible dialogs, dropdowns, selects, tooltips

### Context Summarization

Auto-summarization triggers at 30+ messages. The summarizer compresses older messages into an LLM-generated summary and keeps the last 10 messages in full. When a summary exists, `/api/chat` sends: system prompt + summary (as synthetic messages) + last 20 recent messages. System prompts are never trimmed.

## Settings System

### Storage Strategy
- **Server-accessible settings** (API keys, URLs, defaults) → SQLite `settings` key-value table
- **Client-only preferences** (theme, font size, density, sidebar collapse) → `localStorage`

### Server Helper (`src/lib/settings.ts`)
```typescript
// DB-first, env-fallback pattern
getGeminiApiKey()    // DB 'gemini-api-key' → env GOOGLE_GENERATIVE_AI_API_KEY
getOllamaBaseUrl()   // DB 'ollama-base-url' → default 'http://localhost:11434'
getDefaultModel()    // DB 'default-model'
getDefaultSystemPrompt() // DB 'default-system-prompt'
```

### API Route Provider Creation
All API routes (`chat`, `models`, `summarize`) create providers **per-request** using the settings helper rather than module-level singletons. This allows runtime configuration changes without server restart.

### Settings Dialog
Three tabs accessed via sidebar Settings button:
- **API & Providers**: Gemini API key (password field), Ollama URL with "Test Connection" button
- **Appearance**: Theme (Light/Dark/System cards), font size (Small/Medium/Large), message density (Compact/Comfortable/Spacious)
- **Model Defaults**: Default model selector, default system prompt, persona management (view built-in, add/delete custom)

### Collapsible Sidebar
The sidebar supports collapsed/expanded states via `useLocalStorage('sidebar-collapsed', false)`. When collapsed, it renders as a narrow icon-only strip with tooltips. Toggle via `PanelLeftClose`/`PanelLeftOpen` buttons.

## AI SDK v6 Implementation Details

### Client-Side (`useChat` hook)

```typescript
// Transport with ref-based dynamic body to avoid stale closures
const transport = useMemo(() => new DefaultChatTransport({
  api: '/api/chat',
  body: () => ({ model: selectedModelRef.current }),
}), [])

const { messages, sendMessage, status, setMessages } = useChat({ transport })
```

**SDK v6 differences from older versions:**
- No `input`, `handleInputChange`, `handleSubmit` — manage input state yourself
- No `isLoading` — use `status === 'streaming' || status === 'submitted'`
- Messages use `parts` array, not `content` string
- Send with `sendMessage({ text })`, not form submission

### Server-Side (`/api/chat`)

```typescript
import { streamText, convertToModelMessages, type UIMessage } from 'ai';

// UIMessage → ModelMessage conversion required
const modelMessages = await convertToModelMessages(messages as UIMessage[]);
const result = streamText({ model: selectedModel, messages: modelMessages });
return result.toUIMessageStreamResponse();
```

### Message Format

UIMessage (client-side):
```typescript
{ id: string, role: 'user' | 'assistant', parts: [{ type: 'text', text: string }] }
```

Extract text:
```typescript
const text = message.parts
  .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
  .map(part => part.text)
  .join('');
```

### Common Gotchas

1. **Stale closure in transport body**: Use a `ref` for dynamic values like selected model
2. **Message format mismatch**: Use `convertToModelMessages()` on the server
3. **Response format**: Use `toUIMessageStreamResponse()` not `toTextStreamResponse()`
4. **Ollama provider**: Use `baseURL` (not `baseUrl`) in `createOllama()`
5. **better-sqlite3**: Must be listed in `serverExternalPackages` in `next.config.ts`

## Testing

### Vitest (Unit + Integration)

Config: `vitest.config.ts`. Tests in `tests/`. Node environment by default; hook tests use `// @vitest-environment jsdom` per-file.

**Test structure:**
- `tests/unit/lib/` — Utility tests (`cn()`, `formatMessageTime`, `formatFullTime`)
- `tests/unit/actions/` — Server action tests (projects, chats, messages, context). Use in-memory SQLite via `tests/helpers/test-db.ts`
- `tests/unit/api/` — API route tests (models, chat, summarize). Mock AI SDK providers
- `tests/hooks/` — React hook tests (`useLocalStorage`, `usePersonas`, `useCollapseState`). jsdom environment

**In-memory SQLite pattern:**
```typescript
import { createTestDb, testDb } from '../../helpers/test-db'

vi.mock('@/db', () => ({
  get db() { return testDb },
}))

beforeEach(() => { createTestDb() }) // Fresh DB per test
```

**API route tests** require `vi.resetModules()` + `vi.doMock()` + dynamic `import()` to re-register mocks after module reset. Must mock `@/lib/settings` alongside AI SDK providers and `@/db`.

### Playwright (E2E)

Config: `playwright.config.ts`. Tests in `e2e/`. Chromium only. Auto-starts dev server via `webServer` config.

**Key behaviors:**
- Textarea is disabled until a chat is selected — tests must click "New Chat" first
- Command palette opens with `Control+k` (not `Meta+k` on Linux), closes with `Control+k` toggle or backdrop click
- The `CommandPalette` component renders a plain `div`, not a `dialog` element — locate by content (e.g., `getByPlaceholder('Type a command or search...')`)

## MCP Servers

Project-level MCP servers configured in `~/.claude.json` for this project:

| Server | Transport | Purpose |
|--------|-----------|---------|
| Context7 | plugin | Up-to-date library documentation and code examples |
| Playwright | plugin | Browser automation for live demos and visual testing |
| SQLite | stdio | Direct database inspection and querying |
| Next.js DevTools | stdio | Framework-aware debugging, server action inspection |
| GitHub | http | PR/issue management, code search |
| Sentry | http | Error tracking and stack trace analysis |
| Vercel | http | Deployment management and build log analysis |
