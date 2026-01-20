/**
 * Activity Types for Recent Activity Feed
 *
 * These types define the data structures used for the Recent Activity Feed
 * on the Teacher Home Page (KAN-46).
 */

/**
 * Activity types supported by the system
 */
export type ActivityType =
  | 'assignment_created'
  | 'assignment_published'
  | 'assignment_updated'
  | 'submission_received'
  | 'submission_graded'
  | 'student_joined'
  | 'class_created'
  | 'system'

/**
 * Icon configuration for different activity types
 */
export interface ActivityIconConfig {
  /** Material Symbols icon name */
  icon: string
  /** Background color class */
  bgColor: string
  /** Icon color class */
  iconColor: string
}

/**
 * Activity item data structure from API
 */
export interface Activity {
  /** Unique identifier for the activity */
  id: string
  /** Type of activity */
  type: ActivityType
  /** Short description of the activity */
  description: string
  /** ISO 8601 timestamp of when the activity occurred */
  timestamp: string
  /** Actor who performed the activity (optional for system activities) */
  actor?: {
    /** Actor's display name */
    name: string
    /** Actor's avatar URL (optional) */
    avatarUrl?: string
  }
  /** Target entity of the activity (e.g., assignment name, class name) */
  target?: {
    /** Target entity name */
    name: string
    /** Target entity ID */
    id: string
    /** Target entity type */
    type: 'assignment' | 'class' | 'submission' | 'student'
  }
  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * API response for recent activities
 */
export interface RecentActivitiesResponse {
  /** Array of activity items */
  activities: Activity[]
  /** Total count of activities (for pagination) */
  total: number
  /** Whether there are more activities to load */
  hasMore: boolean
}

/**
 * Props for the RecentActivityFeed component
 */
export interface RecentActivityFeedProps {
  /** Maximum number of activities to display */
  limit?: number
  /** Title for the section */
  title?: string
  /** Additional CSS classes */
  className?: string
  /** Callback when retry is clicked on error */
  onRetry?: () => void
}

/**
 * Props for individual ActivityItem component
 */
export interface ActivityItemProps {
  /** Activity data */
  activity: Activity
  /** Whether this is the first item (for styling) */
  isFirst?: boolean
  /** Whether this is the last item (for styling) */
  isLast?: boolean
}

/**
 * Hook return type for useRecentActivities
 */
export interface UseRecentActivitiesReturn {
  /** Array of activity items */
  activities: Activity[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Function to manually refresh activities */
  refetch: () => Promise<void>
}

/**
 * Hook options for useRecentActivities
 */
export interface UseRecentActivitiesOptions {
  /** Maximum number of activities to fetch */
  limit?: number
  /** Auto-fetch on mount */
  autoFetch?: boolean
  /** Use mock data */
  useMock?: boolean
}
