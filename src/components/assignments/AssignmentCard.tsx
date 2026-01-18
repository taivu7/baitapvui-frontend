/**
 * AssignmentCard Component
 *
 * A card component for displaying individual assignment information
 * on the Teacher Dashboard. Supports loading skeleton state.
 */

import React, { memo, useMemo } from 'react'
import { AssignmentCardProps, AssignmentStatus } from '../../types/assignments'
import AssignmentStatusBadge from './AssignmentStatusBadge'

/**
 * Maps assignment status to icon configuration
 */
const getStatusIconConfig = (
  status: AssignmentStatus
): { icon: string; colorClasses: string } => {
  const configMap: Record<AssignmentStatus, { icon: string; colorClasses: string }> = {
    draft: {
      icon: 'description',
      colorClasses: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    },
    published: {
      icon: 'assignment',
      colorClasses: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    },
    closed: {
      icon: 'assignment_turned_in',
      colorClasses: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    },
  }

  return configMap[status] || configMap.draft
}

/**
 * Formats a date string into a readable format
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timeStr - Optional time string in HH:MM format
 * @returns Formatted date string
 */
const formatDueDate = (dateStr: string, timeStr?: string): string => {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    // Check if today
    if (targetDate.getTime() === today.getTime()) {
      return timeStr ? `Today, ${formatTime(timeStr)}` : 'Today'
    }

    // Check if tomorrow
    if (targetDate.getTime() === tomorrow.getTime()) {
      return timeStr ? `Tomorrow, ${formatTime(timeStr)}` : 'Tomorrow'
    }

    // Check if in the past
    if (targetDate < today) {
      return 'Overdue'
    }

    // Calculate days difference
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 7) {
      return timeStr
        ? `In ${diffDays} days, ${formatTime(timeStr)}`
        : `In ${diffDays} days`
    }

    // Format as readable date
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    }

    // Add year if not current year
    if (date.getFullYear() !== now.getFullYear()) {
      options.year = 'numeric'
    }

    const formattedDate = date.toLocaleDateString('en-US', options)
    return timeStr ? `${formattedDate}, ${formatTime(timeStr)}` : formattedDate
  } catch {
    return dateStr
  }
}

/**
 * Formats time string from 24-hour to 12-hour format
 * @param timeStr - Time string in HH:MM format
 * @returns Formatted time string (e.g., "2:30 PM")
 */
const formatTime = (timeStr: string): string => {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  } catch {
    return timeStr
  }
}

/**
 * Skeleton loading component for the assignment card
 */
const AssignmentCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <article
      className={`
        bg-surface-light dark:bg-surface-dark
        p-5 rounded-2xl
        border border-gray-100 dark:border-gray-800
        shadow-sm
        animate-pulse
        ${className}
      `}
      aria-hidden="true"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-4">
          {/* Icon skeleton */}
          <div className="p-3 rounded-xl bg-gray-200 dark:bg-gray-700 h-12 w-12 shrink-0" />
          <div className="flex-1">
            {/* Title skeleton */}
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            {/* Meta info skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
        {/* Status badge skeleton */}
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>

      {/* Questions count skeleton */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </article>
  )
}

/**
 * AssignmentCard Component
 *
 * Displays assignment information including:
 * - Icon based on status
 * - Assignment title
 * - Assigned class name
 * - Due date and time
 * - Status badge
 * - Question count
 *
 * @param props - AssignmentCardProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <AssignmentCard
 *   assignment={{
 *     id: 1,
 *     title: 'Math Quiz',
 *     assigned_class: { class_id: 10, class_name: 'Math 101' },
 *     due_date: '2026-01-25',
 *     due_time: '14:30',
 *     status: 'published',
 *     question_count: 10,
 *     created_at: '2026-01-15T08:00:00Z',
 *     updated_at: '2026-01-16T10:30:00Z',
 *   }}
 * />
 * ```
 */
const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  isLoading = false,
  className = '',
}) => {
  // Show skeleton while loading
  if (isLoading) {
    return <AssignmentCardSkeleton className={className} />
  }

  const { title, assigned_class, due_date, due_time, status, question_count } = assignment

  // Get icon configuration based on status
  const iconConfig = useMemo(() => getStatusIconConfig(status), [status])

  // Format the due date for display
  const formattedDueDate = useMemo(
    () => formatDueDate(due_date, due_time),
    [due_date, due_time]
  )

  // Determine if the assignment is overdue
  const isOverdue = formattedDueDate === 'Overdue' && status === 'published'

  return (
    <article
      className={`
        bg-surface-light dark:bg-surface-dark
        p-5 rounded-2xl
        border border-gray-100 dark:border-gray-800
        shadow-sm
        transition-colors
        hover:border-primary/30
        group
        ${className}
      `}
      aria-labelledby={`assignment-title-${assignment.id}`}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Left: Icon and Content */}
        <div className="flex gap-4 min-w-0 flex-1">
          {/* Icon Container */}
          <div
            className={`
              p-3 rounded-xl
              ${iconConfig.colorClasses}
              flex items-center justify-center
              h-12 w-12 shrink-0
            `}
            aria-hidden="true"
          >
            <span className="material-symbols-outlined">{iconConfig.icon}</span>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Title */}
            <h4
              id={`assignment-title-${assignment.id}`}
              className="font-bold text-lg text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors"
              title={title}
            >
              {title}
            </h4>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {/* Class Name Badge */}
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-md font-medium">
                {assigned_class.class_name}
              </span>

              <span className="text-gray-400 text-xs" aria-hidden="true">
                -
              </span>

              {/* Due Date */}
              <span
                className={`
                  text-xs font-medium flex items-center gap-1
                  ${
                    isOverdue
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }
                `}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '14px' }}
                  aria-hidden="true"
                >
                  {isOverdue ? 'warning' : 'schedule'}
                </span>
                <span>{formattedDueDate}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Status Badge */}
        <AssignmentStatusBadge status={status} />
      </div>

      {/* Footer: Questions Count */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <span
          className="material-symbols-outlined text-gray-400 dark:text-gray-500"
          style={{ fontSize: '16px' }}
          aria-hidden="true"
        >
          quiz
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {question_count} {question_count === 1 ? 'question' : 'questions'}
        </span>
      </div>
    </article>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(AssignmentCard)

// Export skeleton for external use
export { AssignmentCardSkeleton }
