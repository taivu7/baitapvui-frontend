/**
 * Submission Progress Service Tests (KAN-43)
 *
 * Unit tests for the submission progress service functions.
 * Tests data transformation, calculation utilities, and API calls.
 *
 * Note: These tests require a testing framework (Vitest or Jest) to be configured.
 * To run these tests, add Vitest or Jest to the project and configure accordingly.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import submissionProgressService, {
  calculateSubmissionPercentage,
  formatSubmissionText,
  transformProgressData,
  createProgressMap,
} from '../services/submissionProgress'
import apiClient from '../services/api'

// Mock the API client
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('Submission Progress Service Utilities', () => {
  describe('calculateSubmissionPercentage', () => {
    it('calculates correct percentage', () => {
      expect(calculateSubmissionPercentage(50, 100)).toBe(50)
      expect(calculateSubmissionPercentage(25, 100)).toBe(25)
      expect(calculateSubmissionPercentage(75, 100)).toBe(75)
    })

    it('rounds to one decimal place', () => {
      expect(calculateSubmissionPercentage(33, 100)).toBe(33)
      expect(calculateSubmissionPercentage(1, 3)).toBe(33.3)
      expect(calculateSubmissionPercentage(2, 3)).toBe(66.7)
    })

    it('returns 0 for zero total students', () => {
      expect(calculateSubmissionPercentage(10, 0)).toBe(0)
    })

    it('returns 0 for negative total students', () => {
      expect(calculateSubmissionPercentage(10, -5)).toBe(0)
    })

    it('handles 100% completion', () => {
      expect(calculateSubmissionPercentage(100, 100)).toBe(100)
      expect(calculateSubmissionPercentage(25, 25)).toBe(100)
    })

    it('handles 0% completion', () => {
      expect(calculateSubmissionPercentage(0, 100)).toBe(0)
      expect(calculateSubmissionPercentage(0, 50)).toBe(0)
    })
  })

  describe('formatSubmissionText', () => {
    it('formats submission text correctly', () => {
      expect(formatSubmissionText(12, 30)).toBe('12 / 30 submitted')
      expect(formatSubmissionText(0, 25)).toBe('0 / 25 submitted')
      expect(formatSubmissionText(25, 25)).toBe('25 / 25 submitted')
    })

    it('handles large numbers', () => {
      expect(formatSubmissionText(1000, 2000)).toBe('1000 / 2000 submitted')
    })
  })

  describe('transformProgressData', () => {
    it('transforms API data to display format', () => {
      const apiData = {
        assignment_id: 1,
        title: 'Test Assignment',
        total_students: 25,
        submitted_count: 18,
        last_submission_at: '2026-01-19T10:30:00Z',
      }

      const result = transformProgressData(apiData)

      expect(result).toEqual({
        assignmentId: 1,
        submittedCount: 18,
        totalStudents: 25,
        percentage: 72,
        displayText: '18 / 25 submitted',
        lastSubmissionAt: '2026-01-19T10:30:00Z',
      })
    })

    it('handles null last_submission_at', () => {
      const apiData = {
        assignment_id: 2,
        title: 'New Assignment',
        total_students: 30,
        submitted_count: 0,
        last_submission_at: null,
      }

      const result = transformProgressData(apiData)

      expect(result.lastSubmissionAt).toBeNull()
      expect(result.percentage).toBe(0)
    })
  })

  describe('createProgressMap', () => {
    it('creates a map from progress array', () => {
      const progressArray = [
        {
          assignment_id: 1,
          title: 'Assignment 1',
          total_students: 25,
          submitted_count: 18,
          last_submission_at: '2026-01-19T10:30:00Z',
        },
        {
          assignment_id: 2,
          title: 'Assignment 2',
          total_students: 30,
          submitted_count: 12,
          last_submission_at: '2026-01-18T15:45:00Z',
        },
      ]

      const map = createProgressMap(progressArray)

      expect(map.size).toBe(2)
      expect(map.has(1)).toBe(true)
      expect(map.has(2)).toBe(true)
      expect(map.get(1)?.submittedCount).toBe(18)
      expect(map.get(2)?.submittedCount).toBe(12)
    })

    it('handles empty array', () => {
      const map = createProgressMap([])

      expect(map.size).toBe(0)
    })
  })
})

describe('Submission Progress Service API Calls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getSubmissionProgress', () => {
    it('fetches progress from API when useMock is false', async () => {
      const mockResponse = {
        data: {
          assignments: [
            {
              assignment_id: 1,
              title: 'Test',
              total_students: 25,
              submitted_count: 18,
              last_submission_at: '2026-01-19T10:30:00Z',
            },
          ],
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      // Force real API call by passing useMock: false
      const result = await submissionProgressService.getSubmissionProgress(false)

      expect(apiClient.get).toHaveBeenCalledWith('/assignments/submission-progress')
      expect(result.assignments).toHaveLength(1)
    })

    it('returns mock data when useMock is true', async () => {
      const result = await submissionProgressService.getSubmissionProgress(true)

      // Should not call API
      expect(apiClient.get).not.toHaveBeenCalled()

      // Should return mock data
      expect(result.assignments).toBeDefined()
      expect(Array.isArray(result.assignments)).toBe(true)
    })

    it('throws error when API call fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

      await expect(
        submissionProgressService.getSubmissionProgress(false)
      ).rejects.toThrow('Network error')
    })
  })

  describe('getSubmissionProgressMap', () => {
    it('returns a map of progress data', async () => {
      const mockResponse = {
        data: {
          assignments: [
            {
              assignment_id: 1,
              title: 'Test',
              total_students: 25,
              submitted_count: 18,
              last_submission_at: '2026-01-19T10:30:00Z',
            },
          ],
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const map = await submissionProgressService.getSubmissionProgressMap(false)

      expect(map instanceof Map).toBe(true)
      expect(map.has(1)).toBe(true)
    })
  })

  describe('getAssignmentProgress', () => {
    it('returns progress for a specific assignment', async () => {
      const result = await submissionProgressService.getAssignmentProgress(1, true)

      expect(result).toBeDefined()
      expect(result?.assignmentId).toBe(1)
    })

    it('returns undefined for non-existing assignment', async () => {
      const result = await submissionProgressService.getAssignmentProgress(
        999,
        true
      )

      expect(result).toBeUndefined()
    })
  })
})
