// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePersonas } from '@/hooks/usePersonas'

describe('usePersonas', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('provides 6 default personas', () => {
    const { result } = renderHook(() => usePersonas())
    expect(result.current.defaultPersonas).toHaveLength(6)
    expect(result.current.personas).toHaveLength(6)
  })

  it('addPersona creates a custom persona', () => {
    const { result } = renderHook(() => usePersonas())
    act(() => {
      result.current.addPersona({ name: 'Custom', icon: '🎭', prompt: 'Be custom' })
    })
    expect(result.current.personas).toHaveLength(7)
    expect(result.current.customPersonas).toHaveLength(1)
    expect(result.current.customPersonas[0].name).toBe('Custom')
    expect(result.current.customPersonas[0].id).toMatch(/^custom-/)
  })

  it('deletePersona removes a custom persona', () => {
    const { result } = renderHook(() => usePersonas())
    let newId: string
    act(() => {
      const p = result.current.addPersona({ name: 'Temp', icon: '🗑️', prompt: 'temp' })
      newId = p.id
    })
    expect(result.current.personas).toHaveLength(7)

    act(() => {
      result.current.deletePersona(newId!)
    })
    expect(result.current.personas).toHaveLength(6)
  })

  it('getPersonaById finds a persona', () => {
    const { result } = renderHook(() => usePersonas())
    const found = result.current.getPersonaById('coding-assistant')
    expect(found).toBeDefined()
    expect(found!.name).toBe('Coding Assistant')
  })

  it('getPersonaByPrompt with null returns Default', () => {
    const { result } = renderHook(() => usePersonas())
    const found = result.current.getPersonaByPrompt(null)
    expect(found).toBeDefined()
    expect(found!.id).toBe('default')
  })
})
