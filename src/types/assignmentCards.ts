/**
 * Assignment Cards Types (KAN-132, KAN-133)
 *
 * Type definitions for the Assignment Card component and API integration.
 * These types map to the GET /api/v1/assignments/cards endpoint.
 */

/**
 * Assignment status enum matching backend values
 * - draft: Assignment is not yet published
 * - published: Assignment is active and visible to students
 * - closed: Assignment has ended (past due date)
 */
export type AssignmentCardStatus = 'draft' | 'published' | 'closed'

/**
 * Display status for UI representation
 * Maps backend status to user-friendly labels
 */
export type AssignmentDisplayStatus = 'Active' | 'Draft' | 'Completed'

/**
 * Assignment card item from API response
 * Maps to backend response structure from GET /api/v1/assignments/cards
 */
export interface AssignmentCardData {
  /** Unique assignment identifier */
  assignment_id: number
  /** Assignment title */
  title: string
  /** Class name or "Not assigned" if not assigned to any class */
  class_name: string
  /** Assignment status */
  status: AssignmentCardStatus
  /** Relevant date in YYYY-MM-DD format (due date for published, last edited for draft) */
  relevant_date: string
  /** Relevant time in HH:MM format (24-hour), null for drafts */
  relevant_time: string | null
}

/**
 * API response for assignment cards endpoint
 * GET /api/v1/assignments/cards
 */
export interface AssignmentCardsResponse {
  /** Array of assignment cards */
  assignments: AssignmentCardData[]
  /** Total count of assignments */
  total: number
}

/**
 * Status badge configuration for styling
 */
export interface StatusBadgeConfig {
  /** Display label */
  label: AssignmentDisplayStatus
  /** Tailwind CSS classes for badge styling */
  colorClasses: string
}

/**
 * Action button configuration for card footer
 */
export interface ActionButtonConfig {
  /** Button label text */
  label: string
  /** Whether button should use primary styling */
  isPrimary: boolean
}

/**
 * Props for the AssignmentCard component (KAN-133)
 */
export interface AssignmentCardProps {
  /** Assignment data to display */
  assignment: AssignmentCardData
  /** Optional callback when card or action button is clicked */
  onClick?: (assignment: AssignmentCardData) => void
  /** Optional additional CSS classes */
  className?: string
  /** Show loading skeleton instead of content */
  isLoading?: boolean
}

/**
 * Props for AssignmentCard skeleton component
 */
export interface AssignmentCardSkeletonProps {
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Props for the AssignmentCardsGrid component (KAN-134, KAN-135)
 */
export interface AssignmentCardsGridProps {
  /** Array of assignment cards to display */
  assignments: AssignmentCardData[]
  /** Loading state */
  isLoading?: boolean
  /** Error message if any */
  error?: string | null
  /** Retry callback for error state */
  onRetry?: () => void
  /** Callback when an assignment card is clicked */
  onAssignmentClick?: (assignment: AssignmentCardData) => void
  /** Callback when create new card is clicked */
  onCreateClick?: () => void
  /** Show the create new card */
  showCreateCard?: boolean
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Filter options for assignment cards
 */
export type AssignmentCardsFilterStatus = 'all' | 'published' | 'draft' | 'closed'

/**
 * Hook options for useAssignmentCards
 */
export interface UseAssignmentCardsOptions {
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean
  /** Filter by status */
  statusFilter?: AssignmentCardsFilterStatus
  /** Use mock data (default: based on environment) */
  useMock?: boolean
  /** Refresh interval in milliseconds (0 = disabled) */
  refreshInterval?: number
}

/**
 * Hook return type for useAssignmentCards
 */
export interface UseAssignmentCardsReturn {
  /** Array of all assignment cards (unfiltered) */
  assignments: AssignmentCardData[]
  /** Total count of assignments (unfiltered) */
  total: number
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Function to manually refresh assignments */
  refetch: () => Promise<void>
  /** Current filter status */
  statusFilter: AssignmentCardsFilterStatus
  /** Function to change filter status */
  setStatusFilter: (filter: AssignmentCardsFilterStatus) => void
  /** Filtered assignments based on current status filter */
  filteredAssignments: AssignmentCardData[]
  /** Counts by status for filter tabs */
  statusCounts: {
    all: number
    published: number
    draft: number
    closed: number
  }
}
