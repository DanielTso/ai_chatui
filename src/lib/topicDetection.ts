// Keyword-based topic detection heuristics (client-side, instant, free)

interface TopicMatch {
  topic: string
  personaId: string
  confidence: number
}

const TOPIC_KEYWORDS: { keywords: string[]; topic: string; personaId: string }[] = [
  {
    keywords: [
      'function', 'class', 'import', 'export', 'const', 'let', 'var',
      'typescript', 'javascript', 'python', 'react', 'node', 'api',
      'endpoint', 'database', 'sql', 'component', 'hook', 'state',
      'async', 'await', 'promise', 'interface', 'type', 'enum',
      'git', 'commit', 'branch', 'deploy', 'build', 'compile',
      'npm', 'package', 'module', 'server', 'client', 'frontend',
      'backend', 'fullstack', 'code', 'program', 'algorithm',
      'refactor', 'implement', 'develop', 'software', 'app',
    ],
    topic: 'coding',
    personaId: 'coding-assistant',
  },
  {
    keywords: [
      'error', 'bug', 'fix', 'broken', 'crash', 'fail', 'issue',
      'debug', 'trace', 'stack', 'exception', 'undefined', 'null',
      'not working', 'unexpected', 'wrong', 'incorrect', 'problem',
      'troubleshoot', 'investigate', 'diagnose', 'log', 'console',
    ],
    topic: 'debugging',
    personaId: 'debug-mode',
  },
  {
    keywords: [
      'story', 'poem', 'creative', 'write', 'fiction', 'character',
      'plot', 'narrative', 'dialogue', 'scene', 'novel', 'essay',
      'blog', 'article', 'content', 'draft', 'edit', 'prose',
      'verse', 'metaphor', 'imagery', 'brainstorm',
    ],
    topic: 'creative',
    personaId: 'creative-writer',
  },
  {
    keywords: [
      'explain', 'teach', 'learn', 'understand', 'concept', 'how does',
      'what is', 'why does', 'tutorial', 'guide', 'beginner', 'basics',
      'fundamentals', 'introduction', 'course', 'lesson', 'example',
      'analogy', 'difference between', 'compare',
    ],
    topic: 'learning',
    personaId: 'teacher',
  },
  {
    keywords: [
      'quick', 'brief', 'short', 'tldr', 'tl;dr', 'summary',
      'summarize', 'one-liner', 'concise', 'fast', 'just tell me',
    ],
    topic: 'brief',
    personaId: 'brief-mode',
  },
]

/**
 * Detect topics from user message text using keyword matching.
 * Returns suggested persona IDs with confidence scores.
 */
export function detectTopics(text: string): TopicMatch[] {
  const lowerText = text.toLowerCase()
  const matches: TopicMatch[] = []

  for (const group of TOPIC_KEYWORDS) {
    let hitCount = 0
    for (const keyword of group.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        hitCount++
      }
    }

    if (hitCount > 0) {
      // Confidence based on keyword hit ratio (capped at 95)
      const confidence = Math.min(95, Math.round((hitCount / Math.min(group.keywords.length, 5)) * 80))
      matches.push({
        topic: group.topic,
        personaId: group.personaId,
        confidence,
      })
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Analyze multiple messages to get accumulated topic detection.
 */
export function detectTopicsFromMessages(messageTexts: string[]): TopicMatch[] {
  const combined = messageTexts.join(' ')
  return detectTopics(combined)
}
