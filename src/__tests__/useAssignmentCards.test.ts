/**
 * useAssignmentCards Hook Tests
 *
 * Tests for the custom hook that fetches and manages assignment cards data.
 *
 * Validates:
 * - Data fetching
 * - Loading states
 * - Error handling
 * - Status filtering
 * - Status counts calculation
 * - Refetch functionality
 *
 * Note: Requires Vitest and @testing-library/react
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import useAssignmentCards from '../hooks/useAssignmentCards'
import assignmentCardsApi from '../services/assignmentCardsApi'
import { AssignmentCardsResponse } from '../types/assignmentCards'

// Mock the API service
vi.mock('../services/assignmentCardsApi', () => ({
  default: {
    getAssignmentCards: vi.fn(),
    getAssignmentCardById: vi.fn(),
  },
}))

/**
 * Mock assignment cards data for testing
 */
const mockAssignmentCardsResponse: AssignmentCardsResponse = {
  assignments: [
    {
      assignment_id: 1,
      title: 'Math Homework',
      class_name: 'Class 5A',
      status: 'published',
      relevant_date: '2026-02-24',
      relevant_time: '14:30',
    },
    {
      assignment_id: 2,
      title: 'English Quiz',
      class_name: 'Class 4C',
      status: 'draft',
      relevant_date: '2026-01-27',
      relevant_time: null,
    },
    {
      assignment_id: 3,
      title: 'Physics Lab',
      class_name: 'Class 9B',
      status: 'closed',
      relevant_date: '2026-02-15',
      relevant_time: '18:00',
    },
    {
      assignment_id: 4,
      title: 'Biology Quiz',
      class_name: 'Class 8A',
      status: 'published',
      relevant_date: '2026-02-28',
      relevant_time: '16:00',
    },
  ],
  total: 4,
}

