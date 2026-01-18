/**
 * Assignments Service
 *
 * Handles fetching assignments data for the Teacher Dashboard.
 * Implements the API call to GET /api/v1/assignments/summary
 */

import apiClient from './api'
import { AssignmentsSummaryResponse, AssignmentSummary } from '../types/assignments'

/**
 * Mock assignments data for development
 * Matches backend AssignmentsSummaryResponse structure
 */
const mockAssignmentsSummary: AssignmentsSummaryResponse = {
  assignments: [
    {
      id: 1,
      title: 'Math Homework - Chapter 3',
      assigned_class: { class_id: 10, class_name: 'Math 101' },
      due_date: '2026-01-25',
      due_time: '14:30',
      status: 'published',
      question_count: 10,
      created_at: '2026-01-15T08:00:00Z',
      updated_at: '2026-01-16T10:30:00Z',
    },
    {
      id: 2,
      title: 'Physics Lab Report',
      assigned_class: { class_id: 11, class_name: 'Physics 9B' },
      due_date: '2026-01-28',
      due_time: '23:59',
      status: 'published',
      question_count: 5,
      created_at: '2026-01-10T09:00:00Z',
      updated_at: '2026-01-12T14:20:00Z',
    },
    {
      id: 3,
      title: 'English Vocabulary Quiz',
      assigned_class: { class_id: 12, class_name: 'English 4C' },
      due_date: '2026-01-20',
      status: 'closed',
      question_count: 20,
      created_at: '2026-01-05T11:00:00Z',
      updated_at: '2026-01-20T18:00:00Z',
    },
    {
      id: 4,
      title: 'History Essay - World War II',
      assigned_class: { class_id: 13, class_name: 'History 10A' },
      due_date: '2026-01-30',
      status: 'draft',
      question_count: 3,
      created_at: '2026-01-17T07:30:00Z',
      updated_at: '2026-01-17T07:30:00Z',
    },
  ],
  total: 4,
}

/**
 * Simulates network delay for realistic loading behavior
 */
const simulateNetworkDelay = (ms: number = 800): Promise<void> => {
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
 * Assignments service object with methods for fetching assignment data
 */
const assignmentsService = {
  /**
   * Fetches assignments summary for the teacher dashboard
   *
   * @param useMock - Force using mock data (default: based on environment)
   * @returns Promise with assignments summary response
   */
  getAssignmentsSummary: async (
    useMock: boolean = shouldUseMockByDefault()
  ): Promise<AssignmentsSummaryResponse> => {
    if (useMock) {
      // Simulate network delay for realistic UX
      await simulateNetworkDelay()

      // Return stable mock data
      return { ...mockAssignmentsSummary }
    }

    // Real API call
    try {
      const response = await apiClient.get<AssignmentsSummaryResponse>('/assignments/summary')
      return response.data
    } catch (error) {
      console.error('Failed to fetch assignments summary:', error)
      throw error
    }
  },

  /**
   * Fetches a limited number of assignments for the dashboard
   *
   * @param limit - Maximum number of assignments to return
   * @param useMock - Force using mock data
   * @returns Promise with limited assignments array
   */
  getRecentAssignments: async (
    limit: number = 5,
    useMock: boolean = shouldUseMockByDefault()
  ): Promise<AssignmentSummary[]> => {
    if (useMock) {
      await simulateNetworkDelay()

      // Return limited mock data
      return mockAssignmentsSummary.assignments.slice(0, limit)
    }

    // Real API call with limit parameter
    try {
      const response = await apiClient.get<AssignmentsSummaryResponse>(
        `/assignments/summary?limit=${limit}`
      )
      return response.data.assignments
    } catch (error) {
      console.error('Failed to fetch recent assignments:', error)
      throw error
    }
  },
}

export default assignmentsService
