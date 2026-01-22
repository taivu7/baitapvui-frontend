/**
 * SearchInput Component (KAN-49)
 *
 * A reusable global search input component for the Teacher Home Page.
 * Features:
 * - Debounced input handling to prevent excessive API calls
 * - Loading, error, and empty states
 * - Accessible with proper ARIA attributes
 * - Mobile-first responsive design with Tailwind CSS
 * - Keyboard navigation support
 * - Optional search results dropdown
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  FormEvent,
} from 'react'
import { SearchInputProps, SearchResultItem, SearchResultType } from '../../types/search'
import useDebounce from '../../hooks/useDebounce'

/**
 * Size variant styles mapping
 */
const sizeStyles = {
  sm: {
    input: 'py-2 pl-9 pr-9 text-sm',
    icon: 'text-[18px]',
    iconLeft: 'pl-2.5',
    iconRight: 'pr-2.5',
  },
  md: {
    input: 'py-2.5 pl-10 pr-10 text-sm',
    icon: 'text-[20px]',
    iconLeft: 'pl-3',
    iconRight: 'pr-3',
  },
  lg: {
    input: 'py-3 pl-11 pr-11 text-base',
    icon: 'text-[22px]',
    iconLeft: 'pl-3.5',
    iconRight: 'pr-3.5',
  },
}

/**
 * Icon mapping for search result types
 */
const resultTypeIcons: Record<SearchResultType, string> = {
  assignment: 'assignment',
  class: 'school',
  student: 'person',
}

/**
 * Color classes for search result type badges
 */
