/**
 * OverviewStatistics Component
 *
 * Container component that renders a grid of statistics cards.
 * Handles loading states, empty states, and error states.
 */

import React, { memo, useMemo } from 'react'
import StatisticsCard, { StatisticsCardSkeleton } from './StatisticsCard'
import { OverviewStatisticsProps } from '../../types/statistics'

/**
 * Error state component for statistics loading failure
 */
interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
      <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 mb-4">
        <span className="material-symbols-outlined text-3xl">error_outline</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Failed to Load Statistics
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-green-400 text-[#0d3b1e] rounded-lg font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Try Again
        </button>
      )}
    </div>
  )
}

/**
 * Empty state component when no statistics are available
 */
const EmptyState: React.FC = () => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
      <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 mb-4">
        <span className="material-symbols-outlined text-3xl">analytics</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No Statistics Available
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
        Statistics will appear here once you start creating assignments and classes.
      </p>
    </div>
  )
}

/**
 * Maps column count to Tailwind grid classes
 */
const getGridClasses = (columns: 2 | 3 | 4): string => {
  const gridMap: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }
  return gridMap[columns] || gridMap[3]
}

/**
 * OverviewStatistics Component
 *
 * Renders a responsive grid of statistics cards with support for:
 * - Loading skeleton states
 * - Error handling with retry option
 * - Empty state when no data is available
 * - Configurable grid columns (2, 3, or 4)
 * - Dark mode support
 *
 * @param props - OverviewStatisticsProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * // Basic usage with hook
 * const { statistics, isLoading, error, refetch } = useTeacherStatistics()
 *
 * <OverviewStatistics
 *   statistics={statistics}
 *   isLoading={isLoading}
 *   error={error}
 *   onRetry={refetch}
 * />
 *
 * // With click handlers
 * <OverviewStatistics
 *   statistics={statistics}
 *   onCardClick={(id) => navigate(`/stats/${id}`)}
 * />
 * ```
 */
const OverviewStatistics: React.FC<OverviewStatisticsProps & { onRetry?: () => void }> = ({
  statistics,
  isLoading = false,
  error = null,
  columns = 3,
  onCardClick,
  onRetry,
  className = '',
}) => {
  // Determine grid classes based on column count
  const gridClasses = useMemo(() => getGridClasses(columns), [columns])

  // Render loading skeletons
  if (isLoading) {
    const skeletonCount = columns // Show same number of skeletons as columns
    return (
      <section
        className={`grid ${gridClasses} gap-4 ${className}`}
        aria-label="Loading statistics"
        aria-busy="true"
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <StatisticsCardSkeleton key={`skeleton-${index}`} />
        ))}
      </section>
    )
  }

  // Render error state
  if (error) {
    return (
      <section
        className={`grid ${gridClasses} gap-4 ${className}`}
        aria-label="Statistics error"
      >
        <ErrorState message={error} onRetry={onRetry} />
      </section>
    )
  }

  // Render empty state
  if (!statistics || statistics.length === 0) {
    return (
      <section
        className={`grid ${gridClasses} gap-4 ${className}`}
        aria-label="No statistics"
      >
        <EmptyState />
      </section>
    )
  }

  // Render statistics cards
  return (
    <section
      className={`grid ${gridClasses} gap-4 ${className}`}
      aria-label="Overview statistics"
    >
      {statistics.map((statistic) => (
        <StatisticsCard
          key={statistic.id}
          statistic={statistic}
          onClick={onCardClick ? () => onCardClick(statistic.id) : undefined}
        />
      ))}
    </section>
  )
}

// Memoize the component for performance
export default memo(OverviewStatistics)

// Export sub-components for potential standalone use
export { ErrorState, EmptyState }
