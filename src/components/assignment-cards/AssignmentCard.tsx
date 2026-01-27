/**
 * AssignmentCard Component (KAN-132, KAN-133)
 *
 * A reusable card component for displaying individual assignment information
 * on the My Assignments Dashboard.
 *
 * Features:
 * - Status badge (Active, Draft, Completed)
 * - Assignment title with hover effect
 * - Class/group name display
 * - Relevant date (due date or last edited)
 * - Action button based on status
 * - More options menu button
 * - Loading skeleton state
 * - Accessible design with ARIA attributes
 *
 * KAN-132: Base UI layout design
 * KAN-133: Reusable TypeScript component with props interface
 */

import React, { memo, useMemo } from 'react'
import {
  AssignmentCardProps,
  AssignmentCardSkeletonProps,
  AssignmentCardStatus,
  StatusBadgeConfig,
  ActionButtonConfig,
} from '../../types/assignmentCards'

/**
 * Maps assignment status to status badge configuration
 */
const getStatusBadgeConfig = (status: AssignmentCardStatus): StatusBadgeConfig => {
  const configMap: Record<AssignmentCardStatus, StatusBadgeConfig> = {
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
 * Maps assignment status to action button configuration
 */
const getActionButtonConfig = (status: AssignmentCardStatus): ActionButtonConfig => {
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
 * Formats time string (HH:MM) to 12-hour format
 * @param timeStr - Time in HH:MM format
 * @returns Formatted time (e.g., "2:30 PM")
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
 * Formats date for display
 * @param dateStr - Date in YYYY-MM-DD format
 * @param timeStr - Optional time in HH:MM format
 * @returns Formatted date string (e.g., "Feb 24" or "Feb 24, 2:30 PM")
 */
const formatDate = (dateStr: string, timeStr?: string | null): string => {
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
 * Formats relative time for last edited (drafts)
 * @param dateStr - Date in ISO format
 * @returns Relative time string (e.g., "2h ago", "3d ago")
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
      return formatDate(dateStr)
    }
  } catch {
    return 'Recently'
  }
}

/**
 * Generates meta text configuration based on status
 */
const getMetaConfig = (
  status: AssignmentCardStatus,
  className: string,
  relevantDate: string,
  relevantTime: string | null
): { icon: string; text: string; groupText: string } => {
  const groupText = className === 'Not assigned' ? 'Not assigned' : className

  if (status === 'draft') {
    return {
      icon: 'history',
      text: `Last edited ${formatLastEdited(relevantDate)}`,
      groupText,
    }
  } else if (status === 'closed') {
    return {
      icon: 'check_circle',
      text: `Closed ${formatDate(relevantDate)}`,
      groupText,
    }
  } else {
    return {
      icon: 'event',
      text: `Due ${formatDate(relevantDate, relevantTime)}`,
      groupText,
    }
  }
}

/**
 * AssignmentCard Skeleton Component
 *
 * Loading placeholder that matches the card layout structure
 */
export const AssignmentCardSkeleton: React.FC<AssignmentCardSkeletonProps> = ({
  className = '',
}) => {
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
      role="presentation"
    >
      {/* Header: Status badge and menu */}
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Content area */}
      <div className="flex-1">
        {/* Title */}
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />

        {/* Meta info: Class and date */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-1 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Progress/Status box */}
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
 * AssignmentCard Component
 *
 * Displays an individual assignment card with:
 * - Status badge indicating Active/Draft/Completed
 * - Assignment title
 * - Class/group name
 * - Relevant date (due date for published, last edited for drafts)
 * - Status-specific action button
 * - Accessible keyboard navigation
 *
 * @param props - AssignmentCardProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <AssignmentCard
 *   assignment={{
 *     assignment_id: 42,
 *     title: "Chapter 5 Quiz",
 *     class_name: "Math 101 - Section A",
 *     status: "published",
 *     relevant_date: "2026-02-15",
 *     relevant_time: "23:59"
 *   }}
 *   onClick={(assignment) => navigate(`/assignments/${assignment.assignment_id}`)}
 * />
 * ```
 */
const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onClick,
  className = '',
  isLoading = false,
}) => {
  // Show skeleton when loading
  if (isLoading) {
    return <AssignmentCardSkeleton className={className} />
  }

  const { assignment_id, title, class_name, status, relevant_date, relevant_time } =
    assignment

  // Memoize computed values
  const statusConfig = useMemo(() => getStatusBadgeConfig(status), [status])
  const actionConfig = useMemo(() => getActionButtonConfig(status), [status])
  const metaConfig = useMemo(
    () => getMetaConfig(status, class_name, relevant_date, relevant_time),
    [status, class_name, relevant_date, relevant_time]
  )

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
   * Stops propagation to prevent card click handler
   */
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClick) {
      onClick(assignment)
    }
  }

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (onClick) {
        onClick(assignment)
      }
    }
  }

  /**
   * Determine progress bar width and label based on status
   */
  const getProgressDisplay = () => {
    switch (status) {
      case 'draft':
        return {
          label: 'Status',
          value: 'Not Published',
          width: '0%',
          barColor: 'bg-gray-400',
        }
      case 'closed':
        return {
          label: 'Results',
          value: 'All Graded',
          width: '100%',
          barColor: 'bg-primary',
          valueColor: 'text-green-600 dark:text-primary',
        }
      case 'published':
      default:
        // Placeholder for future submission progress integration
        return {
          label: 'Submissions',
          value: '--/--',
          width: '0%',
          barColor: 'bg-primary',
        }
    }
  }

  const progressDisplay = getProgressDisplay()

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
        ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-surface-dark' : ''}
        ${className}
      `}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : 'article'}
      aria-labelledby={`assignment-title-${assignment_id}`}
    >
      {/* Header: Status Badge and More Options */}
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
          className="
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
            p-1 rounded-lg
            hover:bg-gray-100 dark:hover:bg-white/5
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary/50
          "
          onClick={(e) => e.stopPropagation()}
          aria-label="More options"
          aria-haspopup="menu"
          type="button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            more_vert
          </span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {/* Title */}
        <h3
          id={`assignment-title-${assignment_id}`}
          className="
            text-xl font-bold
            text-gray-900 dark:text-white
            group-hover:text-primary
            transition-colors
            mb-2
            line-clamp-2
          "
          title={title}
        >
          {title}
        </h3>

        {/* Meta Information: Class and Date */}
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-4 flex-wrap">
          {/* Class/Group Name */}
          <span className="flex items-center gap-1">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px' }}
              aria-hidden="true"
            >
              group
            </span>
            <span>{metaConfig.groupText}</span>
          </span>

          <span className="mx-1" aria-hidden="true">
            -
          </span>

          {/* Date Information */}
          <span className="flex items-center gap-1">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px' }}
              aria-hidden="true"
            >
              {metaConfig.icon}
            </span>
            <span>{metaConfig.text}</span>
          </span>
        </div>

        {/* Status/Progress Box */}
        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
              {progressDisplay.label}
            </span>
            <span
              className={`text-sm font-bold ${
                progressDisplay.valueColor || 'text-gray-900 dark:text-white'
              }`}
            >
              {progressDisplay.value}
            </span>
          </div>
          <div
            className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5"
            role="progressbar"
            aria-valuenow={status === 'closed' ? 100 : 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progressDisplay.label}: ${progressDisplay.value}`}
          >
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${progressDisplay.barColor}`}
              style={{ width: progressDisplay.width }}
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleActionClick}
        type="button"
        className={`
          w-full py-2.5
          rounded-xl
          font-bold
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-surface-dark
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

// Memoize component for performance
export default memo(AssignmentCard)
