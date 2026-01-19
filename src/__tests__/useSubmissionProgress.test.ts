/**
 * useSubmissionProgress Hook Tests (KAN-43)
 *
 * Unit tests for the useSubmissionProgress custom hook.
 * Tests data fetching, state management, and error handling.
 *
 * Note: These tests require a testing framework (Vitest or Jest) to be configured.
 * To run these tests, add Vitest or Jest to the project and configure accordingly.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import useSubmissionProgress from '../hooks/useSubmissionProgress'
import submissionProgressService from '../services/submissionProgress'

// Mock the submission progress service
vi.mock('../services/submissionProgress', () => ({
  default: {
    getSubmissionProgressMap: vi.fn(),
  },
}))

describe('useSubmissionProgress', () => {
  const mockProgressMap = new Map([
    [
      1,
      {
        assignmentId: 1,
        submittedCount: 18,
        totalStudents: 25,
        percentage: 72,
        displayText: '18 / 25 submitted',
        lastSubmissionAt: '2026-01-19T10:30:00Z',
      },
    ],
    [
      2,
      {
        assignmentId: 2,
        submittedCount: 12,
        totalStudents: 30,
        percentage: 40,
        displayText: '12 / 30 submitted',
        lastSubmissionAt: '2026-01-18T15:45:00Z',
      },
    ],
  ])

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(submissionProgressService.getSubmissionProgressMap).mockResolvedValue(
      mockProgressMap
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('starts with loading state when autoFetch is true', () => {
      const { result } = renderHook(() => useSubmissionProgress())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.progressMap.size).toBe(0)
    })

    it('does not start loading when autoFetch is false', () => {
      const { result } = renderHook(() =>
        useSubmissionProgress({ autoFetch: false })
      )

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Data Fetching', () => {
    it('fetches progress data on mount when autoFetch is true', async () => {
      const { result } = renderHook(() => useSubmissionProgress())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(submissionProgressService.getSubmissionProgressMap).toHaveBeenCalled()
      expect(result.current.progressMap.size).toBe(2)
    })

    it('does not fetch on mount when autoFetch is false', async () => {
      renderHook(() => useSubmissionProgress({ autoFetch: false }))

      // Wait a bit to ensure no fetch happens
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(
        submissionProgressService.getSubmissionProgressMap
      ).not.toHaveBeenCalled()
    })
  })

  describe('getProgress Function', () => {
    it('returns progress data for existing assignment', async () => {
      const { result } = renderHook(() => useSubmissionProgress())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const progress = result.current.getProgress(1)
      expect(progress).toBeDefined()
      expect(progress?.assignmentId).toBe(1)
      expect(progress?.submittedCount).toBe(18)
      expect(progress?.totalStudents).toBe(25)
    })

    it('returns undefined for non-existing assignment', async () => {
      const { result } = renderHook(() => useSubmissionProgress())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const progress = result.current.getProgress(999)
      expect(progress).toBeUndefined()
    })
  })

  describe('Refetch Function', () => {
    it('refetches data when refetch is called', async () => {
      const { result } = renderHook(() => useSubmissionProgress())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(submissionProgressService.getSubmissionProgressMap).toHaveBeenCalledTimes(
        1
      )

      await act(async () => {
        await result.current.refetch()
      })

      expect(submissionProgressService.getSubmissionProgressMap).toHaveBeenCalledTimes(
        2
      )
    })
  })

  describe('Error Handling', () => {
    it('sets error state when fetch fails', async () => {
      vi.mocked(submissionProgressService.getSubmissionProgressMap).mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useSubmissionProgress())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
    })

    it('clears error on successful refetch', async () => {
      // First call fails
      vi.mocked(submissionProgressService.getSubmissionProgressMap).mockRejectedValueOnce(
        new Error('Network error')
      )

      const { result } = renderHook(() => useSubmissionProgress())

      await waitFor(() => {
        expect(result.current.error).toBe('Network error')
      })

      // Second call succeeds
      vi.mocked(submissionProgressService.getSubmissionProgressMap).mockResolvedValueOnce(
        mockProgressMap
      )

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.error).toBeNull()
      expect(result.current.progressMap.size).toBe(2)
    })
  })

  describe('Refresh Interval', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('sets up refresh interval when specified', async () => {
      renderHook(() =>
        useSubmissionProgress({ refreshInterval: 5000 })
      )

      // Initial fetch
      expect(submissionProgressService.getSubmissionProgressMap).toHaveBeenCalledTimes(
        1
      )

      // Advance time and check for additional fetches
      await act(async () => {
        vi.advanceTimersByTime(5000)
      })

      expect(submissionProgressService.getSubmissionProgressMap).toHaveBeenCalledTimes(
        2
      )

      await act(async () => {
        vi.advanceTimersByTime(5000)
      })

      expect(submissionProgressService.getSubmissionProgressMap).toHaveBeenCalledTimes(
        3
      )
    })

    it('clears interval on unmount', async () => {
      const { unmount } = renderHook(() =>
        useSubmissionProgress({ refreshInterval: 5000 })
      )

      unmount()

      // Advance time after unmount
      await act(async () => {
        vi.advanceTimersByTime(10000)
      })

      // Should only have been called once (initial fetch)
      expect(submissionProgressService.getSubmissionProgressMap).toHaveBeenCalledTimes(
        1
      )
    })
  })
})
