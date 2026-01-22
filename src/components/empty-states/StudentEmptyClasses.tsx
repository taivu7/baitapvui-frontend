/**
 * StudentEmptyClasses Component
 *
 * Empty state displayed when a student is not enrolled in any classes.
 * Encourages the student to join a class using an invite code.
 *
 * @component
 * @example
 * ```tsx
 * <StudentEmptyClasses
 *   onAction={() => openJoinClassModal()}
 * />
 * ```
 */

import React, { memo } from 'react'
import EmptyState from './EmptyState'
import { StudentEmptyStateProps } from '../../types/emptyState'

/**
 * StudentEmptyClasses Component
 *
 * Shows an empty state for students who haven't joined any classes.
 * Provides a CTA to join a class using an invite code from their teacher.
 */
const StudentEmptyClasses: React.FC<StudentEmptyStateProps> = ({
  onAction,
  className = '',
}) => {
  return (
    <EmptyState
      icon="group_add"
      iconColor="blue"
      title="No Classes Yet"
      description="You haven't joined any classes. Ask your teacher for an invite code to join their class and start learning!"
      cta={
        onAction
          ? {
              label: 'Join a Class',
              onClick: onAction,
              icon: 'login',
              iconPosition: 'left',
              variant: 'primary',
            }
          : undefined
      }
      size="md"
      className={className}
      testId="student-empty-classes"
    />
  )
}

export default memo(StudentEmptyClasses)
