/**
 * RecentActivityFeed Component
 *
 * Displays a chronological list of recent activities for teachers.
 * Supports loading, empty, error, and data states.
 *
 * @ticket KAN-46 - [FE] Build recent activity feed UI
 */

import React, { memo, useMemo } from 'react'
import { Activity, ActivityType, ActivityIconConfig, RecentActivityFeedProps } from '../../types/activity'
import { formatRelativeTime, formatAccessibleDate } from '../../utils/formatRelativeTime'
import useRecentActivities from '../../hooks/useRecentActivities'

/**
 * Icon configuration for different activity types
 */
const ACTIVITY_ICONS: Record<ActivityType, ActivityIconConfig> = {
  assignment_created: {
    icon: 'add_circle',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  assignment_published: {
    icon: 'publish',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  assignment_updated: {
    icon: 'edit',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  submission_received: {
    icon: 'assignment_turned_in',
    bgColor: 'bg-primary/20 dark:bg-primary/10',
    iconColor: 'text-primary dark:text-green-400',
  },
  submission_graded: {
    icon: 'grading',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  student_joined: {
    icon: 'person_add',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  class_created: {
    icon: 'school',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  system: {
    icon: 'info',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-500 dark:text-gray-400',
  },
}

/**
 * Loading skeleton for a single activity item
 */
const ActivityItemSkeleton: React.FC = () => (
  <div className="flex gap-3 py-3 animate-pulse">
    <div className="rounded-full size-10 shrink-0 bg-gray-200 dark:bg-gray-700" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
    </div>
  </div>
)

/**
 * Loading skeleton for the activity feed
 */
const ActivityFeedSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div
    className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col divide-y divide-gray-100 dark:divide-gray-800"
    aria-label="Loading activities"
    aria-busy="true"
  >
    {Array.from({ length: count }).map((_, index) => (
      <ActivityItemSkeleton key={`skeleton-${index}`} />
    ))}
  </div>
)

/**
 * Empty state when no activities are available
 */
const EmptyState: React.FC = () => (
  <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
    <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 mb-4">
      <span className="material-symbols-outlined text-2xl">history</span>
    </div>
    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
      No Recent Activity
    </h4>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
      Activities will appear here when students submit assignments or join your classes.
    </p>
  </div>
)

/**
 * Error state with retry option
 */
interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm flex flex-col items-center text-center">
    <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 mb-3">
      <span className="material-symbols-outlined text-xl">error_outline</span>
    </div>
    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
      Failed to Load Activities
    </h4>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-green-400 text-[#0d3b1e] rounded-lg text-sm font-medium transition-colors"
        type="button"
      >
        <span className="material-symbols-outlined text-sm">refresh</span>
        Try Again
      </button>
    )}
  </div>
)

/**
 * Individual activity item component
 */
interface ActivityItemInternalProps {
  activity: Activity
  isFirst: boolean
  isLast: boolean
}

const ActivityItem: React.FC<ActivityItemInternalProps> = memo(({ activity, isFirst, isLast }) => {
  const iconConfig = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.system
  const relativeTime = useMemo(() => formatRelativeTime(activity.timestamp), [activity.timestamp])
  const accessibleDate = useMemo(() => formatAccessibleDate(activity.timestamp), [activity.timestamp])

  const isSystemActivity = activity.type === 'system'

  return (
    <article
      className={`flex gap-3 py-3 ${isFirst ? 'pt-0' : ''} ${isLast ? 'pb-0' : ''}`}
      aria-label={`Activity: ${activity.description}`}
    >
      {/* Activity Icon */}
      <div
        className={`${iconConfig.bgColor} rounded-full size-10 shrink-0 flex items-center justify-center ${iconConfig.iconColor}`}
        aria-hidden="true"
      >
        <span className="material-symbols-outlined text-lg">{iconConfig.icon}</span>
      </div>

      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white leading-snug">
          {isSystemActivity ? (
            <>
              <span className="font-medium text-gray-500 dark:text-gray-400">System:</span>{' '}
              {activity.description}
            </>
          ) : (
            <>
              {activity.actor && (
                <span className="font-bold">{activity.actor.name}</span>
              )}{' '}
              {activity.description}
              {activity.target && !activity.description.includes(activity.target.name) && (
                <span className="font-medium text-primary"> {activity.target.name}</span>
              )}
            </>
          )}
        </p>
        <time
          dateTime={activity.timestamp}
          title={accessibleDate}
          className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block"
        >
          {relativeTime}
        </time>
      </div>
    </article>
  )
})

ActivityItem.displayName = 'ActivityItem'

/**
 * RecentActivityFeed Component
 *
 * Main component that displays a list of recent activities.
 * Handles loading, empty, error, and data states.
 *
 * @example
 * ```tsx
 * // Basic usage (uses internal hook)
 * <RecentActivityFeed />
 *
 * // With custom limit
 * <RecentActivityFeed limit={10} />
 *
 * // With custom title
 * <RecentActivityFeed title="Activity Log" />
 * ```
 */
const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  limit = 5,
  title = 'Recent Activity',
  className = '',
}) => {
  const { activities, isLoading, error, refetch } = useRecentActivities({ limit })

  return (
    <section className={`flex flex-col gap-4 ${className}`} aria-labelledby="activity-feed-title">
      {/* Section Header */}
      <header className="flex items-center justify-between">
        <h3 id="activity-feed-title" className="text-xl font-bold text-[#111813] dark:text-white">
          {title}
        </h3>
      </header>

      {/* Content States */}
      {isLoading && <ActivityFeedSkeleton count={limit} />}

      {error && !isLoading && <ErrorState message={error} onRetry={refetch} />}

      {!isLoading && !error && activities.length === 0 && <EmptyState />}

      {!isLoading && !error && activities.length > 0 && (
        <div
          className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col divide-y divide-gray-100 dark:divide-gray-800"
          role="feed"
          aria-label="Recent activity feed"
        >
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              isFirst={index === 0}
              isLast={index === activities.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default memo(RecentActivityFeed)

// Export sub-components for potential standalone use
export { ActivityFeedSkeleton, EmptyState, ErrorState, ActivityItem }
