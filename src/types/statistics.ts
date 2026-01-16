/**
 * Statistics Types for Teacher Dashboard
 *
 * These types define the data structures used for the Overview Statistics Cards
 * on the Teacher Home Page.
 */

/**
 * Trend direction for statistics changes
 */
export type TrendDirection = 'up' | 'down' | 'neutral'

/**
 * Badge variant types for different visual styles
 */
export type BadgeVariant = 'success' | 'warning' | 'info' | 'neutral'

/**
 * Icon color theme options matching Tailwind CSS color palette
 */
export type IconColorTheme = 'blue' | 'amber' | 'purple' | 'green' | 'orange' | 'pink' | 'red' | 'gray'

/**
 * Badge configuration for statistics cards
 */
export interface StatisticsBadge {
  /** Badge text content */
  text: string
  /** Badge visual variant */
  variant: BadgeVariant
}

/**
 * Trend indicator for showing changes in statistics
 */
export interface StatisticsTrend {
  /** Numeric change value (can be positive or negative) */
  value: number
  /** Direction of the trend */
  direction: TrendDirection
  /** Text describing the period (e.g., "vs last week", "this month") */
  periodLabel?: string
}

/**
 * Individual statistic item data structure
 */
export interface StatisticItem {
  /** Unique identifier for the statistic */
  id: string
  /** Display title for the statistic */
  title: string
  /** Current value of the statistic */
  value: number | string
  /** Material Symbols icon name */
  icon: string
  /** Color theme for the icon background */
  iconColor: IconColorTheme
  /** Optional badge to display (e.g., "+2 New", "Action Needed") */
  badge?: StatisticsBadge
  /** Optional trend indicator */
  trend?: StatisticsTrend
  /** Whether to display value as percentage */
  isPercentage?: boolean
  /** Optional description or subtitle */
  description?: string
}

/**
 * Teacher statistics overview data from API
 */
export interface TeacherStatistics {
  /** Total number of active assignments (published, not past due) */
  activeAssignments: number
  /** Number of new assignments created in the current period */
  newAssignments: number
  /** Total submissions pending grading */
  pendingGrading: number
  /** Total number of submissions received */
  totalSubmissions: number
  /** Number of active classes */
  activeClasses: number
  /** Average completion rate as a percentage (0-100) */
  averageCompletionRate: number
  /** Average class score as a percentage (0-100) */
  averageClassScore: number
  /** Total number of students across all classes */
  totalStudents: number
  /** Statistics timestamp */
  lastUpdated: string
}

/**
 * API response wrapper for teacher statistics
 */
export interface TeacherStatisticsResponse {
  data: TeacherStatistics
  success: boolean
  message?: string
}

/**
 * Props for the StatisticsCard component
 */
export interface StatisticsCardProps {
  /** Statistic item data */
  statistic: StatisticItem
  /** Loading state for skeleton display */
  isLoading?: boolean
  /** Optional click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Props for the OverviewStatistics container component
 */
export interface OverviewStatisticsProps {
  /** Array of statistics to display */
  statistics: StatisticItem[]
  /** Loading state */
  isLoading?: boolean
  /** Error state */
  error?: string | null
  /** Number of columns for grid layout (responsive defaults applied) */
  columns?: 2 | 3 | 4
  /** Optional callback for card clicks */
  onCardClick?: (statisticId: string) => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Hook return type for useTeacherStatistics
 */
export interface UseTeacherStatisticsReturn {
  /** Formatted statistics items ready for display */
  statistics: StatisticItem[]
  /** Raw statistics data from API */
  rawData: TeacherStatistics | null
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Function to manually refresh statistics */
  refetch: () => Promise<void>
}
