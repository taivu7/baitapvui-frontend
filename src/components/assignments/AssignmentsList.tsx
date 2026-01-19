/**
 * AssignmentsList Component
 *
 * Container component that renders a list of assignment cards.
 * Handles loading states, empty states, and error states.
 * Supports displaying submission progress bars (KAN-43).
 */

import React, { memo, useCallback } from 'react'
import AssignmentCard, { AssignmentCardSkeleton } from './AssignmentCard'
import { AssignmentsListProps, AssignmentSubmissionProgressData } from '../../types/assignments'

/**
 * Error state component for assignments loading failure
 */
interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

const AssignmentsListError: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 mb-4">
        <span className="material-symbols-outlined text-3xl">error_outline</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Failed to Load Assignments
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
 * Empty state component when no assignments are available
 */
const AssignmentsListEmpty: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 mb-4">
        <span className="material-symbols-outlined text-3xl">assignment</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No Assignments Yet
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
        Your assignments will appear here once you create them. Start by clicking "Create Assignment" to add your first one.
      </p>
    </div>
  )
}

/**
 * Loading skeleton component for the assignments list
 */
const AssignmentsListSkeleton: React.FC<{
  count?: number
  showProgress?: boolean
}> = ({ count = 3, showProgress = false }) => {
  return (
    <div className="flex flex-col gap-4" aria-label="Loading assignments" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <AssignmentCardSkeleton key={`skeleton-${index}`} showProgress={showProgress} />
      ))}
    </div>
  )
}

/**
 * AssignmentsList Component
 *
 * Renders a list of assignment cards with support for:
 * - Loading skeleton states
 * - Error handling with retry option
 * - Empty state when no assignments are available
 * - Header with title and "View All" link
 * - Dark mode support
 *
 * @param props - AssignmentsListProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * // Basic usage with hook
 * const { assignments, isLoading, error, refetch } = useTeacherAssignments()
 *
 * <AssignmentsList
 *   assignments={assignments}
 *   isLoading={isLoading}
 *   error={error}
 *   onRetry={refetch}
 * />
 * ```
 */
const AssignmentsList: React.FC<AssignmentsListProps> = ({
  assignments,
  isLoading = false,
  error = null,
  onRetry,
  viewAllHref = '#',
  title = 'Current Assignments',
  className = '',
  getSubmissionProgress,
  showProgress = true,
}) => {
  /**
   * Gets submission progress data for a specific assignment
   * Returns undefined if no progress data is available
   */
  const getProgressForAssignment = useCallback(
    (assignmentId: number): AssignmentSubmissionProgressData | undefined => {
      if (!getSubmissionProgress) return undefined
      return getSubmissionProgress(assignmentId)
    },
    [getSubmissionProgress]
  )

  // Render loading skeletons
  if (isLoading) {
    return (
      <section className={`flex flex-col gap-6 ${className}`} aria-label="Loading assignments">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-7 w-44 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Skeleton Cards */}
        <AssignmentsListSkeleton count={3} showProgress={showProgress} />
      </section>
    )
  }

  // Render error state
  if (error) {
    return (
      <section className={`flex flex-col gap-6 ${className}`} aria-label="Assignments error">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#111813] dark:text-white">{title}</h3>
        </div>

        {/* Error State */}
        <AssignmentsListError message={error} onRetry={onRetry} />
      </section>
    )
  }

  // Render empty state
  if (!assignments || assignments.length === 0) {
    return (
      <section className={`flex flex-col gap-6 ${className}`} aria-label="No assignments">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#111813] dark:text-white">{title}</h3>
        </div>

        {/* Empty State */}
        <AssignmentsListEmpty />
      </section>
    )
  }

  // Render assignments list
  return (
    <section className={`flex flex-col gap-6 ${className}`} aria-label={title}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#111813] dark:text-white">{title}</h3>
        <a
          className="text-sm font-bold text-primary hover:text-green-400 hover:underline transition-colors"
          href={viewAllHref}
        >
          View All
        </a>
      </div>

      {/* Assignment Cards */}
      <div className="flex flex-col gap-4">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            submissionProgress={getProgressForAssignment(assignment.id)}
            showProgress={showProgress}
          />
        ))}
      </div>
    </section>
  )
}

// Memoize the component for performance
export default memo(AssignmentsList)

// Export sub-components for potential standalone use
export { AssignmentsListError, AssignmentsListEmpty, AssignmentsListSkeleton }
