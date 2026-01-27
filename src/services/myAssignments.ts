/**
 * My Assignments Service
 *
 * Handles fetching assignments data for the My Assignments Dashboard (KAN-117).
 * Implements the API call to GET /api/v1/assignments
 */

import apiClient from './api'
import { AssignmentsResponse, Assignment } from '../types/myAssignments'

/**
 * Mock assignments data for development
 * Matches backend AssignmentsResponse structure from GET /api/v1/assignments
 */
const mockAssignmentsData: AssignmentsResponse = {
  assignments: [
    {
      id: 1,
      title: 'Math Homework - Chapter 3',
      status: 'published',
      due_date: '2026-02-24',
      due_time: '14:30',
      created_at: '2026-01-15T08:00:00Z',
      updated_at: '2026-01-16T10:30:00Z',
    },
    {
      id: 2,
      title: 'English Vocab Quiz: Unit 5',
      status: 'draft',
      due_date: '2026-02-28',
      due_time: '23:59',
      created_at: '2026-01-17T09:00:00Z',
      updated_at: '2026-01-19T14:20:00Z',
    },
    {
      id: 3,
      title: 'Physics Lab Report',
      status: 'closed',
      due_date: '2026-02-15',
      due_time: '18:00',
      created_at: '2026-01-05T11:00:00Z',
      updated_at: '2026-02-15T18:00:00Z',
    },
    {
      id: 4,
      title: 'Biology: Cell Structures',
      status: 'published',
      due_date: '2026-02-28',
      due_time: '16:00',
      created_at: '2026-01-20T07:30:00Z',
      updated_at: '2026-01-22T09:15:00Z',
    },
    {
      id: 5,
      title: 'History Essay - World War II',
      status: 'draft',
      due_date: '2026-03-05',
      due_time: '12:00',
      created_at: '2026-01-22T10:00:00Z',
      updated_at: '2026-01-22T10:00:00Z',
    },
    {
      id: 6,
      title: 'Chemistry Quiz: Periodic Table',
      status: 'published',
      due_date: '2026-02-20',
      due_time: '10:00',
      created_at: '2026-01-18T08:30:00Z',
      updated_at: '2026-01-19T11:45:00Z',
    },
    {
      id: 7,
      title: 'Geography: Climate Zones',
      status: 'closed',
      due_date: '2026-02-10',
      due_time: '14:00',
      created_at: '2026-01-01T09:00:00Z',
      updated_at: '2026-02-10T14:00:00Z',
    },
  ],
  total: 7,
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
 * My Assignments service object with methods for fetching assignment data
 */
const myAssignmentsService = {
  /**
   * Fetches all assignments for the logged-in teacher
   *
   * @param useMock - Force using mock data (default: based on environment)
   * @returns Promise with assignments response
   */
  getAssignments: async (
    useMock: boolean = shouldUseMockByDefault()
  ): Promise<AssignmentsResponse> => {
    if (useMock) {
      // Simulate network delay for realistic UX
      await simulateNetworkDelay()

      // Return stable mock data
      return { ...mockAssignmentsData }
    }

    // Real API call
    try {
      const response = await apiClient.get<AssignmentsResponse>('/assignments')
      return response.data
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
      throw error
    }
  },

  /**
   * Fetches a single assignment by ID
   *
   * @param id - Assignment ID
   * @param useMock - Force using mock data
   * @returns Promise with assignment data
   */
  getAssignmentById: async (
    id: number,
    useMock: boolean = shouldUseMockByDefault()
  ): Promise<Assignment | null> => {
    if (useMock) {
      await simulateNetworkDelay(500)

      const assignment = mockAssignmentsData.assignments.find((a) => a.id === id)
      return assignment || null
    }

    try {
      const response = await apiClient.get<Assignment>(`/assignments/${id}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch assignment ${id}:`, error)
      throw error
    }
  },
}

export default myAssignmentsService
