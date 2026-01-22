/**
 * StudentEmptyDueDates Component
 *
 * Empty state displayed when a student has no upcoming due dates.
 * Shows that there are no imminent deadlines to worry about.
 *
 * @component
 * @example
 * ```tsx
 * <StudentEmptyDueDates />
 * ```
 */

import React, { memo } from 'react'
import EmptyState from './EmptyState'
import { StudentEmptyStateProps } from '../../types/emptyState'

/**
 * StudentEmptyDueDates Component
 *
 * Shows an empty state when a student has no upcoming deadlines.
 * This is a neutral/positive state indicating no urgent deadlines.
 */
const StudentEmptyDueDates: React.FC<StudentEmptyStateProps> = ({
  onAction,
  className = '',
}) => {
  return (
    <EmptyState
      icon="event_available"
      iconColor="primary"
      title="No Upcoming Deadlines"
      description="You have no assignments due soon. Keep up the great work! Your schedule is clear for now."
      cta={
        onAction
          ? {
              label: 'View Calendar',
              onClick: onAction,
              icon: 'calendar_month',
              iconPosition: 'left',
              variant: 'secondary',
            }
          : undefined
      }
      size="md"
      className={className}
      testId="student-empty-due-dates"
    />
  )
}

export default memo(StudentEmptyDueDates)
