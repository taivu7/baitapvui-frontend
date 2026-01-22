/**
 * useDebounce Hook
 *
 * Custom hook for debouncing values. Useful for preventing excessive API calls
 * when handling user input like search queries.
 *
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState('')
 * const debouncedQuery = useDebounce(searchQuery, 500)
 *
 * useEffect(() => {
 *   if (debouncedQuery) {
 *     // Make API call with debounced query
 *     searchApi(debouncedQuery)
 *   }
 * }, [debouncedQuery])
 * ```
 */

import { useState, useEffect } from 'react'

/**
 * Debounces a value by the specified delay
 *
 * @template T - The type of value to debounce
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns The debounced value
 */
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clear the timer if value or delay changes before the timeout completes
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
