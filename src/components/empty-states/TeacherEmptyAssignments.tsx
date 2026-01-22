/**
 * TeacherEmptyAssignments Component
 *
 * Empty state displayed when a teacher has no assignments created yet.
 * Encourages the teacher to create their first assignment.
 *
 * @component
 * @example
 * ```tsx
 * <TeacherEmptyAssignments
 *   onAction={() => navigate('/assignments/new')}
 * />
 * ```
 */

import React, { memo } from 'react'
import EmptyState from './EmptyState'
import { TeacherEmptyStateProps } from '../../types/emptyState'

/**
 * TeacherEmptyAssignments Component
 *
 * Shows an empty state for teachers who haven't created any assignments.
 * Provides a CTA to create their first assignment.
 */
const TeacherEmptyAssignments: React.FC<TeacherEmptyStateProps> = ({
  onAction,
  className = '',
}) => {
  return (
    <EmptyState
      icon="assignment"
      iconColor="purple"
      title="No Assignments Yet"
      description="Create your first assignment to start engaging your students. You can add questions, set due dates, and assign to classes."
      cta={
        onAction
          ? {
              label: 'Create Assignment',
              onClick: onAction,
              icon: 'add',
              iconPosition: 'left',
              variant: 'primary',
            }
          : undefined
      }
      size="md"
      className={className}
      testId="teacher-empty-assignments"
    />
  )
}

export default memo(TeacherEmptyAssignments)
