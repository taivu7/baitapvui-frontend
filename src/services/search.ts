/**
 * Search Service (KAN-49)
 *
 * Handles search API calls for the global search feature on the Teacher Home Page.
 * Implements the API contract for GET /api/v1/search
 */

import apiClient from './api'
import { SearchResponse, SearchParams, SearchResultItem } from '../types/search'

/**
 * Mock search results for development
 * Simulates backend search response
 */
const mockSearchResults: SearchResultItem[] = [
  // Assignment results
  {
    id: 1,
    type: 'assignment',
    title: 'Math Homework - Chapter 3',
    description: 'Math 101 - Due Jan 25, 2026',
    href: '/teacher/assignments/1',
    metadata: { status: 'published', questionCount: 10 },
  },
  {
    id: 2,
    type: 'assignment',
    title: 'Physics Lab Report',
    description: 'Physics 9B - Due Jan 28, 2026',
    href: '/teacher/assignments/2',
    metadata: { status: 'published', questionCount: 5 },
  },
  {
    id: 3,
    type: 'assignment',
    title: 'English Vocabulary Quiz',
    description: 'English 4C - Closed',
    href: '/teacher/assignments/3',
    metadata: { status: 'closed', questionCount: 20 },
  },
  // Class results
  {
    id: 10,
    type: 'class',
    title: 'Math 101',
    description: '25 students - 3 active assignments',
    href: '/teacher/classes/10',
    metadata: { studentCount: 25, assignmentCount: 3 },
  },
  {
    id: 11,
    type: 'class',
    title: 'Physics 9B',
    description: '22 students - 2 active assignments',
    href: '/teacher/classes/11',
    metadata: { studentCount: 22, assignmentCount: 2 },
  },
  {
    id: 12,
    type: 'class',
    title: 'English 4C',
    description: '28 students - 4 active assignments',
    href: '/teacher/classes/12',
    metadata: { studentCount: 28, assignmentCount: 4 },
  },
  // Student results
  {
    id: 101,
    type: 'student',
    title: 'Minh Tuan',
    description: 'Math 101, Physics 9B',
    href: '/teacher/students/101',
    metadata: { classCount: 2, avgScore: 85 },
  },
  {
    id: 102,
    type: 'student',
    title: 'Linh Chi',
    description: 'English 4C',
    href: '/teacher/students/102',
    metadata: { classCount: 1, avgScore: 92 },
  },
  {
    id: 103,
    type: 'student',
    title: 'Bao Nam',
    description: 'Physics 9B, History 10A',
    href: '/teacher/students/103',
    metadata: { classCount: 2, avgScore: 78 },
  },
]

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
 * Filters mock results based on search query
 * Implements basic case-insensitive search matching
 */
const filterMockResults = (
  query: string,
  limit: number = 10
): SearchResultItem[] => {
  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) {
    return []
  }

  return mockSearchResults
    .filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(normalizedQuery)
      const descriptionMatch = item.description?.toLowerCase().includes(normalizedQuery)
      return titleMatch || descriptionMatch
    })
    .slice(0, limit)
}

/**
 * Search service object with methods for executing searches
 */
const searchService = {
  /**
   * Executes a search query and returns results
   *
   * @param params - Search parameters including query, limit, offset, and type filters
   * @param useMock - Force using mock data (default: based on environment)
   * @returns Promise with search response
   *
   * @example
   * ```ts
   * const response = await searchService.search({ query: 'math', limit: 10 })
   * console.log(response.results)
   * ```
   */
  search: async (
    params: SearchParams,
    useMock: boolean = shouldUseMockByDefault()
  ): Promise<SearchResponse> => {
    const { query, limit = 10, offset = 0, type } = params

    if (useMock) {
      // Simulate network delay for realistic UX
      await simulateNetworkDelay()

      // Filter mock results based on query
      let results = filterMockResults(query, limit + offset)

      // Filter by type if specified
      if (type) {
        const types = Array.isArray(type) ? type : [type]
        results = results.filter((item) => types.includes(item.type))
      }

      // Apply offset
      const paginatedResults = results.slice(offset, offset + limit)

      return {
        query,
        results: paginatedResults,
        total: results.length,
        hasMore: results.length > offset + limit,
      }
    }

    // Real API call
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('q', query)
      if (limit) queryParams.append('limit', String(limit))
      if (offset) queryParams.append('offset', String(offset))
      if (type) {
        const types = Array.isArray(type) ? type : [type]
        types.forEach((t) => queryParams.append('type', t))
      }

      const response = await apiClient.get<SearchResponse>(
        `/search?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Search failed:', error)
      throw error
    }
  },

  /**
   * Quick search with minimal parameters
   * Useful for autocomplete and quick lookups
   *
   * @param query - Search query string
   * @param limit - Maximum number of results (default: 5)
   * @param useMock - Force using mock data
   * @returns Promise with search results array
   */
  quickSearch: async (
    query: string,
    limit: number = 5,
    useMock: boolean = shouldUseMockByDefault()
  ): Promise<SearchResultItem[]> => {
    if (!query.trim()) {
      return []
    }

    const response = await searchService.search(
      { query, limit },
      useMock
    )
    return response.results
  },
}

export default searchService
