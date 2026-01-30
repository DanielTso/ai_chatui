// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCollapseState } from '@/hooks/useCollapseState'

describe('useCollapseState', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('has default state: archived collapsed, others expanded', () => {
    const { result } = renderHook(() => useCollapseState())
    expect(result.current.quickChatsCollapsed).toBe(false)
    expect(result.current.projectsCollapsed).toBe(false)
    expect(result.current.archivedCollapsed).toBe(true)
  })

  it('toggles quickChats section', () => {
    const { result } = renderHook(() => useCollapseState())
    act(() => {
      result.current.toggleQuickChats()
    })
    expect(result.current.quickChatsCollapsed).toBe(true)

    act(() => {
      result.current.toggleQuickChats()
    })
    expect(result.current.quickChatsCollapsed).toBe(false)
  })

  it('toggles projects section', () => {
    const { result } = renderHook(() => useCollapseState())
    act(() => {
      result.current.toggleProjects()
    })
    expect(result.current.projectsCollapsed).toBe(true)
  })

  it('toggles archived section', () => {
    const { result } = renderHook(() => useCollapseState())
    // Default is collapsed
    act(() => {
      result.current.toggleArchived()
    })
    expect(result.current.archivedCollapsed).toBe(false)
  })

  it('toggles per-project collapse independently', () => {
    const { result } = renderHook(() => useCollapseState())
    expect(result.current.isProjectCollapsed(1)).toBe(false)
    expect(result.current.isProjectCollapsed(2)).toBe(false)

    act(() => {
      result.current.toggleProjectChats(1)
    })
    expect(result.current.isProjectCollapsed(1)).toBe(true)
    expect(result.current.isProjectCollapsed(2)).toBe(false)
  })
})
