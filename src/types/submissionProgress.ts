/**
 * Submission Progress Types for Teacher Dashboard (KAN-43)
 *
 * These types define the data structures used for displaying assignment
 * submission progress on the Teacher Home Page.
 */

/**
 * Individual assignment submission progress from API
 * Maps to backend response structure from GET /api/v1/assignments/submission-progress
 */
export interface AssignmentSubmissionProgress {
  /** Unique assignment identifier */
  assignment_id: number
  /** Assignment title */
  title: string
  /** Total number of students assigned */
  total_students: number
  /** Number of students who have submitted */
  submitted_count: number
  /** Timestamp of the most recent submission (ISO 8601) */
  last_submission_at: string | null
}

/**
 * API response for submission progress endpoint
 * GET /api/v1/assignments/submission-progress
 */
export interface SubmissionProgressResponse {
  /** Array of assignment submission progress data */
  assignments: AssignmentSubmissionProgress[]
}

/**
 * Processed submission progress data for display
 * Includes calculated percentage and formatted values
 */
export interface SubmissionProgressDisplayData {
  /** Unique assignment identifier */
  assignmentId: number
  /** Number of students who have submitted */
  submittedCount: number
  /** Total number of students assigned */
  totalStudents: number
  /** Submission percentage (0-100) */
  percentage: number
  /** Formatted display string (e.g., "12 / 30 submitted") */
  displayText: string
  /** Last submission timestamp */
  lastSubmissionAt: string | null
}

/**
 * Map of assignment ID to submission progress data
 * Used for efficient lookup when rendering assignment cards
 */
export type SubmissionProgressMap = Map<number, SubmissionProgressDisplayData>

/**
 * Props for the SubmissionProgressBar component
 */
export interface SubmissionProgressBarProps {
  /** Number of students who have submitted */
  submittedCount: number
  /** Total number of students assigned */
  totalStudents: number
  /** Optional additional CSS classes */
  className?: string
  /** Show text label (default: true) */
  showLabel?: boolean
  /** Size variant for the progress bar */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Hook options for useSubmissionProgress
 */
export interface UseSubmissionProgressOptions {
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean
  /** Refresh interval in milliseconds (0 = disabled) */
  refreshInterval?: number
  /** Use mock data (default: based on environment) */
  useMock?: boolean
}

/**
 * Hook return type for useSubmissionProgress
 */
export interface UseSubmissionProgressReturn {
  /** Map of assignment ID to submission progress data */
  progressMap: SubmissionProgressMap
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Function to manually refresh progress data */
  refetch: () => Promise<void>
  /** Get progress data for a specific assignment */
  getProgress: (assignmentId: number) => SubmissionProgressDisplayData | undefined
}
