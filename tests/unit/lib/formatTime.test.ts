import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatMessageTime, formatFullTime } from '@/lib/formatTime'

describe('formatMessageTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Set "now" to 2025-06-15T12:00:00Z
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Just now" for < 1 minute ago', () => {
    const date = new Date('2025-06-15T11:59:30Z')
    expect(formatMessageTime(date)).toBe('Just now')
  })

  it('returns minutes ago for < 60 minutes', () => {
    const date = new Date('2025-06-15T11:45:00Z')
    expect(formatMessageTime(date)).toBe('15m ago')
  })

  it('returns hours ago for < 24 hours', () => {
    const date = new Date('2025-06-15T09:00:00Z')
    expect(formatMessageTime(date)).toBe('3h ago')
  })

  it('returns days ago for < 7 days', () => {
    const date = new Date('2025-06-13T12:00:00Z')
    expect(formatMessageTime(date)).toBe('2d ago')
  })

  it('returns date string for >= 7 days same year', () => {
    const date = new Date('2025-01-10T12:00:00Z')
    const result = formatMessageTime(date)
    expect(result).toContain('Jan')
    expect(result).toContain('10')
    // Same year — no year shown
    expect(result).not.toContain('2025')
  })

  it('includes year when different from current year', () => {
    const date = new Date('2024-03-15T12:00:00Z')
    const result = formatMessageTime(date)
    expect(result).toContain('Mar')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('accepts string input', () => {
    expect(formatMessageTime('2025-06-15T11:59:30Z')).toBe('Just now')
  })

  it('accepts numeric timestamp input', () => {
    const timestamp = new Date('2025-06-15T11:59:30Z').getTime()
    expect(formatMessageTime(timestamp)).toBe('Just now')
  })
})

describe('formatFullTime', () => {
  it('returns full date-time string', () => {
    const date = new Date('2025-06-15T14:30:00Z')
    const result = formatFullTime(date)
    expect(result).toContain('Jun')
    expect(result).toContain('15')
    expect(result).toContain('2025')
  })

  it('accepts string input', () => {
    const result = formatFullTime('2025-06-15T14:30:00Z')
    expect(result).toContain('Jun')
    expect(result).toContain('15')
  })

  it('accepts numeric timestamp', () => {
    const ts = new Date('2025-06-15T14:30:00Z').getTime()
    const result = formatFullTime(ts)
    expect(result).toContain('2025')
  })
})
