/**
 * AssignmentCardsGrid Component (KAN-134, KAN-135)
 *
 * Responsive grid layout for displaying assignment cards on the My Assignments dashboard.
 *
 * Features:
 * - Responsive grid layout:
 *   - Mobile: 1 column
 *   - Tablet (md): 2 columns
 *   - Desktop (xl): 3 columns
 * - Loading skeleton state
 * - Empty state with context-aware messaging
 * - Error state with retry functionality
 * - Create New Assignment card option
 * - Proper spacing and alignment across breakpoints
 * - Accessible list semantics
 *
 * KAN-134: Render assignment cards in dashboard
 * KAN-135: Responsive layout implementation
 */

import React, { memo } from 'react'
import AssignmentCard, { AssignmentCardSkeleton } from './AssignmentCard'
import {
  AssignmentCardsGridProps,
  AssignmentCardsFilterStatus,
} from '../../types/assignmentCards'

/**
 * Loading skeleton grid component
 * Renders multiple skeleton cards in the responsive grid layout
 */
const AssignmentCardsGridSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      aria-label="Loading assignments"
      aria-busy="true"
      role="status"
    >
      {Array.from({ length: count }).map((_, index) => (
        <AssignmentCardSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  )
}

/**
 * Error state component
 * Displays error message with optional retry button
 */
const AssignmentCardsGridError: React.FC<{
  message: string
  onRetry?: () => void
}> = ({ message, onRetry }) => {
  return (
    <div
      className="col-span-full flex flex-col items-center justify-center py-16 px-4"
      role="alert"
      aria-live="polite"
    >
      <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 mb-4">
        <span className="material-symbols-outlined text-4xl" aria-hidden="true">
          error_outline
        </span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Failed to Load Assignments
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="
            flex items-center gap-2
            px-6 py-3
            bg-primary hover:bg-green-400
            text-[#0d3b1e]
            rounded-xl font-bold
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
          "
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            refresh
          </span>
          Try Again
        </button>
      )}
    </div>
  )
}

/**
 * Get context-aware empty state message based on filter
 */
const getEmptyMessage = (
  filter: AssignmentCardsFilterStatus
): { title: string; description: string } => {
  switch (filter) {
    case 'published':
      return {
        title: 'No Active Assignments',
        description:
          "You don't have any published assignments yet. Create and publish an assignment to see it here.",
      }
    case 'draft':
      return {
        title: 'No Draft Assignments',
        description:
          "You don't have any assignments in draft. Start creating a new assignment to save it as a draft.",
      }
    case 'closed':
      return {
        title: 'No Completed Assignments',
        description:
          'No assignments have been completed yet. Assignments will appear here once their due date has passed.',
      }
    default:
      return {
        title: 'No Assignments Yet',
        description:
          'Start creating your first assignment to engage your students. Click the button below to get started.',
      }
  }
}

/**
 * Empty state component
 * Displays context-aware messaging based on current filter
 */
const AssignmentCardsGridEmpty: React.FC<{
  filter?: AssignmentCardsFilterStatus
  onCreateClick?: () => void
}> = ({ filter = 'all', onCreateClick }) => {
  const { title, description } = getEmptyMessage(filter)

  return (
    <div
      className="col-span-full flex flex-col items-center justify-center py-16 px-4"
      role="status"
      aria-label={title}
    >
      <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 mb-4">
        <span className="material-symbols-outlined text-4xl" aria-hidden="true">
          assignment
        </span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
        {description}
      </p>
      {onCreateClick && (
        <button
          onClick={onCreateClick}
          type="button"
          className="
            flex items-center gap-2
            px-6 py-3
            bg-primary hover:bg-green-400
            text-[#0d3b1e]
            rounded-xl font-bold
            transition-colors
            shadow-lg shadow-green-500/20
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
          "
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            add
          </span>
          Create Assignment
        </button>
      )}
    </div>
  )
}

/**
 * Create New Assignment Card
 * Dashed border card that acts as a call-to-action for creating new assignments
 */
const CreateNewCard: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="
        border-2 border-dashed border-gray-200 dark:border-gray-800
        rounded-2xl p-6
        flex flex-col items-center justify-center text-center gap-4
        hover:border-primary hover:bg-primary/5
        transition-all
        cursor-pointer
        group
        min-h-[300px]
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark
      "
      aria-label="Create new assignment"
    >
      <div
        className="
          size-16 rounded-full
          bg-gray-100 dark:bg-white/5
          flex items-center justify-center
          text-gray-400
          group-hover:bg-primary/20 group-hover:text-primary
          transition-all
        "
      >
        <span className="material-symbols-outlined text-4xl" aria-hidden="true">
          add
        </span>
      </div>
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">Create New</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[150px] mx-auto">
          Start building a new assignment for your students.
        </p>
      </div>
    </button>
  )
}

/**
 * AssignmentCardsGrid Component
 *
 * Renders a responsive grid of assignment cards with:
 * - Responsive column layout (1/2/3 columns)
 * - Loading skeleton state
 * - Error state with retry
 * - Empty state with filter-aware messaging
 * - Optional create new card
 * - Proper ARIA semantics for accessibility
 *
 * @param props - AssignmentCardsGridProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * const { filteredAssignments, isLoading, error, refetch } = useAssignmentCards()
 *
 * <AssignmentCardsGrid
 *   assignments={filteredAssignments}
 *   isLoading={isLoading}
 *   error={error}
 *   onRetry={refetch}
 *   onAssignmentClick={(a) => navigate(`/assignments/${a.assignment_id}`)}
 *   onCreateClick={() => navigate('/assignments/new')}
 *   showCreateCard={true}
 * />
 * ```
 */
const AssignmentCardsGrid: React.FC<AssignmentCardsGridProps> = ({
  assignments,
  isLoading = false,
  error = null,
  onRetry,
  onAssignmentClick,
  onCreateClick,
  showCreateCard = true,
  className = '',
}) => {
  // Loading state - show skeleton grid
  if (isLoading) {
    return <AssignmentCardsGridSkeleton count={4} />
  }

  // Error state - show error message with retry
  if (error) {
    return (
      <div className={`grid grid-cols-1 ${className}`}>
        <AssignmentCardsGridError message={error} onRetry={onRetry} />
      </div>
    )
  }

  // Empty state - show empty message based on filter
  if (!assignments || assignments.length === 0) {
    return (
      <div className={`grid grid-cols-1 ${className}`}>
        <AssignmentCardsGridEmpty onCreateClick={onCreateClick} />
      </div>
    )
  }

  // Grid with assignment cards
  // Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop
  return (
    <div
      className={`
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-6
        ${className}
      `}
      role="list"
      aria-label="Assignments list"
    >
      {/* Assignment Cards */}
      {assignments.map((assignment) => (
        <div key={assignment.assignment_id} role="listitem">
          <AssignmentCard
            assignment={assignment}
            onClick={onAssignmentClick}
          />
        </div>
      ))}

      {/* Create New Card - always at the end if enabled */}
      {showCreateCard && (
        <CreateNewCard onClick={onCreateClick} />
      )}
    </div>
  )
}

// Memoize component for performance
export default memo(AssignmentCardsGrid)

// Export sub-components for standalone use
export {
  AssignmentCardsGridSkeleton,
  AssignmentCardsGridError,
  AssignmentCardsGridEmpty,
  CreateNewCard,
}
