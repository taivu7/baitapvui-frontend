/**
 * TeacherEmptySubmissions Component
 *
 * Empty state displayed when a teacher has no pending submissions to grade.
 * Indicates that all grading is up-to-date.
 *
 * @component
 * @example
 * ```tsx
 * <TeacherEmptySubmissions />
 * ```
 */

import React, { memo } from 'react'
import EmptyState from './EmptyState'
import { TeacherEmptyStateProps } from '../../types/emptyState'

/**
 * TeacherEmptySubmissions Component
 *
 * Shows an empty state when there are no submissions pending review.
 * This is a positive state indicating the teacher is caught up on grading.
 */
const TeacherEmptySubmissions: React.FC<TeacherEmptyStateProps> = ({
  onAction,
  className = '',
}) => {
  return (
    <EmptyState
      icon="task_alt"
      iconColor="green"
      title="All Caught Up!"
      description="You have no pending submissions to grade. Great job staying on top of your grading! New submissions will appear here when students complete their assignments."
      cta={
        onAction
          ? {
              label: 'View All Submissions',
              onClick: onAction,
              icon: 'history',
              iconPosition: 'left',
              variant: 'secondary',
            }
          : undefined
      }
      size="md"
      className={className}
      testId="teacher-empty-submissions"
    />
  )
}

export default memo(TeacherEmptySubmissions)
