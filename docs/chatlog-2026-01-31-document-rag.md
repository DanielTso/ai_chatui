# Chat Log: Document RAG Implementation

**Date:** 2026-01-31
**Model:** Claude Opus 4.5

---

## Summary

Implemented project-scoped document RAG (Retrieval-Augmented Generation) for Atelier AI. Users can upload documents to a project, which are then extracted, chunked, embedded, and used as context during chat.

---

## Session Timeline

### 1. Planning & Implementation

Started from an approved plan covering 9 files across 4 phases: data layer, processing pipeline, chat integration, and UI.

**Files created (3):**
- `src/lib/chunking.ts` — Overlapping sentence-aware text chunker (2000 chars/chunk, 400 overlap)
- `src/app/api/documents/route.ts` — POST (upload+extract+chunk+embed), GET (list), DELETE handlers
- `src/components/ui/ProjectDocumentsDialog.tsx` — Radix dialog with drag-drop upload, document list, delete

**Files modified (6):**
- `src/db/schema.ts` — Added `documents` and `documentChunks` tables
- `src/app/actions.ts` — Added 7 server actions for document/chunk CRUD
- `src/lib/embeddings.ts` — Added `findSimilarDocumentChunks()` function
- `src/app/api/chat/route.ts` — Added document context as a new layer (5 layers total now)
- `src/components/chat/Sidebar.tsx` — Added FileText icon button on project rows
- `src/app/page.tsx` — Wired ProjectDocumentsDialog state and handlers

**Schema pushed** to local SQLite via `drizzle-kit push`.

### 2. Local Testing via Playwright + curl

- Started dev server, navigated to app via Playwright MCP
- Created "Test RAG Project" via the UI
- Uploaded `test-document.txt` (1.1KB architecture overview with a "quantum flux capacitor" easter egg) via curl
- Verified document appeared in the dialog UI with correct metadata (TXT badge, 1.1 KB, 1 chunk, green checkmark)
- Verified chunks and 768-dim embeddings stored in SQLite

### 3. Threshold Tuning

- Initial document similarity threshold was 0.65 (plan spec)
- Testing revealed relevant document chunks scored 0.55-0.62 similarity against specific queries
- Lowered threshold to **0.5** — document content is more diverse than message-to-message similarity
- After threshold adjustment, the AI correctly referenced document content including:
  - Providers: "Google Gemini (cloud), Alibaba Qwen (cloud), Ollama (local)"
  - Context layers: "System Prompt -> Semantic Retrieval (RAG) -> Conversation Summary -> Recent Messages"
  - The fictional "quantum flux capacitor" easter egg text

### 4. Delete Testing

- Verified `DELETE /api/documents?id=N` works
- Confirmed cascade delete removes both document and chunk records

### 5. Commit & Deploy

- **Commit `08eaed0`**: `feat: add project-scoped document RAG` (9 files, +730 lines)
- Pushed to `origin/master`

### 6. CLAUDE.md Updates

- Updated API Routes section (added 3 document endpoints, changed "four-layer" to "five-layer" context)
- Updated Component Structure (added ProjectDocumentsDialog, updated Sidebar description)
- Updated lib/ section (added chunking.ts)
- Updated Database section (7 tables -> 9 tables, added document/chunk field descriptions)
- Updated Context Management (4 layers -> 5 layers, added document retrieval description)
- Added new "Document RAG" section with full pipeline and retrieval details
- **Commit `dd95588`**: `docs: update CLAUDE.md with document RAG details`

### 7. Production Deployment

- Deployed to Vercel (`vercel --prod`)
- Pushed schema to Turso production database
- **Production tests all passed:**
  - `POST /api/documents` — upload succeeded, status=ready, 1 chunk with Gemini embedding
  - `GET /api/documents?projectId=2` — listed document with full metadata
  - `DELETE /api/documents?id=1` — cascade delete confirmed

### 8. Gitignore Update

- Added `.env*.local` pattern to `.gitignore`
- **Commit `73d496b`**: `chore: ignore .env*.local files`
- Updated CLAUDE.md with note about gitignored files
- **Commit `18d5ea9`**: `docs: note gitignored env and db files in CLAUDE.md`
- Redeployed to Vercel, confirmed Turso schema still up to date

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Processing model | Synchronous (user waits) | Simpler than async; ~5s for large docs is acceptable |
| Chunk size | 2000 chars, 400 overlap | ~500 tokens/chunk balances context quality vs token budget |
| Similarity threshold | 0.5 (documents) vs 0.7 (messages) | Document chunks are broader content, naturally score lower against specific queries |
| Top-K results | 3 chunks (vs 5 for messages) | Keeps context window manageable |
| Context priority | Documents before semantic memory | Project documents are more authoritative than past conversation snippets |
| Text extraction | Reuses existing unpdf/mammoth deps | No new dependencies needed |
| Embedding pipeline | Reuses existing Ollama/Gemini 768-dim | Cross-compatible vectors, no new infrastructure |

---

## Commits

| Hash | Message |
|------|---------|
| `08eaed0` | feat: add project-scoped document RAG |
| `dd95588` | docs: update CLAUDE.md with document RAG details |
| `73d496b` | chore: ignore .env*.local files |
| `18d5ea9` | docs: note gitignored env and db files in CLAUDE.md |
