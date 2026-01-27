/**
 * Assignment Cards API Service
 *
 * Handles fetching assignment card data for the My Assignments Dashboard.
 * Implements the API call to GET /api/v1/assignments/cards
 */

import apiClient from './api'
import { AssignmentCardsResponse, AssignmentCardData } from '../types/assignmentCards'

/**
 * Mock assignment cards data for development
 * Matches backend AssignmentCardsResponse structure from GET /api/v1/assignments/cards
 */
const mockAssignmentCardsData: AssignmentCardsResponse = {
  assignments: [
    {
      assignment_id: 1,
      title: 'Math Homework - Chapter 3',
      class_name: 'Class 5A',
      status: 'published',
      relevant_date: '2026-02-24',
      relevant_time: '14:30',
    },
    {
      assignment_id: 2,
      title: 'English Vocab Quiz: Unit 5',
      class_name: 'Class 4C',
      status: 'draft',
      relevant_date: '2026-01-27',
      relevant_time: null,
    },
    {
      assignment_id: 3,
      title: 'Physics Lab Report',
      class_name: 'Class 9B',
      status: 'closed',
      relevant_date: '2026-02-15',
      relevant_time: '18:00',
    },
    {
      assignment_id: 4,
      title: 'Biology: Cell Structures',
      class_name: 'Class 8A',
      status: 'published',
      relevant_date: '2026-02-28',
      relevant_time: '16:00',
    },
    {
      assignment_id: 5,
      title: 'History Essay - World War II',
      class_name: 'Not assigned',
      status: 'draft',
      relevant_date: '2026-01-25',
      relevant_time: null,
    },
    {
      assignment_id: 6,
      title: 'Chemistry Quiz: Periodic Table',
      class_name: 'Class 10A',
      status: 'published',
      relevant_date: '2026-02-20',
      relevant_time: '10:00',
    },
    {
      assignment_id: 7,
      title: 'Geography: Climate Zones',
      class_name: 'Class 7B',
      status: 'closed',
      relevant_date: '2026-02-10',
      relevant_time: '14:00',
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
 * Assignment Cards API service object
 */
const assignmentCardsApi = {
  /**
   * Fetches all assignment cards for the logged-in teacher
   *
   * @param useMock - Force using mock data (default: based on environment)
   * @returns Promise with assignment cards response
   */
  getAssignmentCards: async (
    useMock: boolean = shouldUseMockByDefault()
  ): Promise<AssignmentCardsResponse> => {
    if (useMock) {
      // Simulate network delay for realistic UX
      await simulateNetworkDelay()

      // Return stable mock data (deep copy to prevent mutations)
      return {
        assignments: [...mockAssignmentCardsData.assignments],
        total: mockAssignmentCardsData.total,
      }
    }

    // Real API call
    try {
      const response = await apiClient.get<AssignmentCardsResponse>('/assignments/cards')
      return response.data
    } catch (error) {
      console.error('Failed to fetch assignment cards:', error)
      throw error
    }
  },

  /**
   * Fetches a single assignment card by ID
   *
   * @param assignmentId - Assignment ID
   * @param useMock - Force using mock data
   * @returns Promise with assignment card data or null
   */
  getAssignmentCardById: async (
    assignmentId: number,
    useMock: boolean = shouldUseMockByDefault()
  ): Promise<AssignmentCardData | null> => {
    if (useMock) {
      await simulateNetworkDelay(500)

      const assignment = mockAssignmentCardsData.assignments.find(
        (a) => a.assignment_id === assignmentId
      )
      return assignment || null
    }

    try {
      const response = await apiClient.get<AssignmentCardData>(
        `/assignments/cards/${assignmentId}`
      )
      return response.data
    } catch (error) {
      console.error(`Failed to fetch assignment card ${assignmentId}:`, error)
      throw error
    }
  },
}

export default assignmentCardsApi
