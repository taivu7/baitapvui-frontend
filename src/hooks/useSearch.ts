/**
 * useSearch Hook (KAN-49)
 *
 * Custom hook for managing global search state and API calls.
 * Handles debouncing, loading states, error handling, and search execution.
 *
 * @example
 * ```tsx
 * const {
 *   query,
 *   debouncedQuery,
 *   results,
 *   isLoading,
 *   error,
 *   setQuery,
 *   clearSearch,
 *   search
 * } = useSearch({ debounceDelay: 300 })
 *
 * return (
 *   <SearchInput
 *     value={query}
 *     onChange={setQuery}
 *     isLoading={isLoading}
 *     error={error}
 *     results={results}
 *   />
 * )
 * ```
 */

import { useState, useCallback, useEffect } from 'react'
import {
  UseSearchReturn,
  UseSearchOptions,
  SearchResultItem,
} from '../types/search'
import useDebounce from './useDebounce'
import searchService from '../services/search'

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
 * Custom hook for managing search functionality
 *
 * @param options - Hook configuration options
 * @returns Object containing search state and control functions
 */
const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const {
    debounceDelay = 300,
    minCharacters = 2,
    limit = 10,
    autoSearch = true,
    useMock = shouldUseMockByDefault(),
  } = options

  // Search state
  const [query, setQuery] = useState<string>('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState<boolean>(false)

  // Debounced query value
  const debouncedQuery = useDebounce(query, debounceDelay)

  /**
   * Execute search with the given query
   */
  const search = useCallback(
    async (searchQuery?: string) => {
      const queryToSearch = searchQuery ?? query

      // Don't search if query is too short
      if (queryToSearch.length < minCharacters) {
        setResults([])
        setTotal(0)
        setHasMore(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await searchService.search(
          {
            query: queryToSearch,
            limit,
          },
          useMock
        )

        setResults(response.results)
        setTotal(response.total)
        setHasMore(response.hasMore)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Search failed. Please try again.'
        setError(errorMessage)
        setResults([])
        setTotal(0)
        setHasMore(false)
        console.error('Search error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [query, minCharacters, limit, useMock]
  )

  /**
   * Clear all search state
   */
  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setTotal(0)
    setError(null)
    setHasMore(false)
  }, [])

  /**
   * Auto-search when debounced query changes
   */
  useEffect(() => {
    if (autoSearch && debouncedQuery.length >= minCharacters) {
      search(debouncedQuery)
    } else if (debouncedQuery.length < minCharacters) {
      // Clear results when query is too short
      setResults([])
      setTotal(0)
      setHasMore(false)
      setError(null)
    }
  }, [debouncedQuery, autoSearch, minCharacters, search])

  return {
    query,
    debouncedQuery,
    results,
    total,
    isLoading,
    error,
    hasMore,
    setQuery,
    clearSearch,
    search,
  }
}

export default useSearch
