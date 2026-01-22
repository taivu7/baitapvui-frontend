/**
 * TeacherEmptyCurrentAssignments Component
 *
 * Empty state displayed in the Current Assignments List section on the
 * Teacher Home Page when no assignments exist.
 * Provides a clear CTA to guide teachers toward creating their first assignment.
 *
 * @component
 * @example
 * ```tsx
 * <TeacherEmptyCurrentAssignments
 *   onAction={() => navigate('/teacher/assignments/new')}
 * />
 * ```
 */

import React, { memo } from 'react'
import EmptyState from './EmptyState'
import { TeacherEmptyStateProps } from '../../types/emptyState'

/**
 * TeacherEmptyCurrentAssignments Component
 *
 * Shows an empty state for the Current Assignments section when teachers
 * have no active assignments. Provides an actionable CTA to create
 * their first assignment.
 *
 * This component is specifically designed for the Home Page section and uses
 * a smaller size variant (sm) to fit within the dashboard layout.
 */
const TeacherEmptyCurrentAssignments: React.FC<TeacherEmptyStateProps> = ({
  onAction,
  className = '',
}) => {
  return (
    <EmptyState
      icon="assignment"
      iconColor="blue"
      title="No Current Assignments"
      description="Create your first assignment to start engaging your students. Once created, active assignments will appear here."
      cta={
        onAction
          ? {
              label: 'Create your first assignment',
              onClick: onAction,
              icon: 'add',
              iconPosition: 'left',
              variant: 'primary',
            }
          : undefined
      }
      size="sm"
      className={className}
      testId="teacher-empty-current-assignments"
    />
  )
}

export default memo(TeacherEmptyCurrentAssignments)
