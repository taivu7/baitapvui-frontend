/**
 * StudentEmptyAssignments Component
 *
 * Empty state displayed when a student has no pending assignments.
 * Indicates that the student is caught up with their work.
 *
 * @component
 * @example
 * ```tsx
 * <StudentEmptyAssignments />
 * ```
 */

import React, { memo } from 'react'
import EmptyState from './EmptyState'
import { StudentEmptyStateProps } from '../../types/emptyState'

/**
 * StudentEmptyAssignments Component
 *
 * Shows an empty state when a student has no pending assignments.
 * This is a positive state indicating the student has completed their work.
 */
const StudentEmptyAssignments: React.FC<StudentEmptyStateProps> = ({
  onAction,
  className = '',
}) => {
  return (
    <EmptyState
      icon="celebration"
      iconColor="green"
      title="No Pending Assignments"
      description="You're all caught up! You have no assignments waiting to be completed. Check back later for new assignments from your teachers."
      cta={
        onAction
          ? {
              label: 'View Completed',
              onClick: onAction,
              icon: 'history',
              iconPosition: 'left',
              variant: 'secondary',
            }
          : undefined
      }
      size="md"
      className={className}
      testId="student-empty-assignments"
    />
  )
}

export default memo(StudentEmptyAssignments)
