/**
 * AssignmentDashboardCard Component
 *
 * A card component for displaying individual assignment information
 * on the My Assignments Dashboard. Based on the design from my-assignments.html.
 *
 * Features:
 * - Status badge (Active, Draft, Completed)
 * - Assignment title with hover effect
 * - Due date display
 * - Action button based on status
 * - More options menu button
 */

import React, { memo, useMemo } from 'react'
import {
  AssignmentDashboardCardProps,
  AssignmentDashboardCardSkeletonProps,
  AssignmentStatus,
} from '../../types/myAssignments'

/**
 * Status badge configuration
 */
interface StatusBadgeConfig {
  label: string
  colorClasses: string
}

/**
 * Get status badge configuration
 */
const getStatusBadgeConfig = (status: AssignmentStatus): StatusBadgeConfig => {
  const configMap: Record<AssignmentStatus, StatusBadgeConfig> = {
    published: {
      label: 'Active',
      colorClasses:
        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    },
    draft: {
      label: 'Draft',
      colorClasses:
        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    },
    closed: {
      label: 'Completed',
      colorClasses:
        'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400',
    },
  }

  return configMap[status] || configMap.draft
}

/**
 * Get action button configuration based on status
 */
const getActionButtonConfig = (
  status: AssignmentStatus
): { label: string; isPrimary: boolean } => {
  switch (status) {
    case 'published':
      return { label: 'Manage', isPrimary: false }
    case 'draft':
      return { label: 'Continue Editing', isPrimary: false }
    case 'closed':
      return { label: 'View Results', isPrimary: true }
    default:
      return { label: 'View', isPrimary: false }
  }
}

/**
 * Format time string (HH:MM) to 12-hour format
 */
const formatTime = (timeStr: string): string => {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  } catch {
    return timeStr
  }
}

/**
 * Format due date for display, optionally including time
 */
const formatDueDate = (dateStr: string, timeStr?: string): string => {
  try {
    const date = new Date(dateStr)
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    }
    let formatted = date.toLocaleDateString('en-US', options)
    if (timeStr) {
      formatted += `, ${formatTime(timeStr)}`
    }
    return formatted
  } catch {
    return dateStr
  }
}

/**
 * Format last edited time for drafts
 */
const formatLastEdited = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      return 'Just now'
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return formatDueDate(dateStr)
    }
  } catch {
    return 'Recently'
  }
}

/**
 * AssignmentDashboardCard Skeleton Component
 */
export const AssignmentDashboardCardSkeleton: React.FC<
  AssignmentDashboardCardSkeletonProps
> = ({ className = '' }) => {
  return (
    <article
      className={`
        bg-surface-light dark:bg-surface-dark
        p-6 rounded-2xl
        border border-gray-100 dark:border-gray-800
        shadow-sm
        flex flex-col h-full
        animate-pulse
        ${className}
      `}
      aria-hidden="true"
    >
      {/* Header with status and menu */}
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Title */}
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />

        {/* Meta info */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Progress box */}
        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>

      {/* Action button */}
      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </article>
  )
}

/**
 * AssignmentDashboardCard Component
 *
 * Displays an assignment card with status, title, due date, and action button.
 *
 * @param props - AssignmentDashboardCardProps
 * @returns JSX.Element
 */
const AssignmentDashboardCard: React.FC<AssignmentDashboardCardProps> = ({
  assignment,
  onClick,
  className = '',
}) => {
  const { title, status, due_date, due_time, updated_at } = assignment

  // Get status badge configuration
  const statusConfig = useMemo(() => getStatusBadgeConfig(status), [status])

  // Get action button configuration
  const actionConfig = useMemo(() => getActionButtonConfig(status), [status])

  // Format the due date or last edited time
  const metaText = useMemo(() => {
    if (status === 'draft') {
      return {
        icon: 'history',
        text: `Last edited ${formatLastEdited(updated_at)}`,
      }
    } else if (status === 'closed') {
      return {
        icon: 'check_circle',
        text: `Closed ${formatDueDate(due_date)}`,
      }
    } else {
      return {
        icon: 'event',
        text: `Due ${formatDueDate(due_date, due_time)}`,
      }
    }
  }, [status, due_date, due_time, updated_at])

  /**
   * Handle card click
   */
  const handleClick = () => {
    if (onClick) {
      onClick(assignment)
    }
  }

  /**
   * Handle action button click
   */
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClick) {
      onClick(assignment)
    }
  }

  return (
    <article
      className={`
        bg-surface-light dark:bg-surface-dark
        p-6 rounded-2xl
        border border-gray-100 dark:border-gray-800
        shadow-sm
        hover:border-primary/50
        transition-all
        group
        flex flex-col h-full
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick ? handleClick : undefined}
      aria-labelledby={`assignment-title-${assignment.id}`}
    >
      {/* Header with Status Badge and Menu */}
      <div className="flex justify-between items-start mb-4">
        {/* Status Badge */}
        <span
          className={`
            px-3 py-1
            rounded-full
            text-xs font-bold
            uppercase tracking-wider
            ${statusConfig.colorClasses}
          `}
          role="status"
          aria-label={`Status: ${statusConfig.label}`}
        >
          {statusConfig.label}
        </span>

        {/* More Options Button */}
        <button
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          onClick={(e) => e.stopPropagation()}
          aria-label="More options"
          aria-haspopup="menu"
        >
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Title */}
        <h3
          id={`assignment-title-${assignment.id}`}
          className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors mb-2 line-clamp-2"
          title={title}
        >
          {title}
        </h3>

        {/* Meta Information */}
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-4">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px' }}
            aria-hidden="true"
          >
            {metaText.icon}
          </span>
          <span>{metaText.text}</span>
        </div>

        {/* Status Box (placeholder for progress/status info) */}
        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
              {status === 'draft' ? 'Status' : status === 'closed' ? 'Results' : 'Submissions'}
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {status === 'draft'
                ? 'Not Published'
                : status === 'closed'
                ? 'All Graded'
                : '--/--'}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                status === 'closed'
                  ? 'bg-primary w-full'
                  : status === 'draft'
                  ? 'bg-gray-400 w-0'
                  : 'bg-primary w-0'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleActionClick}
        className={`
          w-full py-2.5
          rounded-xl
          font-bold
          transition-colors
          ${
            actionConfig.isPrimary
              ? 'bg-primary text-[#0d3b1e] hover:bg-green-400 shadow-sm'
              : 'bg-[#f0f4f2] dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/20 text-[#0d3b1e] dark:text-primary'
          }
        `}
      >
        {actionConfig.label}
      </button>
    </article>
  )
}

export default memo(AssignmentDashboardCard)
