/**
 * Assignment Creation Types
 *
 * TypeScript types for the Assignment Creation workflow.
 * These types support Tasks KAN-65, KAN-66, KAN-67, and KAN-68.
 */

/**
 * Assignment visibility/status options
 */
export type AssignmentVisibility = 'draft' | 'published'

// =============================================================================
// API Request/Response Types (Backend Contract)
// =============================================================================

/**
 * Backend API request for creating/updating a draft
 */
export interface DraftApiRequest {
  title: string
  description?: string
  settings?: {
    visibility: AssignmentVisibility
    attempts?: number | null
    availability?: {
      from: string // ISO 8601 datetime
      to: string // ISO 8601 datetime
    }
  }
}

/**
 * Backend API response for draft operations
 */
export interface DraftApiResponse {
  draft_id: string // UUID
  teacher_id: number
  title: string
  description: string
  settings: {
    visibility: AssignmentVisibility
    attempts?: number | null
    availability?: {
      from: string
      to: string
    }
  }
  status: string
  created_at: string
  updated_at: string
}

/**
 * Backend API validation error format
 */
export interface ApiFieldError {
  field: string
  message: string
}

/**
 * Backend API error response
 */
export interface ApiErrorResponse {
  code: string
  message: string
  errors?: ApiFieldError[]
}

/**
 * Assignment settings configuration
 */
export interface AssignmentSettings {
  /** Selected class ID */
  classId: string
  /** Due date in YYYY-MM-DD format */
  dueDate: string | null
  /** Due time in HH:MM format (24-hour) */
  dueTime: string | null
  /** Assignment visibility status */
  visibility: AssignmentVisibility
  /** Maximum number of attempts allowed (null = unlimited) */
  maxAttempts: number | null
}

/**
 * Complete assignment creation form data
 * This structure is designed to sync with backend draft APIs
 */
export interface AssignmentFormData {
  /** Draft ID from backend (null if not yet saved) */
  draftId: string | null
  /** Assignment title (required) */
  title: string
  /** Assignment description/instructions (optional) */
  description: string
  /** Assignment settings */
  settings: AssignmentSettings
}

/**
 * Default values for assignment settings
 */
export const DEFAULT_ASSIGNMENT_SETTINGS: AssignmentSettings = {
  classId: '',
  dueDate: null,
  dueTime: null,
  visibility: 'draft',
  maxAttempts: null,
}

/**
 * Default values for assignment form data
 */
export const DEFAULT_ASSIGNMENT_FORM_DATA: AssignmentFormData = {
  draftId: null,
  title: '',
  description: '',
  settings: { ...DEFAULT_ASSIGNMENT_SETTINGS },
}

/**
 * Action types for assignment creation reducer
 */
export type AssignmentCreationAction =
  | { type: 'SET_DRAFT_ID'; payload: string | null }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_SETTINGS'; payload: Partial<AssignmentSettings> }
  | { type: 'SET_CLASS_ID'; payload: string }
  | { type: 'SET_DUE_DATE'; payload: string | null }
  | { type: 'SET_DUE_TIME'; payload: string | null }
  | { type: 'SET_VISIBILITY'; payload: AssignmentVisibility }
  | { type: 'SET_MAX_ATTEMPTS'; payload: number | null }
  | { type: 'RESET' }
  | { type: 'LOAD_FROM_STORAGE'; payload: AssignmentFormData }

/**
 * Storage key for sessionStorage persistence
 */
export const ASSIGNMENT_CREATION_STORAGE_KEY = 'baitapvui_assignment_creation'

/**
 * Validation error messages
 */
export interface AssignmentFormErrors {
  title?: string
  description?: string
  classId?: string
  dueDate?: string
  dueTime?: string
}

/**
 * Props for AssignmentBasicInfoForm component
 */
export interface AssignmentBasicInfoFormProps {
  /** Optional additional CSS classes */
  className?: string
  /** Whether the form is in a loading/submitting state */
  isSubmitting?: boolean
  /** Server-side validation errors to display */
  serverErrors?: AssignmentFormErrors
}

/**
 * Props for AssignmentSettingsPanel component
 */
export interface AssignmentSettingsPanelProps {
  /** Optional additional CSS classes */
  className?: string
  /** Whether the panel is in a loading state */
  isLoading?: boolean
}

/**
 * Class option for the class selector dropdown
 */
export interface ClassOption {
  /** Class ID */
  id: string
  /** Class display name */
  name: string
  /** Number of students in the class */
  studentCount?: number
}

/**
 * Props for ClassSelector component
 */
export interface ClassSelectorProps {
  /** Currently selected class ID */
  value: string
  /** Callback when class selection changes */
  onChange: (classId: string) => void
  /** Available classes to choose from */
  classes: ClassOption[]
  /** Error message to display */
  error?: string
  /** Whether the selector is disabled */
  disabled?: boolean
  /** Whether the selector is in a loading state */
  isLoading?: boolean
  /** Optional additional CSS classes */
  className?: string
}
