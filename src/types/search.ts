/**
 * Search Types for Global Search Feature (KAN-49)
 *
 * These types define the data structures used for the global search functionality
 * on the Teacher Home Page.
 */

/**
 * Search result item types
 */
export type SearchResultType = 'assignment' | 'class' | 'student'

/**
 * Individual search result item
 */
export interface SearchResultItem {
  /** Unique identifier for the result item */
  id: number
  /** Type of the search result */
  type: SearchResultType
  /** Display title/name of the result */
  title: string
  /** Optional description or subtitle */
  description?: string
  /** URL or route to navigate to when clicked */
  href?: string
  /** Optional metadata (e.g., class name, due date, etc.) */
  metadata?: Record<string, string | number | boolean>
}

/**
 * Search results grouped by type
 */
export interface GroupedSearchResults {
  /** Assignment results */
  assignments: SearchResultItem[]
  /** Class results */
  classes: SearchResultItem[]
  /** Student results */
  students: SearchResultItem[]
}

/**
 * API response for search endpoint
 * GET /api/v1/search?q={query}
 */
export interface SearchResponse {
  /** Search query that was executed */
  query: string
  /** Array of search result items */
  results: SearchResultItem[]
  /** Total count of results */
  total: number
  /** Whether there are more results available */
  hasMore: boolean
}

/**
 * Search request parameters
 */
export interface SearchParams {
  /** Search query string */
  query: string
  /** Optional limit for number of results */
  limit?: number
  /** Optional offset for pagination */
  offset?: number
  /** Optional filter by result type */
  type?: SearchResultType | SearchResultType[]
}

/**
 * Search state for managing search UI
 */
export interface SearchState {
  /** Current search query */
  query: string
  /** Search results */
  results: SearchResultItem[]
  /** Total count of results */
  total: number
  /** Whether search is in progress */
  isLoading: boolean
  /** Error message if search failed */
  error: string | null
  /** Whether there are more results to load */
  hasMore: boolean
}

/**
 * Props for the SearchInput component
 */
export interface SearchInputProps {
  /** Placeholder text for the input */
  placeholder?: string
  /** Debounce delay in milliseconds (default: 300) */
  debounceDelay?: number
  /** Callback when search is triggered */
  onSearch?: (query: string) => void
  /** Callback when input value changes (before debounce) */
  onChange?: (value: string) => void
  /** Callback when input is cleared */
  onClear?: () => void
  /** Callback when a search result is selected */
  onResultSelect?: (result: SearchResultItem) => void
  /** External loading state override */
  isLoading?: boolean
  /** External error state */
  error?: string | null
  /** Search results to display */
  results?: SearchResultItem[]
  /** Whether to show results dropdown */
  showResults?: boolean
  /** Whether the input is disabled */
  disabled?: boolean
  /** Optional additional CSS classes */
  className?: string
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Minimum characters required before triggering search */
  minCharacters?: number
  /** ARIA label for accessibility */
  ariaLabel?: string
  /** ID for the input element */
  id?: string
  /** Name attribute for the input */
  name?: string
  /** Whether to auto-focus the input on mount */
  autoFocus?: boolean
}

/**
 * Hook return type for useSearch
 */
export interface UseSearchReturn {
  /** Current search query */
  query: string
  /** Debounced search query */
  debouncedQuery: string
  /** Search results */
  results: SearchResultItem[]
  /** Total count of results */
  total: number
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Whether there are more results */
  hasMore: boolean
  /** Function to update search query */
  setQuery: (query: string) => void
  /** Function to clear search */
  clearSearch: () => void
  /** Function to manually trigger search */
  search: (query?: string) => Promise<void>
}

/**
 * Options for useSearch hook
 */
export interface UseSearchOptions {
  /** Debounce delay in milliseconds (default: 300) */
  debounceDelay?: number
  /** Minimum characters required to trigger search (default: 2) */
  minCharacters?: number
  /** Maximum number of results to fetch (default: 10) */
  limit?: number
  /** Whether to auto-search when query changes (default: true) */
  autoSearch?: boolean
  /** Use mock data (default: based on environment) */
  useMock?: boolean
}