describe('useAssignmentCards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementation
    vi.mocked(assignmentCardsApi.getAssignmentCards).mockResolvedValue(
      mockAssignmentCardsResponse
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // =============================================================================
  // Initial State Tests
  // =============================================================================

  describe('Initial State', () => {
    it('should start with loading true when autoFetch is true (default)', () => {
      const { result } = renderHook(() => useAssignmentCards())

      expect(result.current.isLoading).toBe(true)
    })

    it('should start with loading false when autoFetch is false', () => {
      const { result } = renderHook(() =>
        useAssignmentCards({ autoFetch: false })
      )

      expect(result.current.isLoading).toBe(false)
    })

    it('should start with empty assignments array', () => {
      const { result } = renderHook(() =>
        useAssignmentCards({ autoFetch: false })
      )

      expect(result.current.assignments).toEqual([])
    })

    it('should start with default status filter "all"', () => {
      const { result } = renderHook(() =>
        useAssignmentCards({ autoFetch: false })
      )

      expect(result.current.statusFilter).toBe('all')
    })

    it('should start with null error', () => {
      const { result } = renderHook(() =>
        useAssignmentCards({ autoFetch: false })
      )

      expect(result.current.error).toBeNull()
    })

    it('should start with total 0', () => {
      const { result } = renderHook(() =>
        useAssignmentCards({ autoFetch: false })
      )

      expect(result.current.total).toBe(0)
    })
  })

  // =============================================================================
  // Data Fetching Tests
  // =============================================================================

  describe('Data Fetching', () => {
    it('should fetch assignments on mount when autoFetch is true', async () => {
      const { result } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(assignmentCardsApi.getAssignmentCards).toHaveBeenCalled()
      expect(result.current.assignments).toEqual(mockAssignmentCardsResponse.assignments)
      expect(result.current.total).toBe(4)
    })

    it('should not fetch assignments on mount when autoFetch is false', async () => {
      renderHook(() => useAssignmentCards({ autoFetch: false }))

      // Wait a bit to ensure no fetch happens
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(assignmentCardsApi.getAssignmentCards).not.toHaveBeenCalled()
    })

    it('should set loading to false after successful fetch', async () => {
      const { result } = renderHook(() => useAssignmentCards())

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should pass useMock option to API service', async () => {
      const { result } = renderHook(() =>
        useAssignmentCards({ useMock: true })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(assignmentCardsApi.getAssignmentCards).toHaveBeenCalledWith(true)
    })
  })

  // =============================================================================
  // Error Handling Tests
  // =============================================================================

  describe('Error Handling', () => {
    it('should set error message on fetch failure', async () => {
      const errorMessage = 'Network error'
      vi.mocked(assignmentCardsApi.getAssignmentCards).mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.assignments).toEqual([])
    })

    it('should set default error message for non-Error exceptions', async () => {
      vi.mocked(assignmentCardsApi.getAssignmentCards).mockRejectedValue(
        'Unknown error'
      )

      const { result } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe(
        'Failed to load assignments. Please try again.'
      )
    })

    it('should clear error on successful refetch', async () => {
      // First, simulate an error
      vi.mocked(assignmentCardsApi.getAssignmentCards).mockRejectedValueOnce(
        new Error('Network error')
      )

      const { result } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })

      // Then, mock successful response
      vi.mocked(assignmentCardsApi.getAssignmentCards).mockResolvedValueOnce(
        mockAssignmentCardsResponse
      )

      // Refetch
      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.error).toBeNull()
      expect(result.current.assignments.length).toBeGreaterThan(0)
    })
  })

  // =============================================================================
  // Status Filtering Tests
  // =============================================================================

  describe('Status Filtering', () => {
    it('should return all assignments when filter is "all"', async () => {
      const { result } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.filteredAssignments.length).toBe(4)
    })

    it('should filter published assignments correctly', async () => {
      const { result } = renderHook(() =>
        useAssignmentCards({ statusFilter: 'published' })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.filteredAssignments.length).toBe(2)
      result.current.filteredAssignments.forEach((a) => {
        expect(a.status).toBe('published')
      })
    })

    it('should filter draft assignments correctly', async () => {
      const { result } = renderHook(() =>
        useAssignmentCards({ statusFilter: 'draft' })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.filteredAssignments.length).toBe(1)
      expect(result.current.filteredAssignments[0].status).toBe('draft')
    })

    it('should filter closed assignments correctly', async () => {
      const { result } = renderHook(() =>
        useAssignmentCards({ statusFilter: 'closed' })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.filteredAssignments.length).toBe(1)
      expect(result.current.filteredAssignments[0].status).toBe('closed')
    })

    it('should update filtered assignments when setStatusFilter is called', async () => {
      const { result } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.filteredAssignments.length).toBe(4)

      // Change filter to published
      act(() => {
        result.current.setStatusFilter('published')
      })

      expect(result.current.statusFilter).toBe('published')
      expect(result.current.filteredAssignments.length).toBe(2)
    })

    it('should accept initial status filter from options', async () => {
      const { result } = renderHook(() =>
        useAssignmentCards({ statusFilter: 'draft' })
      )

      expect(result.current.statusFilter).toBe('draft')

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.filteredAssignments.length).toBe(1)
    })
  })

  // =============================================================================
  // Status Counts Tests
  // =============================================================================

  describe('Status Counts', () => {
    it('should calculate correct status counts', async () => {
      const { result } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.statusCounts).toEqual({
        all: 4,
        published: 2,
        draft: 1,
        closed: 1,
      })
    })

    it('should return zero counts when no assignments', async () => {
      vi.mocked(assignmentCardsApi.getAssignmentCards).mockResolvedValue({
        assignments: [],
        total: 0,
      })

      const { result } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.statusCounts).toEqual({
        all: 0,
        published: 0,
        draft: 0,
        closed: 0,
      })
    })

    it('should update counts when data changes after refetch', async () => {
      const { result } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.statusCounts.all).toBe(4)

      // Mock new data with different counts
      vi.mocked(assignmentCardsApi.getAssignmentCards).mockResolvedValue({
        assignments: [
          {
            assignment_id: 10,
            title: 'New Assignment',
            class_name: 'Class 1A',
            status: 'draft',
            relevant_date: '2026-03-01',
            relevant_time: null,
          },
        ],
        total: 1,
      })

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.statusCounts).toEqual({
        all: 1,
        published: 0,
        draft: 1,
        closed: 0,
      })
    })
  })

  // =============================================================================
  // Refetch Tests
  // =============================================================================

  describe('Refetch', () => {
    it('should refetch data when refetch is called', async () => {
      const { result } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(assignmentCardsApi.getAssignmentCards).toHaveBeenCalledTimes(1)

      await act(async () => {
        await result.current.refetch()
      })

      expect(assignmentCardsApi.getAssignmentCards).toHaveBeenCalledTimes(2)
    })

    it('should set loading to true during refetch', async () => {
      const { result } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Start refetch but don't wait for it
      let refetchPromise: Promise<void>
      act(() => {
        refetchPromise = result.current.refetch()
      })

      // Loading should be true during refetch
      expect(result.current.isLoading).toBe(true)

      // Wait for refetch to complete
      await act(async () => {
        await refetchPromise
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should update assignments after refetch', async () => {
      const { result } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Mock updated data
      const updatedData: AssignmentCardsResponse = {
        assignments: [
          {
            assignment_id: 99,
            title: 'Updated Assignment',
            class_name: 'Class X',
            status: 'published',
            relevant_date: '2026-04-01',
            relevant_time: '10:00',
          },
        ],
        total: 1,
      }

      vi.mocked(assignmentCardsApi.getAssignmentCards).mockResolvedValue(updatedData)

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.assignments).toEqual(updatedData.assignments)
      expect(result.current.total).toBe(1)
    })
  })

  // =============================================================================
  // Refresh Interval Tests
  // =============================================================================

  describe('Refresh Interval', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    it('should not auto-refresh when refreshInterval is 0', async () => {
      renderHook(() => useAssignmentCards({ refreshInterval: 0 }))

      // Wait for initial fetch
      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(assignmentCardsApi.getAssignmentCards).toHaveBeenCalledTimes(1)

      // Advance time
      await act(async () => {
        vi.advanceTimersByTime(5000)
      })

      // Should still be 1 call
      expect(assignmentCardsApi.getAssignmentCards).toHaveBeenCalledTimes(1)
    })

    it('should auto-refresh when refreshInterval is set', async () => {
      renderHook(() => useAssignmentCards({ refreshInterval: 1000 }))

      // Wait for initial fetch
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      expect(assignmentCardsApi.getAssignmentCards).toHaveBeenCalledTimes(1)

      // Advance time by interval
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000)
      })

      expect(assignmentCardsApi.getAssignmentCards).toHaveBeenCalledTimes(2)

      // Advance again
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000)
      })

      expect(assignmentCardsApi.getAssignmentCards).toHaveBeenCalledTimes(3)
    })

    it('should clear interval on unmount', async () => {
      const { unmount } = renderHook(() =>
        useAssignmentCards({ refreshInterval: 1000 })
      )

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      expect(assignmentCardsApi.getAssignmentCards).toHaveBeenCalledTimes(1)

      // Unmount the hook
      unmount()

      // Advance time - should not trigger more fetches
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000)
      })

      // Should still be 1 call
      expect(assignmentCardsApi.getAssignmentCards).toHaveBeenCalledTimes(1)
    })
  })

  // =============================================================================
  // Memoization Tests
  // =============================================================================

  describe('Memoization', () => {
    it('should return same filteredAssignments reference when filter and data unchanged', async () => {
      const { result, rerender } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const firstRef = result.current.filteredAssignments

      // Rerender without any changes
      rerender()

      const secondRef = result.current.filteredAssignments

      expect(firstRef).toBe(secondRef)
    })

    it('should return new filteredAssignments reference when filter changes', async () => {
      const { result } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const firstRef = result.current.filteredAssignments

      // Change filter
      act(() => {
        result.current.setStatusFilter('published')
      })

      const secondRef = result.current.filteredAssignments

      expect(firstRef).not.toBe(secondRef)
    })

    it('should return same statusCounts reference when data unchanged', async () => {
      const { result, rerender } = renderHook(() => useAssignmentCards())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const firstRef = result.current.statusCounts

      // Rerender without any changes
      rerender()

      const secondRef = result.current.statusCounts

      expect(firstRef).toBe(secondRef)
    })
  })
})
