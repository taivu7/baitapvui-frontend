/**
 * Activity Service
 *
 * Handles fetching recent activity data for the Teacher Dashboard.
 * Currently uses mock data since the backend API (KAN-47) is not yet implemented.
 */

import apiClient from './api'
import { Activity, RecentActivitiesResponse } from '../types/activity'

/**
 * Mock activity data for development
 * Simulates different activity types that would come from the backend
 */
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'submission_received',
    description: 'submitted Math Homework',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
    actor: {
      name: 'Minh Tuan',
    },
    target: {
      name: 'Math Homework',
      id: 'assign-1',
      type: 'assignment',
    },
  },
  {
    id: '2',
    type: 'assignment_published',
    description: 'published Science Quiz',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    actor: {
      name: 'You',
    },
    target: {
      name: 'Science Quiz',
      id: 'assign-2',
      type: 'assignment',
    },
  },
  {
    id: '3',
    type: 'submission_graded',
    description: 'graded essay for English Literature',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    actor: {
      name: 'You',
    },
    target: {
      name: 'English Literature',
      id: 'assign-3',
      type: 'assignment',
    },
  },
  {
    id: '4',
    type: 'student_joined',
    description: 'joined Class 9B',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    actor: {
      name: 'Linh Chi',
    },
    target: {
      name: 'Class 9B',
      id: 'class-1',
      type: 'class',
    },
  },
  {
    id: '5',
    type: 'assignment_created',
    description: 'created History Reading Assignment',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    actor: {
      name: 'You',
    },
    target: {
      name: 'History Reading Assignment',
      id: 'assign-4',
      type: 'assignment',
    },
  },
  {
    id: '6',
    type: 'system',
    description: 'Class 5A average score updated to 87%',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '7',
    type: 'submission_received',
    description: 'submitted Physics Lab Report',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    actor: {
      name: 'Bao Nam',
    },
    target: {
      name: 'Physics Lab Report',
      id: 'assign-5',
      type: 'assignment',
    },
  },
]

/**
 * Simulates network delay for realistic loading behavior
 */
const simulateNetworkDelay = (ms: number = 600): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Activity service object with methods for fetching recent activities
 */
const activityService = {
  /**
   * Fetches recent activities for the teacher dashboard
   *
   * @param limit - Maximum number of activities to fetch (default: 5)
   * @param useMock - Force using mock data (default: true until backend is ready)
   * @returns Promise with recent activities data
   */
  getRecentActivities: async (
    limit: number = 5,
    useMock: boolean = true
  ): Promise<RecentActivitiesResponse> => {
    if (useMock) {
      await simulateNetworkDelay()

      const limitedActivities = mockActivities.slice(0, limit)

      return {
        activities: limitedActivities,
        total: mockActivities.length,
        hasMore: mockActivities.length > limit,
      }
    }

    // Real API call (KAN-47)
    try {
      const response = await apiClient.get<RecentActivitiesResponse>(
        `/dashboard/teacher/activities?limit=${limit}`
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch recent activities:', error)
      throw error
    }
  },
}

export default activityService
