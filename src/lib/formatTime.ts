export function formatMessageTime(date: Date | string | number): string {
  const messageDate = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - messageDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  // Just now (< 1 min)
  if (diffMins < 1) {
    return 'Just now'
  }

  // Minutes ago (< 60 mins)
  if (diffMins < 60) {
    return `${diffMins}m ago`
  }

  // Hours ago (< 24 hours)
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }

  // Days ago (< 7 days)
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }

  // Older: show date
  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export function formatFullTime(date: Date | string | number): string {
  const messageDate = new Date(date)
  return messageDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
