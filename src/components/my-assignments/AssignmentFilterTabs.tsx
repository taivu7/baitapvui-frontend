/**
 * AssignmentFilterTabs Component
 *
 * Filter tabs for the My Assignments dashboard.
 * Allows filtering assignments by status: All, Active (Published), Drafts, Completed (Closed).
 *
 * Provides accessible tab navigation with keyboard support.
 */

import React, { memo, useCallback } from 'react'
import { AssignmentFilterTabsProps, AssignmentFilterStatus } from '../../types/myAssignments'

/**
 * Tab configuration for each filter option
 */
interface TabConfig {
  key: AssignmentFilterStatus
  label: string
}

const TABS: TabConfig[] = [
  { key: 'all', label: 'All Assignments' },
  { key: 'published', label: 'Active' },
  { key: 'draft', label: 'Drafts' },
  { key: 'closed', label: 'Completed' },
]

/**
 * AssignmentFilterTabs Component
 *
 * Renders horizontal filter tabs for assignment status filtering.
 * Highlights the active tab and supports counts display.
 *
 * @param props - AssignmentFilterTabsProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <AssignmentFilterTabs
 *   activeFilter="all"
 *   onFilterChange={setStatusFilter}
 *   counts={{ all: 10, published: 5, draft: 3, closed: 2 }}
 * />
 * ```
 */
const AssignmentFilterTabs: React.FC<AssignmentFilterTabsProps> = ({
  activeFilter,
  onFilterChange,
  counts,
  className = '',
}) => {
  /**
   * Handle tab click
   */
  const handleTabClick = useCallback(
    (filter: AssignmentFilterStatus) => {
      onFilterChange(filter)
    },
    [onFilterChange]
  )

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      const tabCount = TABS.length

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          const nextIndex = (currentIndex + 1) % tabCount
          onFilterChange(TABS[nextIndex].key)
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          const prevIndex = (currentIndex - 1 + tabCount) % tabCount
          onFilterChange(TABS[prevIndex].key)
          break
        case 'Home':
          event.preventDefault()
          onFilterChange(TABS[0].key)
          break
        case 'End':
          event.preventDefault()
          onFilterChange(TABS[tabCount - 1].key)
          break
      }
    },
    [onFilterChange]
  )

  return (
    <div
      className={`
        flex items-center gap-4
        overflow-x-auto
        pb-2
        scrollbar-hide
        ${className}
      `}
      role="tablist"
      aria-label="Filter assignments by status"
    >
      {TABS.map((tab, index) => {
        const isActive = activeFilter === tab.key
        const count = counts?.[tab.key]

        return (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.key}`}
            tabIndex={isActive ? 0 : -1}
            className={`
              px-4 py-2
              rounded-full
              text-sm font-medium
              whitespace-nowrap
              transition-colors
              ${
                isActive
                  ? 'bg-primary/20 text-[#0d3b1e] dark:bg-primary/10 dark:text-primary font-bold'
                  : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
              }
            `}
          >
            {tab.label}
            {count !== undefined && count > 0 && (
              <span
                className={`
                  ml-1.5
                  text-xs
                  ${isActive ? 'opacity-80' : 'opacity-60'}
                `}
                aria-label={`${count} assignments`}
              >
                ({count})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default memo(AssignmentFilterTabs)