const resultTypeColors: Record<SearchResultType, string> = {
  assignment: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  student: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

/**
 * SearchInput Component
 *
 * Provides a search input field with optional dropdown results display.
 */
const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search classes, assignments, or students...',
  debounceDelay = 300,
  onSearch,
  onChange,
  onClear,
  onResultSelect,
  isLoading = false,
  error = null,
  results = [],
  showResults = false,
  disabled = false,
  className = '',
  size = 'md',
  minCharacters = 2,
  ariaLabel = 'Search',
  id,
  name = 'search',
  autoFocus = false,
}) => {
  // Internal state
  const [inputValue, setInputValue] = useState<string>('')
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  // Refs
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLUListElement>(null)

  // Debounced value for search
  const debouncedValue = useDebounce(inputValue, debounceDelay)

  // Size-specific styles
  const styles = sizeStyles[size]

  /**
   * Trigger search when debounced value changes
   */
  useEffect(() => {
    if (debouncedValue.length >= minCharacters && onSearch) {
      onSearch(debouncedValue)
    }
  }, [debouncedValue, minCharacters, onSearch])

  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Auto-focus on mount if specified
   */
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  /**
   * Handle input change
   */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)
      setSelectedIndex(-1)
      onChange?.(value)
    },
    [onChange]
  )

  /**
   * Handle clearing the input
   */
  const handleClear = useCallback(() => {
    setInputValue('')
    setSelectedIndex(-1)
    onClear?.()
    inputRef.current?.focus()
  }, [onClear])

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (inputValue.length >= minCharacters && onSearch) {
        onSearch(inputValue)
      }
    },
    [inputValue, minCharacters, onSearch]
  )

  /**
   * Handle result selection
   */
  const handleResultClick = useCallback(
    (result: SearchResultItem) => {
      setInputValue(result.title)
      setIsFocused(false)
      setSelectedIndex(-1)
      onResultSelect?.(result)
    },
    [onResultSelect]
  )

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const hasResults = results.length > 0 && showResults

      switch (e.key) {
        case 'ArrowDown':
          if (hasResults) {
            e.preventDefault()
            setSelectedIndex((prev) =>
              prev < results.length - 1 ? prev + 1 : prev
            )
          }
          break
        case 'ArrowUp':
          if (hasResults) {
            e.preventDefault()
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          }
          break
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            e.preventDefault()
            handleResultClick(results[selectedIndex])
          }
          break
        case 'Escape':
          setIsFocused(false)
          setSelectedIndex(-1)
          inputRef.current?.blur()
          break
      }
    },
    [results, showResults, selectedIndex, handleResultClick]
  )

  /**
   * Scroll selected item into view
   */
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[
        selectedIndex
      ] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  // Determine if dropdown should be visible
  const shouldShowDropdown =
    isFocused &&
    showResults &&
    inputValue.length >= minCharacters &&
    (results.length > 0 || isLoading || error)

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
      <form onSubmit={handleSubmit} role="search">
        <div className="relative group">
          {/* Search Icon */}
          <div
            className={`absolute inset-y-0 left-0 ${styles.iconLeft} flex items-center pointer-events-none`}
          >
            <span
              className={`material-symbols-outlined ${styles.icon} text-gray-400 group-focus-within:text-primary transition-colors`}
              aria-hidden="true"
            >
              search
            </span>
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="text"
            value={inputValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            aria-label={ariaLabel}
            aria-autocomplete="list"
            aria-controls={shouldShowDropdown ? 'search-results' : undefined}
            aria-activedescendant={
              selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined
            }
            aria-expanded={shouldShowDropdown ? true : false}
            role="combobox"
            autoComplete="off"
            className={`
              block w-full ${styles.input}
              border-none rounded-xl
              bg-[#f0f4f2] dark:bg-white/5
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:ring-2 focus:ring-primary/50 focus:bg-white dark:focus:bg-surface-dark
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            `}
          />

          {/* Clear Button / Loading Spinner */}
          <div
            className={`absolute inset-y-0 right-0 ${styles.iconRight} flex items-center`}
          >
            {isLoading ? (
              <div
                className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-primary rounded-full"
                aria-label="Loading search results"
              />
            ) : inputValue ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Clear search"
              >
                <span
                  className={`material-symbols-outlined ${styles.icon}`}
                  aria-hidden="true"
                >
                  close
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {shouldShowDropdown && (
        <div
          className="absolute z-50 w-full mt-2 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden"
          role="listbox"
          id="search-results"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="px-4 py-8 text-center">
              <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-primary rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Searching...
              </p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="px-4 py-6 text-center">
              <span
                className="material-symbols-outlined text-3xl text-red-400 mb-2 block"
                aria-hidden="true"
              >
                error
              </span>
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              <button
                type="button"
                onClick={() => onSearch?.(inputValue)}
                className="mt-2 text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2 py-1"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && results.length === 0 && (
            <div className="px-4 py-6 text-center">
              <span
                className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600 mb-2 block"
                aria-hidden="true"
              >
                search_off
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No results found for "{inputValue}"
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Try different keywords
              </p>
            </div>
          )}

          {/* Results List */}
          {!isLoading && !error && results.length > 0 && (
            <ul
              ref={resultsRef}
              className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800"
            >
              {results.map((result, index) => (
                <li
                  key={`${result.type}-${result.id}`}
                  id={`search-result-${index}`}
                  role="option"
                  aria-selected={selectedIndex === index}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors
                    ${
                      selectedIndex === index
                        ? 'bg-primary/10 dark:bg-primary/20'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }
                  `}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-3">
                    {/* Type Icon */}
                    <div
                      className={`p-2 rounded-lg ${resultTypeColors[result.type]}`}
                    >
                      <span
                        className="material-symbols-outlined text-lg"
                        aria-hidden="true"
                      >
                        {resultTypeIcons[result.type]}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {result.title}
                      </p>
                      {result.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {result.description}
                        </p>
                      )}
                    </div>

                    {/* Type Badge */}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${resultTypeColors[result.type]}`}
                    >
                      {result.type}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Footer Hint */}
          {!isLoading && !error && results.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-white/5 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                  arrow_upward
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                  arrow_downward
                </kbd>
                <span>to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                  Enter
                </kbd>
                <span>to select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                  Esc
                </kbd>
                <span>to close</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchInput
