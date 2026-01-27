/**
 * useAssignmentCards Hook
 *
 * Custom hook for fetching and managing assignment cards data
 * for the My Assignments Dashboard.
 *
 * Handles loading states, error handling, filtering, and data fetching
 * from the GET /api/v1/assignments/cards endpoint.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import assignmentCardsApi from '../services/assignmentCardsApi'
import {
  AssignmentCardData,
  AssignmentCardsFilterStatus,
  UseAssignmentCardsOptions,
  UseAssignmentCardsReturn,
} from '../types/assignmentCards'

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
 * Custom hook for managing assignment cards data
 *
 * Provides:
 * - Assignment cards fetching with loading/error states
 * - Status filtering (all, published, draft, closed)
 * - Status counts for filter tabs
 * - Refetch capability
 * - Auto-refresh interval support
 *
 * @param options - Hook configuration options
 * @returns Object containing assignment cards data, loading state, error, and filter controls
 *
 * @example
 * ```tsx
 * const {
 *   filteredAssignments,
 *   isLoading,
 *   error,
 *   refetch,
 *   statusFilter,
 *   setStatusFilter,
 *   statusCounts,
 * } = useAssignmentCards()
 *
 * if (isLoading) return <LoadingSkeleton />
 * if (error) return <ErrorMessage message={error} onRetry={refetch} />
 *
 * return (
 *   <>
 *     <FilterTabs
 *       activeFilter={statusFilter}
 *       onFilterChange={setStatusFilter}
 *       counts={statusCounts}
 *     />
 *     <AssignmentCardsGrid assignments={filteredAssignments} />
 *   </>
 * )
 * ```
 */
const useAssignmentCards = (
  options: UseAssignmentCardsOptions = {}
): UseAssignmentCardsReturn => {
  const {
    autoFetch = true,
    statusFilter: initialStatusFilter = 'all',
    useMock = shouldUseMockByDefault(),
    refreshInterval = 0,
  } = options

  // State for assignment cards data
  const [assignments, setAssignments] = useState<AssignmentCardData[]>([])
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)

  // State for filtering
  const [statusFilter, setStatusFilter] =
    useState<AssignmentCardsFilterStatus>(initialStatusFilter)

  /**
   * Fetches assignment cards from the API service
   */
  const fetchAssignmentCards = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await assignmentCardsApi.getAssignmentCards(useMock)
      setAssignments(response.assignments)
      setTotal(response.total)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load assignments. Please try again.'
      setError(errorMessage)
      console.error('Error fetching assignment cards:', err)
    } finally {
      setIsLoading(false)
    }
  }, [useMock])

  /**
   * Manual refetch function for external use
   */
  const refetch = useCallback(async () => {
    await fetchAssignmentCards()
  }, [fetchAssignmentCards])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchAssignmentCards()
    }
  }, [autoFetch, fetchAssignmentCards])

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval <= 0) return

    const intervalId = setInterval(() => {
      fetchAssignmentCards()
    }, refreshInterval)

    return () => clearInterval(intervalId)
  }, [refreshInterval, fetchAssignmentCards])

  /**
   * Filtered assignment cards based on current status filter
   */
  const filteredAssignments = useMemo(() => {
    if (statusFilter === 'all') {
      return assignments
    }
    return assignments.filter((assignment) => assignment.status === statusFilter)
  }, [assignments, statusFilter])

  /**
   * Counts by status for filter tabs
   */
  const statusCounts = useMemo(() => {
    return {
      all: assignments.length,
      published: assignments.filter((a) => a.status === 'published').length,
      draft: assignments.filter((a) => a.status === 'draft').length,
      closed: assignments.filter((a) => a.status === 'closed').length,
    }
  }, [assignments])

  return {
    assignments,
    total,
    isLoading,
    error,
    refetch,
    statusFilter,
    setStatusFilter,
    filteredAssignments,
    statusCounts,
  }
}

export default useAssignmentCards
