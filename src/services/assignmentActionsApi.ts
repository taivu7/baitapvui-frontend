/**
 * Assignment Actions API Service
 *
 * Handles API calls for Save Draft and Publish assignment actions.
 * Implements KAN-89 and KAN-90
 *
 * Endpoints:
 * - POST /api/v1/assignments/{id}/draft - Save assignment as draft
 * - POST /api/v1/assignments/{id}/publish - Publish assignment
 */

import { AxiosError } from 'axios'
import apiClient from './api'
import {
  SaveDraftRequest,
  SaveDraftResponse,
  PublishRequest,
  PublishResponse,
  PublishValidationErrorResponse,
  ApiErrorResponse,
  ValidationError,
  AssignmentLoadResponse,
} from '../types/assignmentActions'

// =============================================================================
// Error Classes
// =============================================================================

/**
 * Custom error class for assignment action API errors
 */
export class AssignmentActionError extends Error {
  /** Error code from backend */
  code: string
  /** HTTP status code */
  statusCode?: number
  /** Validation errors from backend */
  validationErrors: ValidationError[]

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    validationErrors: ValidationError[] = [],
    statusCode?: number
  ) {
    super(message)
    this.name = 'AssignmentActionError'
    this.code = code
    this.validationErrors = validationErrors
    this.statusCode = statusCode
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return this.code === 'PUBLISH_VALIDATION_ERROR' || this.validationErrors.length > 0
  }

  /**
   * Check if this is a conflict error (already published)
   */
  isConflictError(): boolean {
    return this.statusCode === 409
  }

  /**
   * Check if this is a forbidden error (not owner)
   */
  isForbiddenError(): boolean {
    return this.statusCode === 403
  }

  /**
   * Check if this is a not found error
   */
  isNotFoundError(): boolean {
    return this.statusCode === 404
  }

  /**
   * Get validation errors for assignment-level fields
   */
  getFieldErrors(): Record<string, string> {
    const fieldErrors: Record<string, string> = {}
    for (const error of this.validationErrors) {
      if (error.scope === 'assignment' && error.field) {
        fieldErrors[error.field] = error.message
      }
    }
    return fieldErrors
  }

  /**
   * Get validation errors for questions
   */
  getQuestionErrors(): Record<string, string> {
    const questionErrors: Record<string, string> = {}
    for (const error of this.validationErrors) {
      if (error.scope === 'question' && error.questionId) {
        questionErrors[error.questionId] = error.message
      }
    }
    return questionErrors
  }
}

// =============================================================================
// Error Parsing
// =============================================================================

/**
 * Parse axios error into AssignmentActionError
 */
function parseApiError(error: unknown): AssignmentActionError {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status
    const data = error.response?.data as ApiErrorResponse | PublishValidationErrorResponse | undefined

    if (data) {
      // Check if data has message property (type guard)
      const message = 'message' in data ? data.message : undefined

      // Handle validation errors
      if ('errors' in data && Array.isArray(data.errors)) {
        return new AssignmentActionError(
          message || getErrorMessage(statusCode),
          data.code || 'API_ERROR',
          data.errors,
          statusCode
        )
      }

      // Handle general API errors
      return new AssignmentActionError(
        message || getErrorMessage(statusCode),
        data.code || 'API_ERROR',
        [],
        statusCode
      )
    }

    // Network error
    if (error.code === 'ERR_NETWORK') {
      return new AssignmentActionError(
        'Network error. Please check your connection and try again.',
        'NETWORK_ERROR',
        [],
        undefined
      )
    }

    // Timeout error
    if (error.code === 'ECONNABORTED') {
      return new AssignmentActionError(
        'Request timed out. Please try again.',
        'TIMEOUT_ERROR',
        [],
        undefined
      )
    }

    return new AssignmentActionError(
      getErrorMessage(statusCode),
      'API_ERROR',
      [],
      statusCode
    )
  }

  // Unknown error type
  return new AssignmentActionError(
    error instanceof Error ? error.message : 'An unexpected error occurred',
    'UNKNOWN_ERROR'
  )
}

/**
 * Get user-friendly error message based on status code
 */
function getErrorMessage(statusCode?: number, data?: ApiErrorResponse): string {
  if (data?.message) {
    return data.message
  }

  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.'
    case 401:
      return 'You are not authenticated. Please log in and try again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'Assignment not found.'
    case 409:
      return 'This assignment has already been published.'
    case 422:
      return 'Validation failed. Please fix the errors and try again.'
    case 500:
      return 'Server error. Please try again later.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Save assignment as draft
 *
 * @param assignmentId - The ID of the assignment to save
 * @param data - The draft data to save
 * @returns Promise with the save draft response
 * @throws AssignmentActionError on failure
 */
export async function saveDraft(
  assignmentId: string,
  data: SaveDraftRequest
): Promise<SaveDraftResponse> {
  try {
    const response = await apiClient.post<SaveDraftResponse>(
      `/assignments/${assignmentId}/draft`,
      data
    )
    return response.data
  } catch (error) {
    throw parseApiError(error)
  }
}

/**
 * Publish an assignment
 *
 * @param assignmentId - The ID of the assignment to publish
 * @param data - The assignment data to publish
 * @returns Promise with the publish response
 * @throws AssignmentActionError on failure
 */
export async function publishAssignment(
  assignmentId: string,
  data: PublishRequest
): Promise<PublishResponse> {
  try {
    const response = await apiClient.post<PublishResponse>(
      `/assignments/${assignmentId}/publish`,
      data
    )
    return response.data
  } catch (error) {
    throw parseApiError(error)
  }
}

/**
 * Create a new assignment (returns assignment ID)
 * Used when saving a draft for a new assignment that doesn't have an ID yet
 *
 * @param data - The draft data to create
 * @returns Promise with the save draft response including new assignment ID
 * @throws AssignmentActionError on failure
 */
export async function createAssignment(
  data: SaveDraftRequest
): Promise<SaveDraftResponse> {
  try {
    const response = await apiClient.post<SaveDraftResponse>(
      '/assignments',
      data
    )
    return response.data
  } catch (error) {
    throw parseApiError(error)
  }
}

/**
 * Load an existing assignment by ID
 *
 * @param assignmentId - The ID of the assignment to load
 * @returns Promise with the assignment data
 * @throws AssignmentActionError on failure
 */
export async function loadAssignment(
  assignmentId: string
): Promise<AssignmentLoadResponse> {
  try {
    const response = await apiClient.get<AssignmentLoadResponse>(
      `/assignments/${assignmentId}`
    )
    return response.data
  } catch (error) {
    throw parseApiError(error)
  }
}

// =============================================================================
// Export
// =============================================================================

const assignmentActionsApi = {
  saveDraft,
  publishAssignment,
  createAssignment,
  loadAssignment,
  AssignmentActionError,
}

export default assignmentActionsApi
