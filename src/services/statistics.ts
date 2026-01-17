/**
 * Statistics Service
 *
 * Handles fetching statistics data for the Teacher Dashboard.
 * Currently uses mock data since the backend API (KAN-35) is not yet implemented.
 */

import apiClient from './api'
import { TeacherStatistics, TeacherStatisticsResponse } from '../types/statistics'

/**
 * Mock statistics data for development
 * Matches backend DashboardStatistics structure
 */
const mockTeacherStatistics: TeacherStatistics = {
  total_assignments: 6,
  published_assignments: 4,
  draft_assignments: 2,
  total_classes: 5,
  total_students: 127,
  total_submissions: 156,
  pending_grading: 12,
  average_score: 85,
  submission_rate: 78,
  active_assignments: 4,
  new_assignments: 2,
}

/**
 * Simulates network delay for realistic loading behavior
 */
const simulateNetworkDelay = (ms: number = 800): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Statistics service object with methods for fetching teacher statistics
 */
const statisticsService = {
  /**
   * Fetches teacher dashboard statistics
   *
   * @param useMock - Force using mock data (default: true until backend is ready)
   * @returns Promise with teacher statistics data
   */
  getTeacherStatistics: async (useMock: boolean = true): Promise<TeacherStatistics> => {
    if (useMock) {
      // Simulate network delay for realistic UX
      await simulateNetworkDelay()

      // Return stable mock data (no randomization for consistent testing)
      return {
        ...mockTeacherStatistics,
      }
    }

    // Real API call
    try {
      const response = await apiClient.get<TeacherStatisticsResponse>('/dashboard/teacher')
      return response.data.statistics
    } catch (error) {
      console.error('Failed to fetch teacher statistics:', error)
      throw error
    }
  },

  /**
   * Fetches statistics for a specific time period
   *
   * @param period - Time period ('today', 'week', 'month')
   * @param useMock - Force using mock data
   * @returns Promise with teacher statistics data
   */
  getTeacherStatisticsByPeriod: async (
    period: 'today' | 'week' | 'month' = 'week',
    useMock: boolean = true
  ): Promise<TeacherStatistics> => {
    if (useMock) {
      await simulateNetworkDelay()

      // Adjust mock data based on period
      const multiplier = period === 'today' ? 0.3 : period === 'week' ? 1 : 4

      return {
        ...mockTeacherStatistics,
        total_submissions: Math.floor(mockTeacherStatistics.total_submissions * multiplier),
        new_assignments: Math.floor((mockTeacherStatistics.new_assignments || 0) * multiplier),
        pending_grading: Math.floor(mockTeacherStatistics.pending_grading * multiplier),
      }
    }

    // Real API call
    try {
      const response = await apiClient.get<TeacherStatisticsResponse>(
        `/dashboard/teacher?period=${period}`
      )
      return response.data.statistics
    } catch (error) {
      console.error('Failed to fetch teacher statistics by period:', error)
      throw error
    }
  },
}

export default statisticsService
