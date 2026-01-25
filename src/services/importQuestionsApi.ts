/**
 * Import Questions API Service
 *
 * Handles API calls for importing questions from files (DOCX, PDF).
 * Implements KAN-64 backend API integration.
 *
 * Endpoint: POST /api/v1/assignments/:id/import-questions
 */

import apiClient from './api'
import { AxiosError, AxiosProgressEvent, CancelTokenSource } from 'axios'
import axios from 'axios'
import {
  ImportQuestionsApiResponse,
  ImportedQuestion,
  ImportedQuestionData,
  ImportError,
  ImportErrorType,
  IMPORT_ERROR_MESSAGES,
} from '../types/importQuestions'

// =============================================================================
// Error Handling
// =============================================================================

/**
 * Custom error class for import API errors
 */
export class ImportApiError extends Error {
  type: ImportErrorType
  details?: string
  statusCode?: number

  constructor(type: ImportErrorType, message: string, details?: string, statusCode?: number) {
    super(message)
    this.name = 'ImportApiError'
    this.type = type
    this.details = details
    this.statusCode = statusCode
  }

  toImportError(): ImportError {
    return {
      type: this.type,
      message: this.message,
      details: this.details,
    }
  }
}

/**
 * Parse Axios error into ImportApiError
 */
function parseApiError(error: unknown): ImportApiError {
  if (axios.isCancel(error)) {
    return new ImportApiError(
      'UNKNOWN_ERROR',
      'Upload was cancelled',
      undefined,
      undefined
    )
  }

  if (error instanceof AxiosError) {
    const statusCode = error.response?.status
    const data = error.response?.data as { error?: string; message?: string } | undefined

    // Handle specific HTTP status codes
    switch (statusCode) {
      case 400:
        // Bad request - likely parsing error or invalid file
        return new ImportApiError(
          'PARSING_ERROR',
          data?.message || IMPORT_ERROR_MESSAGES.PARSING_ERROR,
          data?.error,
          statusCode
        )

      case 401:
        return new ImportApiError(
          'UNAUTHORIZED',
          data?.message || IMPORT_ERROR_MESSAGES.UNAUTHORIZED,
          data?.error,
          statusCode
        )

      case 403:
        return new ImportApiError(
          'FORBIDDEN',
          data?.message || IMPORT_ERROR_MESSAGES.FORBIDDEN,
          data?.error,
          statusCode
        )

      case 404:
        return new ImportApiError(
          'NOT_FOUND',
          data?.message || IMPORT_ERROR_MESSAGES.NOT_FOUND,
          data?.error,
          statusCode
        )

      case 413:
        return new ImportApiError(
          'FILE_TOO_LARGE',
          data?.message || IMPORT_ERROR_MESSAGES.FILE_TOO_LARGE,
          data?.error,
          statusCode
        )

      case 415:
        return new ImportApiError(
          'INVALID_FILE_TYPE',
          data?.message || IMPORT_ERROR_MESSAGES.INVALID_FILE_TYPE,
          data?.error,
          statusCode
        )

      case 422:
        // Unprocessable entity - parsing/validation error
        return new ImportApiError(
          'PARSING_ERROR',
          data?.message || IMPORT_ERROR_MESSAGES.PARSING_ERROR,
          data?.error,
          statusCode
        )

      case 500:
      case 502:
      case 503:
      case 504:
        return new ImportApiError(
          'SERVER_ERROR',
          data?.message || IMPORT_ERROR_MESSAGES.SERVER_ERROR,
          data?.error,
          statusCode
        )

      default:
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
          return new ImportApiError(
            'NETWORK_ERROR',
            IMPORT_ERROR_MESSAGES.NETWORK_ERROR,
            error.message,
            undefined
          )
        }

        return new ImportApiError(
          'UNKNOWN_ERROR',
          data?.message || IMPORT_ERROR_MESSAGES.UNKNOWN_ERROR,
          data?.error || error.message,
          statusCode
        )
    }
  }

  return new ImportApiError(
    'UNKNOWN_ERROR',
    error instanceof Error ? error.message : IMPORT_ERROR_MESSAGES.UNKNOWN_ERROR
  )
}

// =============================================================================
// Data Transformation
// =============================================================================

/**
 * Transform API response question to frontend format
 */
function transformQuestion(question: ImportedQuestionData): ImportedQuestion {
  return {
    id: question.id,
    type: question.type,
    content: question.content,
    order: question.order,
    options: question.options?.map(opt => ({
      id: opt.id,
      text: opt.text,
      isCorrect: opt.is_correct,
    })) || [],
  }
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Create a cancel token source for upload cancellation
 */
export function createCancelToken(): CancelTokenSource {
  return axios.CancelToken.source()
}

/**
 * Import questions from a file
 *
 * @param assignmentId - The ID of the assignment to import questions into
 * @param file - The file to import (DOCX or PDF)
 * @param onProgress - Optional callback for upload progress (0-100)
 * @param cancelToken - Optional cancel token source for cancellation
 * @returns Promise resolving to the imported questions
 */
export async function importQuestionsFromFile(
  assignmentId: string,
  file: File,
  onProgress?: (progress: number) => void,
  cancelToken?: CancelTokenSource
): Promise<{ questions: ImportedQuestion[]; count: number }> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ImportQuestionsApiResponse>(
      `/assignments/${assignmentId}/import-questions`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentCompleted)
          }
        },
        cancelToken: cancelToken?.token,
        // Set a longer timeout for file uploads
        timeout: 120000, // 2 minutes
      }
    )

    if (!response.data.success) {
      throw new ImportApiError(
        'PARSING_ERROR',
        response.data.message || 'Failed to import questions',
        undefined,
        undefined
      )
    }

    const questions = response.data.data.questions.map(transformQuestion)

    return {
      questions,
      count: response.data.data.imported_count,
    }
  } catch (error) {
    throw parseApiError(error)
  }
}

// =============================================================================
// Export as default object
// =============================================================================

const importQuestionsApi = {
  importQuestionsFromFile,
  createCancelToken,
  ImportApiError,
}

export default importQuestionsApi
