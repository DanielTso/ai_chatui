# Chat Log: UI Refinements & Multimodal Image Input

**Date:** 2026-01-31
**Model:** Claude Opus 4.5

---

## Summary

Multiple sessions covering UI refinements (Smart Chat, project landing page, input toolbar, document preview) and the implementation of multimodal image input support. Images can now be uploaded, pasted, or drag-dropped into the chat input. They're sent as native AI SDK `FileUIPart` parts (Gemini/Qwen process them natively), persisted in a new `message_attachments` DB table, and displayed inline in message bubbles.

---

## Session Timeline

### 1. UI Refinements (commits `867fb99` through `dca7ed6`)

**CreateProjectDialog** (`a267ca9`): Replaced native `prompt()` with a styled Radix dialog for project creation.

**Smart Chat** (`afa8b14`): Added a "Smart Chat" dropdown button (Zap icon) in the sidebar with "Quick Chat" (standalone) and per-project destinations. Works in both expanded and collapsed sidebar modes.

**Empty state branding** (`5bd35f7`): Replaced "Select a Chat" header with centered Atelier AI logo and branding when no chat is active.

**Input toolbar** (`2479e2a`): Moved ModelSelect from ChatHeader to the input toolbar area so it's accessible before starting a conversation. Toolbar (ModelSelect, PersonaSelector, System Prompt, Attach, semantic memory indicator) is always visible, including the empty state.

**Project landing page** (`a43f9e5`, `5eaeb37`): Two-column layout when clicking a project without selecting a chat — chat list (left) with titles, first-message previews, dates; files panel (right) with document cards, drag-drop upload, progress bar, indexing status.

**Document preview** (`ccd670b`): `DocumentPreviewDialog` shows full extracted text from document chunks with overlap deduplication. Opened by clicking file cards on the project landing page.

**CLAUDE.md updates** (`384b940`, `dca7ed6`): Kept project docs in sync after each major feature.

### 2. Multimodal Image Input (`88aeb31`)

**Schema**: Added `message_attachments` table (10th table) with `messageId`, `chatId`, `filename`, `mediaType`, `dataUrl` (base64), `fileSize`, and indexes. Pushed to both local SQLite and Turso production.

**Server actions**: `saveMessageAttachments()` and `getChatAttachments()` for persisting and loading image attachments.

**Image utilities** (`src/lib/fileAttachments.ts`): `AttachedImage` interface, `isImageFile()` (PNG/JPEG/GIF/WebP), `fileToAttachedImage()` (client-side FileReader → data URL).

**ChatInputArea changes**:
- `processFiles` split: images processed client-side (no server call), text files still go through `/api/extract`
- Paste handler on textarea detects `image/*` clipboard items
- Image thumbnail grid (80×80, object-cover) with filename overlay and remove button
- File input `accept` attribute includes image types
- 10MB per-image limit with toast error

**page.tsx changes**:
- `attachedImages` state + `pendingImagesRef` for capturing images before state clears
- `handleSendMessage` builds `FileUIPart[]` and calls `sendMessage({ text, files })`
- User message save effect persists images via `saveMessageAttachments` after getting the message ID
- `loadMessages` fetches `getChatAttachments` in parallel, groups by messageId, appends `file` parts to UIMessage

**MessagesList changes**: `getMessageImages()` extracts `file` parts with `image/*` media types; renders as clickable inline images (max 300×300) in user message bubbles.

**Server-side**: `/api/chat` required **zero changes** — `convertToModelMessages()` handles `FileUIPart` natively.

### 3. CLAUDE.md Update (`3a08c24`)

Updated 8 sections: Data Flow, Component Structure, Lib, Database (9→10 tables), new Multimodal Image Input section, Message Format (multimodal examples), Common Gotchas (#12), Input Toolbar.

### 4. Browser Testing (Playwright)

Verified end-to-end via Playwright MCP:
1. **Attach button** → file picker → test image (200×200 PNG) thumbnail appeared in input area
2. **Send with text + image** → auto-created standalone quick chat "Image Description Request"
3. **AI response** → Qwen Flash responded (text-only model, can't process images — expected)
4. **Persistence** → Page reload → navigated to chat → image loaded from `message_attachments` table and rendered inline in user message bubble
5. **Semantic memory** → 2 embeddings stored via Ollama for text content

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Image storage | Base64 data URLs in SQLite `data_url` column | Simple, no file system or object storage needed; works with libSQL/Turso; images are typically small (< 10MB) |
| Client-side image processing | FileReader → data URL (no server call) | Images don't need text extraction; avoids unnecessary round-trip; keeps the UX instant |
| `pendingImagesRef` pattern | Capture images in ref before clearing state | The `useEffect` that saves user messages fires after `sendMessage` updates the messages array; by that time `attachedImages` state is already cleared |
| No `/api/chat` changes | `convertToModelMessages()` handles `FileUIPart` | AI SDK v6 natively converts data URL file parts to inline base64 for each provider |
| Separate `message_attachments` table | Not stored in `messages.content` | Keeps text content clean for embeddings/search; images are large blobs that would bloat the messages table; allows efficient per-chat batch loading |

---

## Provider Compatibility

| Provider | Vision Support | Notes |
|----------|---------------|-------|
| Gemini | Full native | All Gemini models support vision |
| Qwen (DashScope) | Model-dependent | `qwen-vl-*` models support vision; `qwen-flash`/`qwen-plus` are text-only |
| Ollama | Model-dependent | `llava`, `bakllava` work; text-only models will error |

---

## Commits

| Hash | Message |
|------|---------|
| `867fb99` | docs: update chat log with RAG fix and README rewrite |
| `a43f9e5` | feat: add project landing page with chat previews |
| `a267ca9` | fix: replace native prompt() with styled CreateProjectDialog |
| `afa8b14` | feat: Smart Chat button with dropdown, auto-create on send |
| `5bd35f7` | fix: replace "Select a Chat" header with Atelier AI branding |
| `2479e2a` | feat: move model selector and toolbar to input area, always visible |
| `384b940` | docs: update CLAUDE.md with project landing page, Smart Chat, input toolbar changes |
| `5eaeb37` | feat: two-column project landing page with files panel |
| `ccd670b` | feat: document preview dialog, drag-drop upload on files panel |
| `dca7ed6` | docs: update CLAUDE.md with document preview dialog and drag-drop upload |
| `88aeb31` | feat: multimodal image input — upload, paste, drag-drop with inline display |
| `3a08c24` | docs: update CLAUDE.md with multimodal image input support |
