/**
 * useTeacherClasses Hook
 *
 * Custom hook for fetching and managing teacher's classes.
 * Used in the Assignment Settings Panel for class selection.
 */

import { useState, useEffect, useCallback } from 'react'
import { ClassOption } from '../types/assignmentCreation'

/**
 * Mock classes data for development
 */
const mockClasses: ClassOption[] = [
  { id: '1', name: 'Math 101', studentCount: 32 },
  { id: '2', name: 'Physics 9B', studentCount: 28 },
  { id: '3', name: 'English 4C', studentCount: 25 },
  { id: '4', name: 'History 10A', studentCount: 30 },
  { id: '5', name: 'Chemistry 11B', studentCount: 24 },
]

/**
 * Simulates network delay for realistic loading behavior
 */
const simulateNetworkDelay = (ms: number = 600): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Return type for useTeacherClasses hook
 */
interface UseTeacherClassesReturn {
  /** Array of class options */
  classes: ClassOption[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Function to manually refresh classes */
  refetch: () => Promise<void>
}

/**
 * Hook options
 */
interface UseTeacherClassesOptions {
  /** Whether to use mock data (default: true in development) */
  useMock?: boolean
}

/**
 * Custom hook to fetch teacher's classes
 */
const useTeacherClasses = (
  options: UseTeacherClassesOptions = {}
): UseTeacherClassesReturn => {
  const { useMock = import.meta.env.DEV } = options

  const [classes, setClasses] = useState<ClassOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClasses = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (useMock) {
        // Simulate network delay
        await simulateNetworkDelay()
        setClasses(mockClasses)
      } else {
        // TODO: Replace with actual API call
        // const response = await apiClient.get<ClassesResponse>('/classes')
        // setClasses(response.data.classes)
        await simulateNetworkDelay()
        setClasses(mockClasses)
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err)
      setError('Failed to load classes. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [useMock])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  return {
    classes,
    isLoading,
    error,
    refetch: fetchClasses,
  }
}

export default useTeacherClasses
