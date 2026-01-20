/**
 * useRecentActivities Hook
 *
 * Custom hook for fetching and managing recent activity data for the Teacher Dashboard.
 * Handles loading states, error handling, and data fetching.
 */

import { useState, useEffect, useCallback } from 'react'
import activityService from '../services/activity'
import {
  Activity,
  UseRecentActivitiesReturn,
  UseRecentActivitiesOptions,
} from '../types/activity'

/**
 * Determine if mock mode should be used based on environment
 */
const shouldUseMockByDefault = (): boolean => {
  if (import.meta.env.PROD) {
    return false
  }
  return import.meta.env.VITE_USE_REAL_API !== 'true'
}

/**
 * Custom hook for managing recent activities on the teacher dashboard
 *
 * @param options - Hook configuration options
 * @returns Object containing activities data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { activities, isLoading, error, refetch } = useRecentActivities({ limit: 5 })
 *
 * if (isLoading) return <ActivityFeedSkeleton />
 * if (error) return <ErrorMessage message={error} onRetry={refetch} />
 *
 * return <RecentActivityFeed activities={activities} />
 * ```
 */
const useRecentActivities = (
  options: UseRecentActivitiesOptions = {}
): UseRecentActivitiesReturn => {
  const {
    limit = 5,
    autoFetch = true,
    useMock = shouldUseMockByDefault(),
  } = options

  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches activities from the service
   */
  const fetchActivities = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await activityService.getRecentActivities(limit, useMock)
      setActivities(response.activities)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load recent activities'
      setError(errorMessage)
      console.error('Error fetching recent activities:', err)
    } finally {
      setIsLoading(false)
    }
  }, [limit, useMock])

  /**
   * Manual refetch function for external use
   */
  const refetch = useCallback(async () => {
    await fetchActivities()
  }, [fetchActivities])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchActivities()
    }
  }, [autoFetch, fetchActivities])

  return {
    activities,
    isLoading,
    error,
    refetch,
  }
}

export default useRecentActivities
