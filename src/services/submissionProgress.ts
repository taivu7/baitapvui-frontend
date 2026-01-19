/**
 * Submission Progress Service (KAN-43)
 *
 * Handles fetching submission progress data for assignments on the Teacher Dashboard.
 * Implements the API call to GET /api/v1/assignments/submission-progress
 */

import apiClient from './api'
import {
  SubmissionProgressResponse,
  AssignmentSubmissionProgress,
  SubmissionProgressDisplayData,
  SubmissionProgressMap,
} from '../types/submissionProgress'

/**
 * Mock submission progress data for development
 * Matches backend SubmissionProgressResponse structure
 */
const mockSubmissionProgress: SubmissionProgressResponse = {
  assignments: [
    {
      assignment_id: 1,
      title: 'Math Homework - Chapter 3',
      total_students: 25,
      submitted_count: 18,
      last_submission_at: '2026-01-19T10:30:00Z',
    },
    {
      assignment_id: 2,
      title: 'Physics Lab Report',
      total_students: 30,
      submitted_count: 12,
      last_submission_at: '2026-01-18T15:45:00Z',
    },
    {
      assignment_id: 3,
      title: 'English Vocabulary Quiz',
      total_students: 28,
      submitted_count: 28,
      last_submission_at: '2026-01-17T09:20:00Z',
    },
    {
      assignment_id: 4,
      title: 'History Essay - World War II',
      total_students: 22,
      submitted_count: 0,
      last_submission_at: null,
    },
  ],
}

/**
 * Simulates network delay for realistic loading behavior
 */
const simulateNetworkDelay = (ms: number = 600): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
 * Calculates submission percentage from counts
 * Handles edge cases like zero total students
 *
 * @param submittedCount - Number of submissions
 * @param totalStudents - Total students assigned
 * @returns Percentage value between 0 and 100
 */
export const calculateSubmissionPercentage = (
  submittedCount: number,
  totalStudents: number
): number => {
  if (totalStudents <= 0) return 0
  const percentage = (submittedCount / totalStudents) * 100
  return Math.round(percentage * 10) / 10 // Round to 1 decimal place
}

/**
 * Formats submission progress for display
 *
 * @param submittedCount - Number of submissions
 * @param totalStudents - Total students assigned
 * @returns Formatted display string (e.g., "12 / 30 submitted")
 */
export const formatSubmissionText = (
  submittedCount: number,
  totalStudents: number
): string => {
  return `${submittedCount} / ${totalStudents} submitted`
}

/**
 * Transforms raw API data into display-ready format
 *
 * @param progress - Raw assignment submission progress from API
 * @returns Processed display data with calculated values
 */
export const transformProgressData = (
  progress: AssignmentSubmissionProgress
): SubmissionProgressDisplayData => {
  return {
    assignmentId: progress.assignment_id,
    submittedCount: progress.submitted_count,
    totalStudents: progress.total_students,
    percentage: calculateSubmissionPercentage(
      progress.submitted_count,
      progress.total_students
    ),
    displayText: formatSubmissionText(
      progress.submitted_count,
      progress.total_students
    ),
    lastSubmissionAt: progress.last_submission_at,
  }
}

/**
 * Creates a lookup map from submission progress array
 *
 * @param progressArray - Array of submission progress data
 * @returns Map with assignment ID as key and display data as value
 */
export const createProgressMap = (
  progressArray: AssignmentSubmissionProgress[]
): SubmissionProgressMap => {
  const map = new Map<number, SubmissionProgressDisplayData>()

  progressArray.forEach((progress) => {
    map.set(progress.assignment_id, transformProgressData(progress))
  })

  return map
}

/**
 * Submission progress service object with methods for fetching progress data
 */
const submissionProgressService = {
  /**
   * Fetches submission progress for all assignments
   *
   * @param useMock - Force using mock data (default: based on environment)
   * @returns Promise with submission progress response
   */
  getSubmissionProgress: async (
    useMock: boolean = shouldUseMockByDefault()
  ): Promise<SubmissionProgressResponse> => {
    if (useMock) {
      // Simulate network delay for realistic UX
      await simulateNetworkDelay()

      // Return stable mock data
      return { ...mockSubmissionProgress }
    }

    // Real API call
    try {
      const response = await apiClient.get<SubmissionProgressResponse>(
        '/assignments/submission-progress'
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch submission progress:', error)
      throw error
    }
  },

  /**
   * Fetches submission progress and returns as a lookup map
   * Convenient for efficient access by assignment ID
   *
   * @param useMock - Force using mock data
   * @returns Promise with submission progress map
   */
  getSubmissionProgressMap: async (
    useMock: boolean = shouldUseMockByDefault()
  ): Promise<SubmissionProgressMap> => {
    const response = await submissionProgressService.getSubmissionProgress(useMock)
    return createProgressMap(response.assignments)
  },

  /**
   * Fetches submission progress for a specific assignment
   *
   * @param assignmentId - ID of the assignment
   * @param useMock - Force using mock data
   * @returns Promise with submission progress display data or undefined
   */
  getAssignmentProgress: async (
    assignmentId: number,
    useMock: boolean = shouldUseMockByDefault()
  ): Promise<SubmissionProgressDisplayData | undefined> => {
    const progressMap = await submissionProgressService.getSubmissionProgressMap(useMock)
    return progressMap.get(assignmentId)
  },
}

export default submissionProgressService
