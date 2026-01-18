/**
 * AssignmentStatusBadge Component
 *
 * Displays a status badge for assignments with appropriate colors:
 * - Draft: Yellow/Amber
 * - Published: Green
 * - Closed: Gray
 */

import React, { memo } from 'react'
import { AssignmentStatus, AssignmentStatusBadgeProps } from '../../types/assignments'

/**
 * Status configuration mapping status to display properties
 */
interface StatusConfig {
  label: string
  colorClasses: string
  icon?: string
}

/**
 * Maps assignment status to display configuration
 */
const getStatusConfig = (status: AssignmentStatus): StatusConfig => {
  const statusMap: Record<AssignmentStatus, StatusConfig> = {
    draft: {
      label: 'Draft',
      colorClasses: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      icon: 'edit_note',
    },
    published: {
      label: 'Published',
      colorClasses: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      icon: 'check_circle',
    },
    closed: {
      label: 'Closed',
      colorClasses: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
      icon: 'lock',
    },
  }

  return statusMap[status] || statusMap.draft
}

/**
 * AssignmentStatusBadge Component
 *
 * Displays a pill-shaped badge indicating the assignment status.
 * Includes an icon and colored styling based on the status type.
 *
 * @param props - AssignmentStatusBadgeProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <AssignmentStatusBadge status="published" />
 * <AssignmentStatusBadge status="draft" className="ml-2" />
 * ```
 */
const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const config = getStatusConfig(status)

  return (
    <span
      className={`
        inline-flex items-center gap-1
        text-xs font-semibold
        px-2.5 py-1
        rounded-full
        ${config.colorClasses}
        ${className}
      `}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {config.icon && (
        <span
          className="material-symbols-outlined text-sm"
          aria-hidden="true"
          style={{ fontSize: '14px' }}
        >
          {config.icon}
        </span>
      )}
      {config.label}
    </span>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(AssignmentStatusBadge)
