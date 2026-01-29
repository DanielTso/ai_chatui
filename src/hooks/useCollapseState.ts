'use client'

import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

interface CollapseState {
  quickChats: boolean
  projects: boolean
  archived: boolean
  projectChats: Record<number, boolean>
}

const defaultState: CollapseState = {
  quickChats: false,
  projects: false,
  archived: true, // Archived section collapsed by default
  projectChats: {},
}

export function useCollapseState() {
  const [state, setState] = useLocalStorage<CollapseState>('sidebar-collapse-state', defaultState)

  const toggleQuickChats = useCallback(() => {
    setState(prev => ({ ...prev, quickChats: !prev.quickChats }))
  }, [setState])

  const toggleProjects = useCallback(() => {
    setState(prev => ({ ...prev, projects: !prev.projects }))
  }, [setState])

  const toggleArchived = useCallback(() => {
    setState(prev => ({ ...prev, archived: !prev.archived }))
  }, [setState])

  const toggleProjectChats = useCallback((projectId: number) => {
    setState(prev => ({
      ...prev,
      projectChats: {
        ...prev.projectChats,
        [projectId]: !prev.projectChats[projectId],
      },
    }))
  }, [setState])

  const isProjectCollapsed = useCallback((projectId: number) => {
    return state.projectChats[projectId] ?? false
  }, [state.projectChats])

  return {
    quickChatsCollapsed: state.quickChats,
    projectsCollapsed: state.projects,
    archivedCollapsed: state.archived,
    toggleQuickChats,
    toggleProjects,
    toggleArchived,
    toggleProjectChats,
    isProjectCollapsed,
  }
}
