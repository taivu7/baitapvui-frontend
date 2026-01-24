/**
 * Question Builder API Service
 *
 * Handles API calls for question management operations.
 * Integrates with backend endpoints for questions and media.
 */

import apiClient from '../../services/api'
import { AxiosError } from 'axios'
import {
  Question,
  QuestionApiResponse,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ReorderQuestionsRequest,
  MediaUploadResponse,
  ApiErrorResponse,
  MediaAttachment,
  QuestionOption,
  QuestionType,
} from './types'

// =============================================================================
// Error Handling
// =============================================================================

/**
 * Custom error class for question API errors
 */
export class QuestionApiError extends Error {
  code: string
  fieldErrors: Array<{ field: string; message: string }>
  statusCode?: number

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    fieldErrors: Array<{ field: string; message: string }> = [],
    statusCode?: number
  ) {
    super(message)
    this.name = 'QuestionApiError'
    this.code = code
    this.fieldErrors = fieldErrors
    this.statusCode = statusCode
  }

  getFieldError(fieldName: string): string | undefined {
    const fieldError = this.fieldErrors.find((err) => err.field === fieldName)
    return fieldError?.message
  }

  isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR'
  }
}

/**
 * Parse axios error into QuestionApiError
 */
function parseApiError(error: unknown): QuestionApiError {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status
    const data = error.response?.data as ApiErrorResponse | undefined

    if (data) {
      return new QuestionApiError(
        data.message || 'An error occurred',
        data.code || 'API_ERROR',
        data.errors || [],
        statusCode
      )
    }

    if (error.code === 'ERR_NETWORK') {
      return new QuestionApiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        [],
        undefined
      )
    }

    return new QuestionApiError(
      error.message || 'An unexpected error occurred',
      'API_ERROR',
      [],
      statusCode
    )
  }

  return new QuestionApiError(
    error instanceof Error ? error.message : 'An unexpected error occurred',
    'UNKNOWN_ERROR'
  )
}

// =============================================================================
// Data Transformation
// =============================================================================

/**
 * Transform backend API response to frontend Question type
 */
export function transformQuestionResponse(response: QuestionApiResponse): Question {
  return {
    id: response.id,
    assignmentId: response.assignment_id,
    type: response.type,
    content: response.content,
    order: response.order,
    options: response.options?.map((opt) => ({
      id: opt.id,
      text: opt.text,
      isCorrect: opt.is_correct,
    })),
    media: response.media?.map((m) => ({
      id: m.id,
      type: m.type,
      url: m.url,
    })),
    createdAt: response.created_at,
    updatedAt: response.updated_at,
  }
}

// =============================================================================
// Question API Functions
// =============================================================================

/**
 * Create a new question
 */
export async function createQuestion(
  assignmentId: string,
  request: CreateQuestionRequest
): Promise<Question> {
  try {
    const response = await apiClient.post<QuestionApiResponse>(
      `/assignments/${assignmentId}/questions`,
      request
    )
    return transformQuestionResponse(response.data)
  } catch (error) {
    throw parseApiError(error)
  }
}

/**
 * Get all questions for an assignment
 */
export async function getQuestions(assignmentId: string): Promise<Question[]> {
  try {
    const response = await apiClient.get<QuestionApiResponse[]>(
      `/assignments/${assignmentId}/questions`
    )
    return response.data.map(transformQuestionResponse)
  } catch (error) {
    throw parseApiError(error)
  }
}

/**
 * Update an existing question
 */
export async function updateQuestion(
  questionId: string,
  request: UpdateQuestionRequest
): Promise<Question> {
  try {
    const response = await apiClient.put<QuestionApiResponse>(
      `/questions/${questionId}`,
      request
    )
    return transformQuestionResponse(response.data)
  } catch (error) {
    throw parseApiError(error)
  }
}

/**
 * Delete a question
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  try {
    await apiClient.delete(`/questions/${questionId}`)
  } catch (error) {
    throw parseApiError(error)
  }
}

/**
 * Reorder questions
 */
export async function reorderQuestions(
  assignmentId: string,
  request: ReorderQuestionsRequest
): Promise<void> {
  try {
    await apiClient.put(`/assignments/${assignmentId}/questions/reorder`, request)
  } catch (error) {
    throw parseApiError(error)
  }
}

// =============================================================================
// Media API Functions
// =============================================================================

/**
 * Upload media file
 */
export async function uploadMedia(file: File): Promise<MediaAttachment> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<MediaUploadResponse>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return {
      id: response.data.id,
      type: response.data.type,
      url: response.data.url,
      filename: response.data.filename,
    }
  } catch (error) {
    throw parseApiError(error)
  }
}

/**
 * Get presigned URL for media
 */
export async function getMediaUrl(mediaId: string): Promise<string> {
  try {
    const response = await apiClient.get<{ url: string }>(`/media/${mediaId}`)
    return response.data.url
  } catch (error) {
    throw parseApiError(error)
  }
}

/**
 * Delete media
 */
export async function deleteMedia(mediaId: string): Promise<void> {
  try {
    await apiClient.delete(`/media/${mediaId}`)
  } catch (error) {
    throw parseApiError(error)
  }
}

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validate question before save
 */
export function validateQuestion(
  type: QuestionType,
  content: string,
  options: QuestionOption[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Content is required
  if (!content.trim()) {
    errors.push('Question content is required')
  }

  // Multiple choice specific validation
  if (type === 'multiple_choice') {
    if (options.length === 0) {
      errors.push('Multiple choice questions must have at least one option')
    }

    const hasCorrectAnswer = options.some((opt) => opt.isCorrect)
    if (!hasCorrectAnswer) {
      errors.push('Multiple choice questions must have at least one correct answer')
    }

    const hasEmptyOption = options.some((opt) => !opt.text.trim())
    if (hasEmptyOption) {
      errors.push('All options must have text')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate file for media upload
 */
export function validateMediaFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = {
    image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav'],
    video: ['video/mp4', 'video/webm'],
  }

  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    audio: 50 * 1024 * 1024, // 50MB
    video: 100 * 1024 * 1024, // 100MB
  }

  // Check file type
  const fileType = file.type
  let category: 'image' | 'audio' | 'video' | null = null

  if (allowedTypes.image.includes(fileType)) {
    category = 'image'
  } else if (allowedTypes.audio.includes(fileType)) {
    category = 'audio'
  } else if (allowedTypes.video.includes(fileType)) {
    category = 'video'
  }

  if (!category) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: images (PNG, JPG), audio (MP3, WAV), video (MP4, WEBM)',
    }
  }

  // Check file size
  const maxSize = maxSizes[category]
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return {
      valid: false,
      error: `File too large. Maximum size for ${category}: ${maxSizeMB}MB`,
    }
  }

  return { valid: true }
}

// =============================================================================
// Export as default object
// =============================================================================

const questionApi = {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  uploadMedia,
  getMediaUrl,
  deleteMedia,
  validateQuestion,
  validateMediaFile,
  QuestionApiError,
}

export default questionApi
