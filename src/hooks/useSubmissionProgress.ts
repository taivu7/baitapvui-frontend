/**
 * useSubmissionProgress Hook (KAN-43)
 *
 * Custom hook for fetching and managing submission progress data.
 * Provides efficient lookup by assignment ID for rendering progress bars
 * in the Current Assignments List on the Teacher Home Page.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import submissionProgressService from '../services/submissionProgress'
import {
  SubmissionProgressMap,
  SubmissionProgressDisplayData,
  UseSubmissionProgressOptions,
  UseSubmissionProgressReturn,
} from '../types/submissionProgress'

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
 * Custom hook for managing submission progress data
 *
 * @param options - Hook configuration options
 * @returns Object containing progress map, loading state, error, and utility functions
 *
 * @example
 * ```tsx
 * const { progressMap, isLoading, error, getProgress } = useSubmissionProgress()
 *
 * // Get progress for a specific assignment
 * const progress = getProgress(assignmentId)
 *
 * if (progress) {
 *   return <SubmissionProgressBar {...progress} />
 * }
 * ```
 */
const useSubmissionProgress = (
  options: UseSubmissionProgressOptions = {}
): UseSubmissionProgressReturn => {
  const {
    autoFetch = true,
    refreshInterval = 0,
    useMock = shouldUseMockByDefault(),
  } = options

  const [progressMap, setProgressMap] = useState<SubmissionProgressMap>(new Map())
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches submission progress from the service
   */
  const fetchProgress = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const map = await submissionProgressService.getSubmissionProgressMap(useMock)
      setProgressMap(map)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load submission progress'
      setError(errorMessage)
      console.error('Error fetching submission progress:', err)
    } finally {
      setIsLoading(false)
    }
  }, [useMock])

  /**
   * Manual refetch function for external use
   */
  const refetch = useCallback(async () => {
    await fetchProgress()
  }, [fetchProgress])

  /**
   * Gets progress data for a specific assignment ID
   * Memoized to prevent unnecessary re-renders
   */
  const getProgress = useCallback(
    (assignmentId: number): SubmissionProgressDisplayData | undefined => {
      return progressMap.get(assignmentId)
    },
    [progressMap]
  )

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchProgress()
    }
  }, [autoFetch, fetchProgress])

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval <= 0) return

    const intervalId = setInterval(() => {
      fetchProgress()
    }, refreshInterval)

    return () => clearInterval(intervalId)
  }, [refreshInterval, fetchProgress])

  // Memoize return value to prevent unnecessary re-renders
  const returnValue = useMemo(
    () => ({
      progressMap,
      isLoading,
      error,
      refetch,
      getProgress,
    }),
    [progressMap, isLoading, error, refetch, getProgress]
  )

  return returnValue
}

export default useSubmissionProgress
