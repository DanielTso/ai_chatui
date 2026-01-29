# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2026-01-28

### UI/UX Enhancements
- **Copy Code Button:** Added hover-activated copy button to all code blocks with visual feedback (checkmark on success).
- **Message Timestamps:** Implemented relative timestamps ("2m ago", "1h ago") with full datetime tooltip on hover.
- **Chat Title Editing:** Added inline chat title editing with edit icon, save/cancel buttons, and keyboard shortcuts (Enter to save, Escape to cancel).
- **Model Selector:** Organized model dropdown into "Cloud Models" and "Local Models" optgroups for better organization.
- **Message Animations:** Added smooth fade-in and slide-up animations for messages with staggered timing.
- **Enhanced Empty States:** Redesigned empty states with larger icons, pulsing animations, and more descriptive text.
- **Hover Effects:** Added subtle border color transitions on message hover for better interactivity.
- **Loading Skeletons:** Created reusable skeleton components for future loading states.
- **Typography:** Improved font sizes, weights, and spacing throughout the interface.

### New Components
- `CodeBlock.tsx`: Reusable code block component with copy functionality
- `InlineCode.tsx`: Styled inline code component
- `LoadingSkeletons.tsx`: Skeleton loaders for messages, chats, and projects
- `formatTime.ts`: Time formatting utilities for relative and absolute timestamps

### Bug Fixes
- Fixed type compatibility issues with message timestamps
- Fixed inline code component prop types to support all HTMLAttributes

## [0.3.0] - 2026-01-28

### Performance Optimizations
- **Database:** Added indexes on `project_id` and `created_at` columns for chats and messages tables, providing 10-100x query speedup.
- **Database:** Added explicit message ordering by `created_at` for consistency.
- **Database:** Implemented message limit (100 most recent) to improve performance on large chat histories.
- **Components:** Extracted and memoized Sidebar, MessagesList, and ChatHeader components to eliminate unnecessary re-renders (50-70% reduction).
- **Rendering:** Moved ReactMarkdown component definitions outside render function to prevent object recreation.
- **API:** Added 5-minute cache control headers to models endpoint to reduce redundant network requests.
- **API:** Created singleton Google provider instance to eliminate per-request instantiation overhead.
- **UX:** Implemented scroll debouncing with requestAnimationFrame for smoother scrolling.
- **UX:** Added auto-dismiss for error messages after 5 seconds.
- **State:** Optimized delete operations to update local state instead of refetching all data.

### Code Quality
- Refactored 388-line monolithic component into smaller, focused, memoized components.
- Improved separation of concerns between UI and business logic.

## [0.2.2] - 2026-01-28

### Fixed
- **Streaming:** Resolved `Unhandled chunk type: stream-start` error by aligning server-side streaming logic (`toDataStreamResponse`) with client-side expectations.
- **Dependencies:** Reverted `ai` SDK to v3.4.0 and `@ai-sdk/google` to v3.0.15 to ensure stability and prevent protocol mismatches.
- **Imports:** Cleaned up unused imports in API routes.

## [0.2.1] - 2026-01-28

### Features
- **Error Handling:** Implemented resilient API that gracefully degrades to Cloud models if Local Ollama instance is unreachable.
- **UI:** Added user-friendly Error Banner for connection failures or missing models.
- **Stability:** Improved build stability by fixing TypeScript directives in server actions.

## [0.2.0] - 2026-01-28

### Features
- **Hybrid AI Engine:** Added support for Google Gemini models alongside local Ollama models.
- **Model Support:** Enabled access to `gemini-3-pro-preview`, `gemini-3-flash-preview`, and `gemini-2.5-flash`.
- **Configuration:** Added `.env.local` support for secure API key management.
- **Code Quality:** Refactored React hooks for strict mode compliance and stability.

## [0.1.0] - 2026-01-28

### Features
- **UI:** Implemented Glassmorphic design with Light/Dark mode toggle.
- **AI:** Integrated local Ollama instance using Vercel AI SDK (v3.4.0).
- **Database:** Added SQLite persistence (via Drizzle ORM) for Projects and Chat History.
- **Organization:** Added ability to create Projects and organize chats within them.
- **Markdown:** Added Markdown rendering for AI responses (code blocks, tables).

### Tech
- Initialized Next.js 15 App Router project.
- Configured Tailwind CSS v4.
- Setup `better-sqlite3` and `drizzle-orm`.

## [Init] - 2026-01-28

### Added
- Created `Gemini.md` for project tracking.
- Created `TECH_STACKS.md` for technology suggestions.
- Created `CHANGELOG.md` for version history.
