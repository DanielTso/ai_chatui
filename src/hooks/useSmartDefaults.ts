'use client'

import { useState, useEffect, useCallback } from 'react'
import { getProjectDefaults, getProjectPersonaStats } from '@/app/actions'
import { detectTopicsFromMessages } from '@/lib/topicDetection'

interface SmartSuggestion {
  suggestedPersonaId: string | null
  suggestedModel: string | null
  reason: string | null
}

/**
 * Hook for smart persona/model defaults based on:
 * 1. Explicit project-level defaults
 * 2. Usage pattern stats
 * 3. Keyword heuristics from conversation content
 */
export function useSmartDefaults(
  projectId: number | null,
  chatId: number | null,
  messageTexts: string[],
  currentPersonaId: string | null,
) {
  const [suggestion, setSuggestion] = useState<SmartSuggestion>({
    suggestedPersonaId: null,
    suggestedModel: null,
    reason: null,
  })
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't suggest if already has a persona or dismissed
    if (currentPersonaId && currentPersonaId !== 'default') return
    if (dismissed) return
    // Wait for at least 3 messages before suggesting
    if (messageTexts.length < 3) return

    let cancelled = false

    async function checkDefaults() {
      // Layer 1: Check project-level explicit defaults
      if (projectId) {
        try {
          const defaults = await getProjectDefaults(projectId)
          if (defaults.defaultPersonaId && !cancelled) {
            setSuggestion({
              suggestedPersonaId: defaults.defaultPersonaId,
              suggestedModel: defaults.defaultModel ?? null,
              reason: 'Project default',
            })
            return
          }
        } catch {
          // Skip if DB error
        }

        // Layer 2: Check usage patterns
        try {
          const stats = await getProjectPersonaStats(projectId)
          if (stats.length > 0 && !cancelled) {
            const totalMessages = stats.reduce((sum, s) => sum + (s.messageCount ?? 0), 0)
            const topPersona = stats[0]
            const usagePercent = totalMessages > 0
              ? Math.round(((topPersona.messageCount ?? 0) / totalMessages) * 100)
              : 0

            if (usagePercent >= 60 && topPersona.personaId !== 'default') {
              setSuggestion({
                suggestedPersonaId: topPersona.personaId,
                suggestedModel: topPersona.modelUsed ?? null,
                reason: `Used ${usagePercent}% of the time in this project`,
              })
              return
            }
          }
        } catch {
          // Skip if DB error
        }
      }

      // Layer 3: Keyword heuristics from conversation content
      if (messageTexts.length >= 3) {
        const topics = detectTopicsFromMessages(messageTexts)
        if (topics.length > 0 && topics[0].confidence >= 40 && !cancelled) {
          setSuggestion({
            suggestedPersonaId: topics[0].personaId,
            suggestedModel: null,
            reason: `Detected ${topics[0].topic} conversation`,
          })
        }
      }
    }

    checkDefaults()
    return () => { cancelled = true }
  }, [projectId, chatId, messageTexts.length, currentPersonaId, dismissed])

  const dismiss = useCallback(() => {
    setDismissed(true)
    setSuggestion({ suggestedPersonaId: null, suggestedModel: null, reason: null })
  }, [])

  // Reset dismissed state when chat changes
  useEffect(() => {
    setDismissed(false)
    setSuggestion({ suggestedPersonaId: null, suggestedModel: null, reason: null })
  }, [chatId])

  return {
    suggestion,
    dismissed,
    dismiss,
  }
}
