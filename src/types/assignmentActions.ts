/**
 * Assignment Actions Types
 *
 * TypeScript types for the Save Draft and Publish feature.
 * Implements KAN-89, KAN-90, KAN-91, KAN-92
 */

import { QuestionType, QuestionOption } from '../features/questions/types'

// =============================================================================
// Assignment Status
// =============================================================================

/**
 * Assignment status enum for API interactions
 * Using uppercase to match backend API responses
 */
export type ApiAssignmentStatus = 'DRAFT' | 'PUBLISHED'

/**
 * Maps API status to display-friendly lowercase status
 */
export const statusToDisplayMap: Record<ApiAssignmentStatus, 'draft' | 'published'> = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
}

// =============================================================================
// Save Draft Types (KAN-89)
// =============================================================================

/**
 * Basic info section of the save draft request
 */
export interface SaveDraftBasicInfo {
  /** Assignment title */
  title: string
  /** Assignment description/instructions */
  description?: string
  /** Due date in ISO 8601 format (nullable for drafts) */
  dueDate?: string | null
}

/**
 * Question data for save draft request
 */
export interface SaveDraftQuestion {
  /** Question local ID */
  id: string
  /** Question type */
  type: QuestionType
  /** Question content/text */
  content: string
  /** Answer options for multiple choice questions */
  options?: QuestionOption[]
}

/**
 * Request payload for saving a draft
 * POST /api/v1/assignments/{id}/draft
 */
export interface SaveDraftRequest {
  /** Basic assignment information */
  basicInfo: SaveDraftBasicInfo
  /** List of questions */
  questions: SaveDraftQuestion[]
}

/**
 * Response from save draft API
 */
export interface SaveDraftResponse {
  /** Assignment ID */
  assignmentId: string
  /** Assignment status after saving */
  status: ApiAssignmentStatus
  /** Last updated timestamp in ISO 8601 format */
  updatedAt: string
}

// =============================================================================
// Publish Types (KAN-90)
// =============================================================================

/**
 * Request payload for publishing an assignment
 * POST /api/v1/assignments/{id}/publish
 */
export interface PublishRequest {
  /** Basic assignment information */
  basicInfo: SaveDraftBasicInfo
  /** List of questions */
  questions: SaveDraftQuestion[]
}

/**
 * Response from publish API
 */
export interface PublishResponse {
  /** Assignment ID */
  assignmentId: string
  /** Assignment status after publishing */
  status: ApiAssignmentStatus
  /** Published timestamp in ISO 8601 format */
  publishedAt: string
}

/**
 * Response from load assignment API
 */
export interface AssignmentLoadResponse {
  /** Assignment ID */
  assignmentId: string
  /** Assignment status */
  status: ApiAssignmentStatus
  /** Assignment title */
  title: string
  /** Assignment description/instructions */
  description?: string
  /** Due date in ISO 8601 format */
  dueDate?: string | null
  /** Class ID */
  classId?: string
  /** List of questions */
  questions: SaveDraftQuestion[]
  /** Created timestamp in ISO 8601 format */
  createdAt: string
  /** Last updated timestamp in ISO 8601 format */
  updatedAt: string
  /** Published timestamp in ISO 8601 format (if published) */
  publishedAt?: string | null
}

// =============================================================================
// Validation Error Types (KAN-91)
// =============================================================================

/**
 * Scope of a validation error
 */
export type ValidationErrorScope = 'assignment' | 'question'

/**
 * Individual validation error from backend
 */
export interface ValidationError {
  /** Error scope - assignment level or question level */
  scope: ValidationErrorScope
  /** Field name for assignment-level errors (e.g., 'title', 'description') */
  field?: string
  /** Question ID for question-level errors */
  questionId?: string
  /** Human-readable error message */
  message: string
}

/**
 * Backend error response for publish validation failures
 * 400 Bad Request response structure
 */
export interface PublishValidationErrorResponse {
  /** Error code identifying the error type */
  code: 'PUBLISH_VALIDATION_ERROR'
  /** Error message */
  message?: string
  /** List of validation errors */
  errors: ValidationError[]
}

/**
 * Generic API error response
 */
export interface ApiErrorResponse {
  /** Error code */
  code: string
  /** Error message */
  message: string
  /** Validation errors (if applicable) */
  errors?: ValidationError[]
}

// =============================================================================
// Assignment State Types (KAN-92)
// =============================================================================

/**
 * Assignment state for managing status and UI control
 */
export interface AssignmentState {
  /** Current assignment ID (null if new) */
  assignmentId: string | null
  /** Current assignment status */
  status: ApiAssignmentStatus
  /** Whether the assignment is being saved */
  isSaving: boolean
  /** Whether the assignment is being published */
  isPublishing: boolean
  /** General error message */
  error: string | null
  /** Validation errors from backend */
  validationErrors: ValidationError[]
  /** Last saved timestamp */
  lastSavedAt: string | null
  /** Published timestamp */
  publishedAt: string | null
}

/**
 * Default assignment state
 */
export const DEFAULT_ASSIGNMENT_STATE: AssignmentState = {
  assignmentId: null,
  status: 'DRAFT',
  isSaving: false,
  isPublishing: false,
  error: null,
  validationErrors: [],
  lastSavedAt: null,
  publishedAt: null,
}

// =============================================================================
// Hook Return Types
// =============================================================================

/**
 * Return type for useAssignmentActions hook
 */
export interface UseAssignmentActionsReturn {
  /** Current assignment state */
  state: AssignmentState
  /** Whether any action is in progress */
  isLoading: boolean
  /** Whether the assignment can be edited */
  canEdit: boolean
  /** Whether the assignment can be published */
  canPublish: boolean
  /** Save the assignment as draft */
  saveDraft: (data: SaveDraftRequest) => Promise<SaveDraftResponse | null>
  /** Publish the assignment */
  publish: (data: PublishRequest) => Promise<PublishResponse | null>
  /** Clear all errors */
  clearErrors: () => void
  /** Clear validation errors for a specific field/question */
  clearFieldError: (field?: string, questionId?: string) => void
  /** Get validation errors for assignment fields */
  getFieldErrors: () => Record<string, string>
  /** Get validation errors for questions */
  getQuestionErrors: () => Record<string, string>
  /** Update status from external source */
  setStatus: (status: ApiAssignmentStatus) => void
  /** Set assignment ID */
  setAssignmentId: (id: string | null) => void
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for ValidationErrorBanner component
 */
export interface ValidationErrorBannerProps {
  /** List of validation errors to display */
  errors: ValidationError[]
  /** Callback when user clicks to dismiss */
  onDismiss?: () => void
  /** Callback when user clicks an error to scroll to it */
  onErrorClick?: (error: ValidationError) => void
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Props for AssignmentActions component
 */
export interface AssignmentActionsProps {
  /** Current assignment status */
  status: ApiAssignmentStatus
  /** Whether save draft action is in progress */
  isSaving: boolean
  /** Whether publish action is in progress */
  isPublishing: boolean
  /** Whether the form is valid for draft saving */
  isValidForDraft: boolean
  /** Whether the form is valid for publishing */
  isValidForPublish: boolean
  /** Callback when save draft is clicked */
  onSaveDraft: () => void
  /** Callback when publish is clicked */
  onPublish: () => void
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Props for ConfirmPublishDialog component
 */
export interface ConfirmPublishDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Whether publish action is in progress */
  isPublishing: boolean
  /** Assignment title for display */
  assignmentTitle: string
  /** Callback when user confirms publish */
  onConfirm: () => void
  /** Callback when user cancels */
  onCancel: () => void
}
