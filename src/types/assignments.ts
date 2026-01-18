/**
 * Assignment Types for Teacher Dashboard
 *
 * These types define the data structures used for the Current Assignments List
 * on the Teacher Home Page (KAN-40).
 */

/**
 * Assignment status enum matching backend values
 */
export type AssignmentStatus = 'draft' | 'published' | 'closed'

/**
 * Assigned class information
 */
export interface AssignedClass {
  /** Class ID */
  class_id: number
  /** Class display name */
  class_name: string
}

/**
 * Assignment summary item from API
 * Maps to backend response structure from GET /api/v1/assignments/summary
 */
export interface AssignmentSummary {
  /** Unique assignment identifier */
  id: number
  /** Assignment title */
  title: string
  /** Assigned class information */
  assigned_class: AssignedClass
  /** Due date in YYYY-MM-DD format */
  due_date: string
  /** Due time in HH:MM format (24-hour), optional */
  due_time?: string
  /** Assignment status */
  status: AssignmentStatus
  /** Number of questions in the assignment */
  question_count: number
  /** Assignment creation timestamp (ISO 8601) */
  created_at: string
  /** Last update timestamp (ISO 8601) */
  updated_at: string
}

/**
 * API response for assignments summary endpoint
 * GET /api/v1/assignments/summary
 */
export interface AssignmentsSummaryResponse {
  /** Array of assignment summaries */
  assignments: AssignmentSummary[]
  /** Total count of assignments */
  total: number
}

/**
 * Props for the AssignmentStatusBadge component
 */
export interface AssignmentStatusBadgeProps {
  /** Assignment status to display */
  status: AssignmentStatus
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Props for the AssignmentCard component
 */
export interface AssignmentCardProps {
  /** Assignment data to display */
  assignment: AssignmentSummary
  /** Loading state for skeleton display */
  isLoading?: boolean
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Props for the AssignmentsList component
 */
export interface AssignmentsListProps {
  /** Array of assignments to display */
  assignments: AssignmentSummary[]
  /** Loading state */
  isLoading?: boolean
  /** Error message if any */
  error?: string | null
  /** Callback for retry on error */
  onRetry?: () => void
  /** Link destination for "View All" */
  viewAllHref?: string
  /** Title for the section */
  title?: string
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Hook return type for useTeacherAssignments
 */
export interface UseTeacherAssignmentsReturn {
  /** Array of assignment summaries */
  assignments: AssignmentSummary[]
  /** Total count of assignments */
  total: number
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Function to manually refresh assignments */
  refetch: () => Promise<void>
}
