/**
 * useMyAssignments Hook (KAN-125)
 *
 * Custom hook for fetching and managing teacher's assignments data
 * for the My Assignments Dashboard (KAN-117).
 *
 * Handles loading states, error handling, filtering, and data fetching
 * from the GET /api/v1/assignments endpoint.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import myAssignmentsService from '../services/myAssignments'
import {
  Assignment,
  AssignmentFilterStatus,
  UseMyAssignmentsOptions,
  UseMyAssignmentsReturn,
} from '../types/myAssignments'

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
 * Custom hook for managing teacher's assignments data
 *
 * Provides:
 * - Assignment fetching with loading/error states
 * - Status filtering (all, published, draft, closed)
 * - Status counts for filter tabs
 * - Refetch capability
 *
 * @param options - Hook configuration options
 * @returns Object containing assignments data, loading state, error, and filter controls
 *
 * @example
 * ```tsx
 * const {
 *   assignments,
 *   filteredAssignments,
 *   isLoading,
 *   error,
 *   refetch,
 *   statusFilter,
 *   setStatusFilter,
 *   statusCounts,
 * } = useMyAssignments()
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
 *     <AssignmentsList assignments={filteredAssignments} />
 *   </>
 * )
 * ```
 */
const useMyAssignments = (
  options: UseMyAssignmentsOptions = {}
): UseMyAssignmentsReturn => {
  const {
    autoFetch = true,
    statusFilter: initialStatusFilter = 'all',
    useMock = shouldUseMockByDefault(),
  } = options

  // State for assignments data
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)

  // State for filtering
  const [statusFilter, setStatusFilter] =
    useState<AssignmentFilterStatus>(initialStatusFilter)

  /**
   * Fetches assignments from the service
   */
  const fetchAssignments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await myAssignmentsService.getAssignments(useMock)
      setAssignments(response.assignments)
      setTotal(response.total)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load assignments. Please try again.'
      setError(errorMessage)
      console.error('Error fetching assignments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [useMock])

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

  /**
   * Filtered assignments based on current status filter
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

export default useMyAssignments
