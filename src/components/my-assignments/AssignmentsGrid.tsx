/**
 * AssignmentsGrid Component
 *
 * Grid layout for displaying assignment cards on the My Assignments dashboard.
 * Includes:
 * - Responsive grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
 * - Loading skeleton state
 * - Empty state
 * - Error state
 * - Create New Assignment card
 */

import React, { memo } from 'react'
import { Assignment, AssignmentFilterStatus } from '../../types/myAssignments'
import AssignmentDashboardCard, {
  AssignmentDashboardCardSkeleton,
} from './AssignmentDashboardCard'

/**
 * Props for AssignmentsGrid component
 */
interface AssignmentsGridProps {
  /** Array of assignments to display */
  assignments: Assignment[]
  /** Loading state */
  isLoading?: boolean
  /** Error message */
  error?: string | null
  /** Retry callback for error state */
  onRetry?: () => void
  /** Callback when an assignment card is clicked */
  onAssignmentClick?: (assignment: Assignment) => void
  /** Callback when create new card is clicked */
  onCreateClick?: () => void
  /** Current filter status (for empty state message) */
  currentFilter?: AssignmentFilterStatus
  /** Show the create new card */
  showCreateCard?: boolean
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Loading skeleton grid
 */
const AssignmentsGridSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      aria-label="Loading assignments"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <AssignmentDashboardCardSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  )
}

/**
 * Error state component
 */
const AssignmentsGridError: React.FC<{
  message: string
  onRetry?: () => void
}> = ({ message, onRetry }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 mb-4">
        <span className="material-symbols-outlined text-4xl">error_outline</span>
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
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-green-400 text-[#0d3b1e] rounded-xl font-bold transition-colors"
        >
          <span className="material-symbols-outlined">refresh</span>
          Try Again
        </button>
      )}
    </div>
  )
}

/**
 * Empty state component
 */
const AssignmentsGridEmpty: React.FC<{
  filter?: AssignmentFilterStatus
  onCreateClick?: () => void
}> = ({ filter = 'all', onCreateClick }) => {
  // Customize message based on filter
  const getMessage = () => {
    switch (filter) {
      case 'published':
        return {
          title: 'No Active Assignments',
          description:
            'You don\'t have any published assignments yet. Create and publish an assignment to see it here.',
        }
      case 'draft':
        return {
          title: 'No Draft Assignments',
          description:
            'You don\'t have any assignments in draft. Start creating a new assignment to save it as a draft.',
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

  const { title, description } = getMessage()

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 mb-4">
        <span className="material-symbols-outlined text-4xl">assignment</span>
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
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-green-400 text-[#0d3b1e] rounded-xl font-bold transition-colors shadow-lg shadow-green-500/20"
        >
          <span className="material-symbols-outlined">add</span>
          Create Assignment
        </button>
      )}
    </div>
  )
}

/**
 * Create New Assignment Card
 */
const CreateNewCard: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        border-2 border-dashed border-gray-200 dark:border-gray-800
        rounded-2xl p-6
        flex flex-col items-center justify-center text-center gap-4
        hover:border-primary hover:bg-primary/5
        transition-all
        cursor-pointer
        group
        min-h-[300px]
      "
      aria-label="Create new assignment"
    >
      <div className="size-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-primary/20 group-hover:text-primary transition-all">
        <span className="material-symbols-outlined text-4xl">add</span>
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
 * AssignmentsGrid Component
 *
 * Renders a responsive grid of assignment cards with loading, error, and empty states.
 *
 * @param props - AssignmentsGridProps
 * @returns JSX.Element
 */
const AssignmentsGrid: React.FC<AssignmentsGridProps> = ({
  assignments,
  isLoading = false,
  error = null,
  onRetry,
  onAssignmentClick,
  onCreateClick,
  currentFilter = 'all',
  showCreateCard = true,
  className = '',
}) => {
  // Loading state
  if (isLoading) {
    return <AssignmentsGridSkeleton count={4} />
  }

  // Error state
  if (error) {
    return (
      <div className={`grid grid-cols-1 ${className}`}>
        <AssignmentsGridError message={error} onRetry={onRetry} />
      </div>
    )
  }

  // Empty state
  if (!assignments || assignments.length === 0) {
    return (
      <div className={`grid grid-cols-1 ${className}`}>
        <AssignmentsGridEmpty filter={currentFilter} onCreateClick={onCreateClick} />
      </div>
    )
  }

  // Grid with assignments
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}
      role="list"
      aria-label="Assignments list"
    >
      {assignments.map((assignment) => (
        <div key={assignment.id} role="listitem">
          <AssignmentDashboardCard
            assignment={assignment}
            onClick={onAssignmentClick}
          />
        </div>
      ))}

      {/* Create New Card (always show at the end if enabled) */}
      {showCreateCard && <CreateNewCard onClick={onCreateClick} />}
    </div>
  )
}

export default memo(AssignmentsGrid)

// Export sub-components for potential standalone use
export {
  AssignmentsGridSkeleton,
  AssignmentsGridError,
  AssignmentsGridEmpty,
  CreateNewCard,
}
