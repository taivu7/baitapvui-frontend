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
 * This will be replaced with actual API calls when KAN-35 is completed
 */
const mockTeacherStatistics: TeacherStatistics = {
  activeAssignments: 4,
  newAssignments: 2,
  pendingGrading: 12,
  totalSubmissions: 156,
  activeClasses: 5,
  averageCompletionRate: 78,
  averageClassScore: 85,
  totalStudents: 127,
  lastUpdated: new Date().toISOString(),
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

      // Add some randomization to make the mock data more realistic
      const variation = () => Math.floor(Math.random() * 3) - 1 // -1, 0, or 1

      return {
        ...mockTeacherStatistics,
        activeAssignments: mockTeacherStatistics.activeAssignments + variation(),
        newAssignments: Math.max(0, mockTeacherStatistics.newAssignments + variation()),
        pendingGrading: mockTeacherStatistics.pendingGrading + variation(),
        averageClassScore: Math.min(100, Math.max(0, mockTeacherStatistics.averageClassScore + variation() * 2)),
        lastUpdated: new Date().toISOString(),
      }
    }

    // Real API call (to be used when backend is ready)
    try {
      const response = await apiClient.get<TeacherStatisticsResponse>('/dashboard/teacher/statistics')
      return response.data.data
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
        totalSubmissions: Math.floor(mockTeacherStatistics.totalSubmissions * multiplier),
        newAssignments: Math.floor(mockTeacherStatistics.newAssignments * multiplier),
        pendingGrading: Math.floor(mockTeacherStatistics.pendingGrading * multiplier),
        lastUpdated: new Date().toISOString(),
      }
    }

    // Real API call
    try {
      const response = await apiClient.get<TeacherStatisticsResponse>(
        `/dashboard/teacher/statistics?period=${period}`
      )
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch teacher statistics by period:', error)
      throw error
    }
  },
}

export default statisticsService
