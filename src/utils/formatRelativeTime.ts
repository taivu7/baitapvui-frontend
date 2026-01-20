/**
 * Relative Time Formatting Utility
 *
 * Provides human-readable relative time formatting for timestamps.
 * Used by the Recent Activity Feed component.
 */

/**
 * Time intervals in seconds
 */
const TIME_INTERVALS = {
  year: 31536000,
  month: 2592000,
  week: 604800,
  day: 86400,
  hour: 3600,
  minute: 60,
  second: 1,
} as const

type TimeInterval = keyof typeof TIME_INTERVALS

/**
 * Formats a timestamp as a human-readable relative time string
 *
 * @param timestamp - ISO 8601 timestamp string or Date object
 * @returns Relative time string (e.g., "2 mins ago", "1 hour ago", "3 days ago")
 *
 * @example
 * ```ts
 * formatRelativeTime(new Date(Date.now() - 120000)) // "2 mins ago"
 * formatRelativeTime('2024-01-15T10:00:00Z') // "3 days ago" (if current date is Jan 18)
 * formatRelativeTime(new Date()) // "just now"
 * ```
 */
export const formatRelativeTime = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const now = new Date()
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)

  // Handle future dates or invalid dates
  if (secondsAgo < 0 || isNaN(secondsAgo)) {
    return 'just now'
  }

  // Just now (less than 10 seconds)
  if (secondsAgo < 10) {
    return 'just now'
  }

  // Find the appropriate time interval
  for (const [unit, secondsInUnit] of Object.entries(TIME_INTERVALS)) {
    const interval = Math.floor(secondsAgo / secondsInUnit)

    if (interval >= 1) {
      const unitLabel = getTimeUnitLabel(unit as TimeInterval, interval)
      return `${interval} ${unitLabel} ago`
    }
  }

  return 'just now'
}

/**
 * Gets the appropriate singular or plural form of a time unit
 */
const getTimeUnitLabel = (unit: TimeInterval, count: number): string => {
  const labels: Record<TimeInterval, { singular: string; plural: string }> = {
    year: { singular: 'year', plural: 'years' },
    month: { singular: 'month', plural: 'months' },
    week: { singular: 'week', plural: 'weeks' },
    day: { singular: 'day', plural: 'days' },
    hour: { singular: 'hour', plural: 'hours' },
    minute: { singular: 'min', plural: 'mins' },
    second: { singular: 'sec', plural: 'secs' },
  }

  return count === 1 ? labels[unit].singular : labels[unit].plural
}

/**
 * Formats a timestamp as a date string for accessibility
 *
 * @param timestamp - ISO 8601 timestamp string or Date object
 * @returns Formatted date string for screen readers
 *
 * @example
 * ```ts
 * formatAccessibleDate('2024-01-15T10:30:00Z')
 * // "January 15, 2024 at 10:30 AM"
 * ```
 */
export const formatAccessibleDate = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
