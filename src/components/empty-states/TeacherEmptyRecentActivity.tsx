/**
 * TeacherEmptyRecentActivity Component
 *
 * Empty state displayed in the Recent Activity Feed section on the
 * Teacher Home Page when there is no recent activity to show.
 * Provides a clear CTA to guide teachers toward creating content
 * that will generate activity.
 *
 * @component
 * @example
 * ```tsx
 * <TeacherEmptyRecentActivity
 *   onAction={() => navigate('/teacher/assignments/new')}
 * />
 * ```
 */

import React, { memo } from 'react'
import EmptyState from './EmptyState'
import { TeacherEmptyStateProps } from '../../types/emptyState'

/**
 * Extended props for TeacherEmptyRecentActivity
 * Supports both primary and secondary CTAs for flexibility
 */
interface TeacherEmptyRecentActivityProps extends TeacherEmptyStateProps {
  /** Optional secondary action handler (e.g., invite students) */
  onSecondaryAction?: () => void
}

/**
 * TeacherEmptyRecentActivity Component
 *
 * Shows an empty state for the Recent Activity Feed when there is no
 * recent activity. Activity is generated when students interact with
 * assignments, so the CTA encourages teachers to create assignments
 * or invite students.
 *
 * This component is designed for the sidebar section of the Home Page
 * and uses a smaller size variant (sm) to fit within the layout.
 */
const TeacherEmptyRecentActivity: React.FC<TeacherEmptyRecentActivityProps> = ({
  onAction,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <EmptyState
      icon="history"
      iconColor="amber"
      title="No Recent Activity"
      description="Activity from your students will appear here. Create an assignment or invite students to get started."
      cta={
        onAction
          ? {
              label: 'Create assignment',
              onClick: onAction,
              icon: 'add',
              iconPosition: 'left',
              variant: 'primary',
            }
          : undefined
      }
      secondaryCta={
        onSecondaryAction
          ? {
              label: 'Invite students',
              onClick: onSecondaryAction,
              icon: 'person_add',
              iconPosition: 'left',
              variant: 'outline',
            }
          : undefined
      }
      size="sm"
      className={className}
      testId="teacher-empty-recent-activity"
    />
  )
}

export default memo(TeacherEmptyRecentActivity)
