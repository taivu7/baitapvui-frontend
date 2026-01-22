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
 * Submission progress data for display in AssignmentCard
 * Subset of SubmissionProgressDisplayData from submissionProgress.ts
 */
export interface AssignmentSubmissionProgressData {
  /** Number of students who have submitted */
  submittedCount: number
  /** Total number of students assigned */
  totalStudents: number
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
  /** Optional submission progress data for displaying progress bar */
  submissionProgress?: AssignmentSubmissionProgressData
  /** Whether to show submission progress bar (default: true if progress data provided) */
  showProgress?: boolean
}

/**
 * Function type for getting submission progress by assignment ID
 * Used to look up progress data from the submission progress map
 */
export type GetSubmissionProgressFn = (
  assignmentId: number
) => AssignmentSubmissionProgressData | undefined

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
  /** Function to get submission progress for an assignment (KAN-43) */
  getSubmissionProgress?: GetSubmissionProgressFn
  /** Whether to show submission progress bars (default: true) */
  showProgress?: boolean
  /** Callback when empty state CTA is clicked (KAN-53) */
  onEmptyAction?: () => void
  /** Custom empty state component to render (KAN-53) */
  emptyStateComponent?: React.ReactNode
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
