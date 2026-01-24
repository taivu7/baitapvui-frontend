/**
 * Assignment Draft Service
 *
 * Handles API calls for assignment draft operations.
 * Implements KAN-68: Integrate Save Draft API (Basic Info)
 *
 * Endpoints:
 * - POST /api/v1/assignments/drafts - Create new draft
 * - PUT /api/v1/assignments/drafts/:id - Update existing draft
 * - GET /api/v1/assignments/drafts/:id - Get draft by ID
 */

import apiClient from './api'
import {
  AssignmentFormData,
  DraftApiRequest,
  DraftApiResponse,
  ApiErrorResponse,
  ApiFieldError,
} from '../types/assignmentCreation'
import { AxiosError } from 'axios'

// =============================================================================
// Data Transformation Functions
// =============================================================================

/**
 * Transform frontend form data to backend API request format
 *
 * Key transformations:
 * - Combines dueDate + dueTime into ISO 8601 datetime for availability.from
 * - Calculates availability.to as end of day (23:59:59)
 * - Maps maxAttempts to attempts
 */
export function transformToApiRequest(formData: AssignmentFormData): DraftApiRequest {
  const { title, description, settings } = formData

  // Build availability object from dueDate and dueTime
  let availability: { from: string; to: string } | undefined

  if (settings.dueDate) {
    const time = settings.dueTime || '00:00'
    const fromDateTime = `${settings.dueDate}T${time}:00Z`
    const toDateTime = `${settings.dueDate}T23:59:59Z`

    availability = {
      from: fromDateTime,
      to: toDateTime,
    }
  }

  return {
    title,
    description: description || undefined,
    settings: {
      visibility: settings.visibility,
      attempts: settings.maxAttempts,
      availability,
    },
  }
}

/**
 * Transform backend API response to frontend form data format
 *
 * Key transformations:
 * - Splits availability.from into dueDate and dueTime
 * - Maps attempts to maxAttempts
 * - Extracts draft_id
 */
export function transformFromApiResponse(response: DraftApiResponse): Partial<AssignmentFormData> {
  const { draft_id, title, description, settings } = response

  // Extract dueDate and dueTime from availability.from
  let dueDate: string | null = null
  let dueTime: string | null = null

  if (settings?.availability?.from) {
    const fromParts = settings.availability.from.split('T')
    dueDate = fromParts[0] || null

    if (fromParts[1]) {
      // Extract HH:MM from the time portion
      dueTime = fromParts[1].substring(0, 5)
    }
  }

  return {
    draftId: draft_id,
    title,
    description: description || '',
    settings: {
      classId: '', // classId is not stored in backend yet
      dueDate,
      dueTime,
      visibility: settings?.visibility || 'draft',
      maxAttempts: settings?.attempts ?? null,
    },
  }
}

// =============================================================================
// Error Handling
// =============================================================================

/**
 * Custom error class for draft API errors
 */
export class DraftApiError extends Error {
  code: string
  fieldErrors: ApiFieldError[]
  statusCode?: number

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    fieldErrors: ApiFieldError[] = [],
    statusCode?: number
  ) {
    super(message)
    this.name = 'DraftApiError'
    this.code = code
    this.fieldErrors = fieldErrors
    this.statusCode = statusCode
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(fieldName: string): string | undefined {
    const fieldError = this.fieldErrors.find((err) => err.field === fieldName)
    return fieldError?.message
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR'
  }
}

/**
 * Parse axios error into DraftApiError
 */
function parseApiError(error: unknown): DraftApiError {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status
    const data = error.response?.data as ApiErrorResponse | undefined

    if (data) {
      return new DraftApiError(
        data.message || 'An error occurred',
        data.code || 'API_ERROR',
        data.errors || [],
        statusCode
      )
    }

    // Network error or no response data
    if (error.code === 'ERR_NETWORK') {
      return new DraftApiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        [],
        undefined
      )
    }

    return new DraftApiError(
      error.message || 'An unexpected error occurred',
      'API_ERROR',
      [],
      statusCode
    )
  }

  // Unknown error type
  return new DraftApiError(
    error instanceof Error ? error.message : 'An unexpected error occurred',
    'UNKNOWN_ERROR'
  )
}

// =============================================================================
// API Service Functions
// =============================================================================

/**
 * Create a new assignment draft
 *
 * @param formData - Frontend form data to create draft from
 * @returns Promise with the created draft response
 * @throws DraftApiError on failure
 */
export async function createDraft(formData: AssignmentFormData): Promise<DraftApiResponse> {
  try {
    const requestData = transformToApiRequest(formData)
    const response = await apiClient.post<DraftApiResponse>('/assignments/drafts', requestData)
    return response.data
  } catch (error) {
    throw parseApiError(error)
  }
}

/**
 * Update an existing assignment draft
 *
 * @param draftId - The UUID of the draft to update
 * @param formData - Frontend form data with updates
 * @returns Promise with the updated draft response
 * @throws DraftApiError on failure
 */
export async function updateDraft(
  draftId: string,
  formData: AssignmentFormData
): Promise<DraftApiResponse> {
  try {
    const requestData = transformToApiRequest(formData)
    const response = await apiClient.put<DraftApiResponse>(
      `/assignments/drafts/${draftId}`,
      requestData
    )
    return response.data
  } catch (error) {
    throw parseApiError(error)
  }
}

/**
 * Get an assignment draft by ID
 *
 * @param draftId - The UUID of the draft to retrieve
 * @returns Promise with the draft data
 * @throws DraftApiError on failure
 */
export async function getDraft(draftId: string): Promise<DraftApiResponse> {
  try {
    const response = await apiClient.get<DraftApiResponse>(`/assignments/drafts/${draftId}`)
    return response.data
  } catch (error) {
    throw parseApiError(error)
  }
}

// =============================================================================
// Export as default object for consistency with other services
// =============================================================================

const assignmentDraftService = {
  createDraft,
  updateDraft,
  getDraft,
  transformToApiRequest,
  transformFromApiResponse,
  DraftApiError,
}

export default assignmentDraftService
