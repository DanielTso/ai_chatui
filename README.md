# Glassmorphic Local AI Chat

A beautiful, local-first AI chat interface built with Next.js, Tailwind CSS, and Ollama.

## Features
- **Local AI:** Connects to your local Ollama instance.
- **Privacy:** Chats are stored locally in a SQLite database (`sqlite.db`).
- **Organization:** Group chats into Projects.
- **UI:** Modern Glassmorphism design with Dark/Light mode.
- **Markdown:** Renders code blocks and formatted text.

## Prerequisites
1.  **Ollama**: Must be installed and running (`ollama serve`).
2.  **Node.js**: v18 or higher.

## Setup
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Initialize the database:
    ```bash
    npx drizzle-kit push
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000).

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4
- **Database:** SQLite + Drizzle ORM
- **AI:** Vercel AI SDK + Ollama