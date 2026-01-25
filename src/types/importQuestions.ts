/**
 * Import Questions Types
 *
 * TypeScript types for the Import Questions from File feature.
 * Implements KAN-64 (parent story) with subtasks KAN-100 through KAN-103.
 */

import { DraftQuestion, QuestionType, QuestionOption } from '../features/questions/types'

// =============================================================================
// API Types
// =============================================================================

/**
 * Response from the import questions API endpoint
 */
export interface ImportQuestionsApiResponse {
  success: boolean
  message: string
  data: {
    imported_count: number
    questions: ImportedQuestionData[]
  }
}

/**
 * Question data as returned from the API
 */
export interface ImportedQuestionData {
  id: string
  type: QuestionType
  content: string
  order: number
  options?: Array<{
    id: string
    text: string
    is_correct: boolean
  }>
}

/**
 * Transformed imported question for frontend use
 */
export interface ImportedQuestion {
  id: string
  type: QuestionType
  content: string
  order: number
  options: QuestionOption[]
}

// =============================================================================
// File Validation Types
// =============================================================================

/**
 * Supported file types for import
 */
export const IMPORT_SUPPORTED_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
} as const

export type ImportSupportedMimeType = keyof typeof IMPORT_SUPPORTED_TYPES

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean
  error?: string
  errorCode?: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'NO_FILE'
}

/**
 * Maximum file size in bytes (10MB)
 */
export const IMPORT_MAX_FILE_SIZE = 10 * 1024 * 1024

// =============================================================================
// State Types
// =============================================================================

/**
 * Import process status
 */
export type ImportStatus = 'idle' | 'validating' | 'uploading' | 'processing' | 'success' | 'error'

/**
 * Import questions state for the hook
 */
export interface ImportQuestionsState {
  status: ImportStatus
  file: File | null
  uploadProgress: number
  importedCount: number
  importedQuestions: ImportedQuestion[]
  error: string | null
  errorCode: string | null
}

/**
 * Error types for import operations
 */
export type ImportErrorType =
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'NETWORK_ERROR'
  | 'PARSING_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR'

/**
 * Import error with additional context
 */
export interface ImportError {
  type: ImportErrorType
  message: string
  details?: string
}

// =============================================================================
// Hook Types
// =============================================================================

/**
 * Options for useImportQuestions hook
 */
export interface UseImportQuestionsOptions {
  assignmentId: string
  onSuccess?: (questions: ImportedQuestion[], count: number) => void
  onError?: (error: ImportError) => void
}

/**
 * Return value from useImportQuestions hook
 */
export interface UseImportQuestionsReturn {
  // State
  state: ImportQuestionsState

  // Actions
  selectFile: (file: File) => FileValidationResult
  uploadFile: () => Promise<ImportedQuestion[]>
  cancelUpload: () => void
  reset: () => void
  retry: () => Promise<ImportedQuestion[]>

  // Computed
  isIdle: boolean
  isValidating: boolean
  isUploading: boolean
  isProcessing: boolean
  isSuccess: boolean
  isError: boolean
  canUpload: boolean
  canRetry: boolean
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for ImportQuestionsModal component
 */
export interface ImportQuestionsModalProps {
  isOpen: boolean
  onClose: () => void
  assignmentId: string
  onImportSuccess: (questions: DraftQuestion[]) => void
  className?: string
}

/**
 * Props for FileDropzone component
 */
export interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  isDisabled?: boolean
  error?: string | null
  className?: string
}

/**
 * Props for UploadProgress component
 */
export interface UploadProgressProps {
  progress: number
  status: ImportStatus
  fileName?: string
  onCancel?: () => void
  className?: string
}

/**
 * Props for ImportResultSummary component
 */
export interface ImportResultSummaryProps {
  importedCount: number
  questions: ImportedQuestion[]
  onClose: () => void
  onConfirm: () => void
  className?: string
}

// =============================================================================
// Default Values
// =============================================================================

/**
 * Initial state for import questions
 */
export const DEFAULT_IMPORT_STATE: ImportQuestionsState = {
  status: 'idle',
  file: null,
  uploadProgress: 0,
  importedCount: 0,
  importedQuestions: [],
  error: null,
  errorCode: null,
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Map of error codes to user-friendly messages
 */
export const IMPORT_ERROR_MESSAGES: Record<ImportErrorType, string> = {
  INVALID_FILE_TYPE: 'Only DOCX and PDF files are supported.',
  FILE_TOO_LARGE: 'File size exceeds the 10MB limit.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  PARSING_ERROR: 'Failed to parse the file. Please ensure it contains valid questions.',
  UNAUTHORIZED: 'You are not authorized to import questions. Please log in as a teacher.',
  FORBIDDEN: 'You do not have permission to import questions to this assignment.',
  NOT_FOUND: 'Assignment not found. It may have been deleted.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
}
