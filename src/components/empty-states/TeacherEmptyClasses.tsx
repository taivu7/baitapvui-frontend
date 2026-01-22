/**
 * TeacherEmptyClasses Component
 *
 * Empty state displayed when a teacher has no classes created yet.
 * Encourages the teacher to create their first class.
 *
 * @component
 * @example
 * ```tsx
 * <TeacherEmptyClasses
 *   onAction={() => navigate('/classes/new')}
 * />
 * ```
 */

import React, { memo } from 'react'
import EmptyState from './EmptyState'
import { TeacherEmptyStateProps } from '../../types/emptyState'

/**
 * TeacherEmptyClasses Component
 *
 * Shows an empty state for teachers who haven't created any classes.
 * Provides a CTA to create their first class.
 */
const TeacherEmptyClasses: React.FC<TeacherEmptyStateProps> = ({
  onAction,
  className = '',
}) => {
  return (
    <EmptyState
      icon="school"
      iconColor="blue"
      title="No Classes Yet"
      description="Create your first class to start organizing your students and assignments. Classes help you manage groups of students efficiently."
      cta={
        onAction
          ? {
              label: 'Create Class',
              onClick: onAction,
              icon: 'add',
              iconPosition: 'left',
              variant: 'primary',
            }
          : undefined
      }
      size="md"
      className={className}
      testId="teacher-empty-classes"
    />
  )
}

export default memo(TeacherEmptyClasses)
