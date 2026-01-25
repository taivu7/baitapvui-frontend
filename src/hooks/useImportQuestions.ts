/**
 * useImportQuestions Hook
 *
 * Custom hook for handling file upload and import questions functionality.
 * Implements KAN-101: File Upload & Progress Handling
 *
 * Features:
 * - File selection with drag-and-drop support
 * - Client-side file validation (type and size)
 * - Upload progress tracking
 * - Request cancellation support
 * - Error handling with retry capability
 */

import { useState, useCallback, useRef, useMemo } from 'react'
import { CancelTokenSource } from 'axios'
import {
  ImportQuestionsState,
  ImportedQuestion,
  FileValidationResult,
  UseImportQuestionsOptions,
  UseImportQuestionsReturn,
  DEFAULT_IMPORT_STATE,
  IMPORT_SUPPORTED_TYPES,
  ImportSupportedMimeType,
  IMPORT_MAX_FILE_SIZE,
  ImportError,
  IMPORT_ERROR_MESSAGES,
} from '../types/importQuestions'
import importQuestionsApi, { ImportApiError } from '../services/importQuestionsApi'
import { formatFileSize } from '../features/questions/utils'

// =============================================================================
// File Validation
// =============================================================================

/**
 * Validate file type
 */
function isValidFileType(file: File): boolean {
  const mimeType = file.type as ImportSupportedMimeType
  return mimeType in IMPORT_SUPPORTED_TYPES
}

/**
 * Validate file size
 */
function isValidFileSize(file: File): boolean {
  return file.size <= IMPORT_MAX_FILE_SIZE
}

/**
 * Validate a file for import
 */
function validateFile(file: File | null): FileValidationResult {
  if (!file) {
    return {
      valid: false,
      error: 'No file selected',
      errorCode: 'NO_FILE',
    }
  }

  if (!isValidFileType(file)) {
    const supportedExtensions = Object.values(IMPORT_SUPPORTED_TYPES).join(', ')
    return {
      valid: false,
      error: `Invalid file type. Supported formats: ${supportedExtensions}`,
      errorCode: 'INVALID_TYPE',
    }
  }

  if (!isValidFileSize(file)) {
    const maxSizeFormatted = formatFileSize(IMPORT_MAX_FILE_SIZE)
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeFormatted}`,
      errorCode: 'FILE_TOO_LARGE',
    }
  }

  return { valid: true }
}

// =============================================================================
// useImportQuestions Hook
// =============================================================================

/**
 * Custom hook for importing questions from files
 *
 * @param options - Hook configuration options
 * @returns Object containing state and actions for import functionality
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   selectFile,
 *   uploadFile,
 *   cancelUpload,
 *   reset,
 *   isUploading,
 *   canUpload,
 * } = useImportQuestions({
 *   assignmentId: '123',
 *   onSuccess: (questions, count) => {
 *     console.log(`Imported ${count} questions`)
 *   },
 *   onError: (error) => {
 *     console.error(error.message)
 *   },
 * })
 * ```
 */
function useImportQuestions(options: UseImportQuestionsOptions): UseImportQuestionsReturn {
  const { assignmentId, onSuccess, onError } = options

  // State
  const [state, setState] = useState<ImportQuestionsState>(DEFAULT_IMPORT_STATE)

  // Cancel token ref for request cancellation
  const cancelTokenRef = useRef<CancelTokenSource | null>(null)

  // =============================================================================
  // Actions
  // =============================================================================

  /**
   * Select and validate a file for import
   */
  const selectFile = useCallback((file: File): FileValidationResult => {
    // Validate the file
    const validation = validateFile(file)

    if (!validation.valid) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        file: null,
        error: validation.error || 'Invalid file',
        errorCode: validation.errorCode || null,
      }))
      return validation
    }

    // File is valid, update state
    setState((prev) => ({
      ...prev,
      status: 'idle',
      file,
      error: null,
      errorCode: null,
      uploadProgress: 0,
    }))

    return validation
  }, [])

  /**
   * Upload the selected file and import questions
   */
  const uploadFile = useCallback(async (): Promise<ImportedQuestion[]> => {
    // Check if file is selected
    if (!state.file) {
      const error: ImportError = {
        type: 'UNKNOWN_ERROR',
        message: 'No file selected',
      }
      onError?.(error)
      throw new Error(error.message)
    }

    // Create cancel token
    cancelTokenRef.current = importQuestionsApi.createCancelToken()

    try {
      // Set uploading state
      setState((prev) => ({
        ...prev,
        status: 'uploading',
        error: null,
        errorCode: null,
        uploadProgress: 0,
      }))

      // Upload file with progress tracking
      const { questions, count } = await importQuestionsApi.importQuestionsFromFile(
        assignmentId,
        state.file,
        (progress) => {
          setState((prev) => ({
            ...prev,
            uploadProgress: progress,
            status: progress === 100 ? 'processing' : 'uploading',
          }))
        },
        cancelTokenRef.current
      )

      // Success
      setState((prev) => ({
        ...prev,
        status: 'success',
        importedCount: count,
        importedQuestions: questions,
        error: null,
        errorCode: null,
      }))

      // Call success callback
      onSuccess?.(questions, count)

      return questions
    } catch (error) {
      // Handle cancellation
      if (error instanceof Error && error.message === 'Upload was cancelled') {
        setState((prev) => ({
          ...prev,
          status: 'idle',
          uploadProgress: 0,
        }))
        return []
      }

      // Handle API errors
      const importError: ImportError =
        error instanceof ImportApiError
          ? error.toImportError()
          : {
              type: 'UNKNOWN_ERROR',
              message: error instanceof Error ? error.message : IMPORT_ERROR_MESSAGES.UNKNOWN_ERROR,
            }

      setState((prev) => ({
        ...prev,
        status: 'error',
        error: importError.message,
        errorCode: importError.type,
        uploadProgress: 0,
      }))

      // Call error callback
      onError?.(importError)

      throw error
    } finally {
      cancelTokenRef.current = null
    }
  }, [assignmentId, state.file, onSuccess, onError])

  /**
   * Cancel an ongoing upload
   */
  const cancelUpload = useCallback(() => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Upload was cancelled by user')
      cancelTokenRef.current = null
    }

    setState((prev) => ({
      ...prev,
      status: 'idle',
      uploadProgress: 0,
    }))
  }, [])

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    // Cancel any pending upload
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Reset was called')
      cancelTokenRef.current = null
    }

    setState(DEFAULT_IMPORT_STATE)
  }, [])

  /**
   * Retry the upload with the currently selected file
   * Preserves the file selection and clears the error state
   */
  const retry = useCallback(async (): Promise<ImportedQuestion[]> => {
    // Clear error state but keep the file
    setState((prev) => ({
      ...prev,
      status: 'idle',
      error: null,
      errorCode: null,
      uploadProgress: 0,
    }))

    // Re-attempt upload
    return uploadFile()
  }, [uploadFile])

  // =============================================================================
  // Computed Values
  // =============================================================================

  const computed = useMemo(
    () => ({
      isIdle: state.status === 'idle',
      isValidating: state.status === 'validating',
      isUploading: state.status === 'uploading',
      isProcessing: state.status === 'processing',
      isSuccess: state.status === 'success',
      isError: state.status === 'error',
      canUpload: state.file !== null && state.status === 'idle',
      canRetry: state.file !== null && state.status === 'error',
    }),
    [state.status, state.file]
  )

  // =============================================================================
  // Return Value
  // =============================================================================

  return {
    state,
    selectFile,
    uploadFile,
    cancelUpload,
    reset,
    retry,
    ...computed,
  }
}

export default useImportQuestions
