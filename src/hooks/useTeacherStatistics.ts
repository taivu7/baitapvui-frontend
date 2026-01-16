/**
 * useTeacherStatistics Hook
 *
 * Custom hook for fetching and managing teacher dashboard statistics.
 * Handles loading states, error handling, and data transformation.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import statisticsService from '../services/statistics'
import {
  TeacherStatistics,
  StatisticItem,
  UseTeacherStatisticsReturn,
  BadgeVariant,
  IconColorTheme,
} from '../types/statistics'

/**
 * Configuration for transforming raw statistics into display items
 */
interface StatisticConfig {
  id: string
  title: string
  icon: string
  iconColor: IconColorTheme
  getValue: (data: TeacherStatistics) => number | string
  getBadge?: (data: TeacherStatistics) => { text: string; variant: BadgeVariant } | undefined
  isPercentage?: boolean
}

/**
 * Default statistics configuration matching the design
 */
const DEFAULT_STATISTICS_CONFIG: StatisticConfig[] = [
  {
    id: 'active-assignments',
    title: 'Active Assignments',
    icon: 'assignment',
    iconColor: 'blue',
    getValue: (data) => data.activeAssignments,
    getBadge: (data) =>
      data.newAssignments > 0
        ? { text: `+${data.newAssignments} New`, variant: 'success' as BadgeVariant }
        : undefined,
  },
  {
    id: 'pending-grading',
    title: 'Submissions to Grade',
    icon: 'notification_important',
    iconColor: 'amber',
    getValue: (data) => data.pendingGrading,
    getBadge: (data) =>
      data.pendingGrading > 0
        ? { text: 'Action Needed', variant: 'warning' as BadgeVariant }
        : undefined,
  },
  {
    id: 'avg-class-score',
    title: 'Avg Class Score',
    icon: 'analytics',
    iconColor: 'purple',
    getValue: (data) => data.averageClassScore,
    getBadge: () => ({ text: 'This Week', variant: 'neutral' as BadgeVariant }),
    isPercentage: true,
  },
]

/**
 * Extended statistics configuration for additional metrics
 * Can be used when more dashboard space is available
 */
const EXTENDED_STATISTICS_CONFIG: StatisticConfig[] = [
  ...DEFAULT_STATISTICS_CONFIG,
  {
    id: 'active-classes',
    title: 'Active Classes',
    icon: 'school',
    iconColor: 'green',
    getValue: (data) => data.activeClasses,
  },
  {
    id: 'total-students',
    title: 'Total Students',
    icon: 'groups',
    iconColor: 'blue',
    getValue: (data) => data.totalStudents,
  },
  {
    id: 'completion-rate',
    title: 'Completion Rate',
    icon: 'check_circle',
    iconColor: 'green',
    getValue: (data) => data.averageCompletionRate,
    isPercentage: true,
  },
]

/**
 * Hook options
 */
interface UseTeacherStatisticsOptions {
  /** Use extended statistics set (6 items instead of 3) */
  extended?: boolean
  /** Auto-fetch on mount */
  autoFetch?: boolean
  /** Refresh interval in milliseconds (0 = disabled) */
  refreshInterval?: number
  /** Use mock data (default: true until backend is ready) */
  useMock?: boolean
}

/**
 * Transforms raw statistics data into StatisticItem array for display
 */
const transformStatistics = (
  data: TeacherStatistics,
  config: StatisticConfig[]
): StatisticItem[] => {
  return config.map((cfg) => {
    const value = cfg.getValue(data)
    const badge = cfg.getBadge?.(data)

    return {
      id: cfg.id,
      title: cfg.title,
      value: cfg.isPercentage ? `${value}%` : value,
      icon: cfg.icon,
      iconColor: cfg.iconColor,
      badge: badge,
      isPercentage: cfg.isPercentage,
    }
  })
}

/**
 * Custom hook for managing teacher dashboard statistics
 *
 * @param options - Hook configuration options
 * @returns Object containing statistics data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { statistics, isLoading, error, refetch } = useTeacherStatistics()
 *
 * if (isLoading) return <LoadingSpinner />
 * if (error) return <ErrorMessage message={error} />
 *
 * return <OverviewStatistics statistics={statistics} />
 * ```
 */
const useTeacherStatistics = (
  options: UseTeacherStatisticsOptions = {}
): UseTeacherStatisticsReturn => {
  const {
    extended = false,
    autoFetch = true,
    refreshInterval = 0,
    useMock = true,
  } = options

  const [rawData, setRawData] = useState<TeacherStatistics | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)

  // Select configuration based on extended option
  const config = useMemo(
    () => (extended ? EXTENDED_STATISTICS_CONFIG : DEFAULT_STATISTICS_CONFIG),
    [extended]
  )

  /**
   * Fetches statistics from the service
   */
  const fetchStatistics = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await statisticsService.getTeacherStatistics(useMock)
      setRawData(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load statistics'
      setError(errorMessage)
      console.error('Error fetching teacher statistics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [useMock])

  /**
   * Manual refetch function for external use
   */
  const refetch = useCallback(async () => {
    await fetchStatistics()
  }, [fetchStatistics])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchStatistics()
    }
  }, [autoFetch, fetchStatistics])

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval <= 0) return

    const intervalId = setInterval(() => {
      fetchStatistics()
    }, refreshInterval)

    return () => clearInterval(intervalId)
  }, [refreshInterval, fetchStatistics])

  // Transform raw data into display format
  const statistics = useMemo<StatisticItem[]>(() => {
    if (!rawData) return []
    return transformStatistics(rawData, config)
  }, [rawData, config])

  return {
    statistics,
    rawData,
    isLoading,
    error,
    refetch,
  }
}

export default useTeacherStatistics
