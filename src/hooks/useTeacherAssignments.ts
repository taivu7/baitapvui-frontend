/**
 * useTeacherAssignments Hook
 *
 * Custom hook for fetching and managing teacher assignments data.
 * Handles loading states, error handling, and data fetching.
 */

import { useState, useEffect, useCallback } from 'react'
import assignmentsService from '../services/assignments'
import { AssignmentSummary, UseTeacherAssignmentsReturn } from '../types/assignments'

/**
 * Determine if mock mode should be used based on environment
 * Production builds should never use mock data by default
 */
const shouldUseMockByDefault = (): boolean => {
  // In production, always use real API
  if (import.meta.env.PROD) {
    return false
  }
  // In development, use mock unless VITE_USE_REAL_API is set
  return import.meta.env.VITE_USE_REAL_API !== 'true'
}

/**
 * Hook options
 */
interface UseTeacherAssignmentsOptions {
  /** Auto-fetch on mount */
  autoFetch?: boolean
  /** Refresh interval in milliseconds (0 = disabled) */
  refreshInterval?: number
  /** Use mock data (default: based on environment) */
  useMock?: boolean
  /** Limit number of assignments returned (0 = no limit) */
  limit?: number
}

/**
 * Custom hook for managing teacher assignments data
 *
 * @param options - Hook configuration options
 * @returns Object containing assignments data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { assignments, isLoading, error, refetch } = useTeacherAssignments()
 *
 * if (isLoading) return <AssignmentsListSkeleton />
 * if (error) return <ErrorMessage message={error} onRetry={refetch} />
 *
 * return <AssignmentsList assignments={assignments} />
 * ```
 */
const useTeacherAssignments = (
  options: UseTeacherAssignmentsOptions = {}
): UseTeacherAssignmentsReturn => {
  const {
    autoFetch = true,
    refreshInterval = 0,
    useMock = shouldUseMockByDefault(),
    limit = 0,
  } = options

  const [assignments, setAssignments] = useState<AssignmentSummary[]>([])
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches assignments from the service
   */
  const fetchAssignments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (limit > 0) {
        const data = await assignmentsService.getRecentAssignments(limit, useMock)
        setAssignments(data)
        setTotal(data.length)
      } else {
        const response = await assignmentsService.getAssignmentsSummary(useMock)
        setAssignments(response.assignments)
        setTotal(response.total)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load assignments'
      setError(errorMessage)
      console.error('Error fetching teacher assignments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [useMock, limit])

  /**
   * Manual refetch function for external use
   */
  const refetch = useCallback(async () => {
    await fetchAssignments()
  }, [fetchAssignments])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchAssignments()
    }
  }, [autoFetch, fetchAssignments])

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval <= 0) return

    const intervalId = setInterval(() => {
      fetchAssignments()
    }, refreshInterval)

    return () => clearInterval(intervalId)
  }, [refreshInterval, fetchAssignments])

  return {
    assignments,
    total,
    isLoading,
    error,
    refetch,
  }
}

export default useTeacherAssignments
