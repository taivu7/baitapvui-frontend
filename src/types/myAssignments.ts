/**
 * My Assignments Dashboard Types
 *
 * Type definitions for the "My Assignments" dashboard page (KAN-117).
 * These types are used by the dashboard layout, data fetching hook,
 * and container components.
 */

/**
 * Assignment status enum matching backend values
 */
export type AssignmentStatus = 'draft' | 'published' | 'closed'

/**
 * Assignment item from API response
 * Maps to backend response structure from GET /api/v1/assignments
 */
export interface Assignment {
  /** Unique assignment identifier */
  id: number
  /** Assignment title */
  title: string
  /** Assignment status */
  status: AssignmentStatus
  /** Due date in YYYY-MM-DD format */
  due_date: string
  /** Due time in HH:MM format (24-hour) */
  due_time: string
  /** Assignment creation timestamp (ISO 8601) */
  created_at: string
  /** Last update timestamp (ISO 8601) */
  updated_at: string
}

/**
 * API response for assignments endpoint
 * GET /api/v1/assignments
 */
export interface AssignmentsResponse {
  /** Array of assignments */
  assignments: Assignment[]
  /** Total count of assignments */
  total: number
}

/**
 * Filter options for assignments list
 */
export type AssignmentFilterStatus = 'all' | 'published' | 'draft' | 'closed'

/**
 * Props for the MyAssignmentsLayout component (KAN-124)
 */
export interface MyAssignmentsLayoutProps {
  /** Title for the page header */
  title?: string
  /** Subtitle/description for the page header */
  subtitle?: string
  /** Callback when "Create New Assignment" button is clicked */
  onCreateAssignment?: () => void
  /** Content to render in the main area */
  children: React.ReactNode
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Props for the assignment filter tabs
 */
export interface AssignmentFilterTabsProps {
  /** Currently active filter */
  activeFilter: AssignmentFilterStatus
  /** Callback when filter changes */
  onFilterChange: (filter: AssignmentFilterStatus) => void
  /** Counts for each filter (for badge display) */
  counts?: {
    all: number
    published: number
    draft: number
    closed: number
  }
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Props for the MyAssignmentsDashboard container component (KAN-126)
 */
export interface MyAssignmentsDashboardProps {
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Props for AssignmentDashboardCard component
 */
export interface AssignmentDashboardCardProps {
  /** Assignment data */
  assignment: Assignment
  /** Optional callback when card is clicked */
  onClick?: (assignment: Assignment) => void
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Props for AssignmentDashboardCardSkeleton component
 */
export interface AssignmentDashboardCardSkeletonProps {
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Hook options for useMyAssignments (KAN-125)
 */
export interface UseMyAssignmentsOptions {
  /** Auto-fetch on mount */
  autoFetch?: boolean
  /** Filter by status */
  statusFilter?: AssignmentFilterStatus
  /** Use mock data (default: based on environment) */
  useMock?: boolean
}

/**
 * Hook return type for useMyAssignments (KAN-125)
 */
export interface UseMyAssignmentsReturn {
  /** Array of assignments */
  assignments: Assignment[]
  /** Total count of assignments (unfiltered) */
  total: number
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Function to manually refresh assignments */
  refetch: () => Promise<void>
  /** Current filter status */
  statusFilter: AssignmentFilterStatus
  /** Function to change filter status */
  setStatusFilter: (filter: AssignmentFilterStatus) => void
  /** Filtered assignments based on current status filter */
  filteredAssignments: Assignment[]
  /** Counts by status for filter tabs */
  statusCounts: {
    all: number
    published: number
    draft: number
    closed: number
  }
}
