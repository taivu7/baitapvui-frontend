/**
 * ImportQuestionsModal Component
 *
 * Modal component for importing questions from DOCX/PDF files.
 * Implements KAN-100: Build Import Questions UI
 * Implements KAN-102: Handle Import Success & Error States
 *
 * Features:
 * - Drag-and-drop file upload zone
 * - File type and size validation
 * - Upload progress indicator
 * - Success/error state display
 * - Accessibility (ARIA, keyboard navigation)
 * - Responsive design
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DraftQuestion, QuestionOption } from '../../features/questions/types'
import {
  ImportQuestionsModalProps,
  ImportedQuestion,
  IMPORT_MAX_FILE_SIZE,
} from '../../types/importQuestions'
import useImportQuestions from '../../hooks/useImportQuestions'
import Button from '../ui/Button'
import { ModalErrorBoundary } from '../ui/ErrorBoundary'
import { formatFileSize, generateUUID } from '../../features/questions/utils'

// =============================================================================
// Sub-components
// =============================================================================

/**
 * File Dropzone Component
 */
interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  isDisabled?: boolean
  error?: string | null
  isDragging: boolean
  onDragStateChange: (isDragging: boolean) => void
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  selectedFile,
  isDisabled = false,
  error,
  isDragging,
  onDragStateChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      fileInputRef.current?.click()
    }
  }, [isDisabled])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
        e.preventDefault()
        fileInputRef.current?.click()
      }
    },
    [isDisabled]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileSelect(file)
      }
      // Reset input to allow selecting same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onFileSelect]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isDisabled) {
        onDragStateChange(true)
      }
    },
    [isDisabled, onDragStateChange]
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onDragStateChange(false)
    },
    [onDragStateChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onDragStateChange(false)

      if (isDisabled) return

      const file = e.dataTransfer.files?.[0]
      if (file) {
        onFileSelect(file)
      }
    },
    [isDisabled, onFileSelect, onDragStateChange]
  )

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Upload document file. Supports DOCX and PDF files up to 10MB"
        aria-disabled={isDisabled}
        className={`
          relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center
          transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          dark:focus:ring-offset-[#0f1c13]
          ${isDragging
            ? 'border-primary bg-primary/10 dark:bg-primary/20'
            : error
              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
              : selectedFile
                ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Icon */}
        <span
          className={`material-symbols-outlined text-5xl mb-4 transition-transform duration-200 ${
            isDragging ? 'scale-110 text-primary' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {selectedFile ? 'description' : 'cloud_upload'}
        </span>

        {/* Main text */}
        {selectedFile ? (
          <div className="space-y-1">
            <p className="font-semibold text-gray-900 dark:text-white">
              {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(selectedFile.size)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Click or drag to replace
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              {isDragging ? 'Drop file here' : 'Drag and drop your file here'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or <span className="text-primary font-medium">click to browse</span>
            </p>
          </div>
        )}

        {/* File format hints */}
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              description
            </span>
            <span>DOCX, PDF</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              storage
            </span>
            <span>Max {formatFileSize(IMPORT_MAX_FILE_SIZE)}</span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <span className="material-symbols-outlined text-red-500 dark:text-red-400" style={{ fontSize: '18px' }}>
            error
          </span>
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
        onChange={handleFileChange}
        disabled={isDisabled}
        className="sr-only"
        aria-hidden="true"
      />
    </div>
  )
}

/**
 * Upload Progress Component
 */
interface UploadProgressProps {
  progress: number
  status: 'uploading' | 'processing'
  fileName?: string
  onCancel: () => void
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  status,
  fileName,
  onCancel,
}) => {
  const progressMessage = status === 'uploading'
    ? `${progress}% uploaded`
    : 'Extracting questions...'

  return (
    <div
      className="space-y-4"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Status indicator */}
      <div className="flex items-center justify-center gap-3">
        <span className="material-symbols-outlined text-primary animate-spin">
          progress_activity
        </span>
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {status === 'uploading'
            ? `Uploading${fileName ? `: ${fileName}` : '...'}`
            : 'Processing document...'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Upload progress: ${progress}%`}
          />
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {progressMessage}
        </p>
        {/* Screen reader announcement */}
        <span className="sr-only">{progressMessage}</span>
      </div>

      {/* Cancel button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

/**
 * Success Summary Component
 */
interface SuccessSummaryProps {
  count: number
  questions: ImportedQuestion[]
}

const SuccessSummary: React.FC<SuccessSummaryProps> = ({ count, questions }) => {
  const mcCount = questions.filter((q) => q.type === 'multiple_choice').length
  const essayCount = questions.filter((q) => q.type === 'essay').length

  return (
    <div className="text-center space-y-4">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-green-500 dark:text-green-400 text-3xl">
            check_circle
          </span>
        </div>
      </div>

      {/* Success message */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Successfully Imported!
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {count} question{count !== 1 ? 's' : ''} have been imported
        </p>
      </div>

      {/* Question breakdown */}
      <div className="flex justify-center gap-6 text-sm">
        {mcCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500" style={{ fontSize: '18px' }}>
              quiz
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {mcCount} Multiple Choice
            </span>
          </div>
        )}
        {essayCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-500" style={{ fontSize: '18px' }}>
              edit_note
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {essayCount} Essay
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// Main Modal Component
// =============================================================================

const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({
  isOpen,
  onClose,
  assignmentId,
  onImportSuccess,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Import hook
  const {
    state,
    selectFile,
    uploadFile,
    cancelUpload,
    reset,
    retry,
    isUploading,
    isProcessing,
    isSuccess,
    isError,
    canUpload,
    canRetry,
  } = useImportQuestions({
    assignmentId,
    onSuccess: (_questions, count) => {
      console.log(`Successfully imported ${count} questions`)
    },
    onError: (error) => {
      console.error('Import error:', error.message)
    },
  })

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      selectFile(file)
    },
    [selectFile]
  )

  // Transform imported questions to DraftQuestion format
  const transformToDraftQuestions = useCallback((questions: ImportedQuestion[]): DraftQuestion[] => {
    return questions.map((q, index) => ({
      id: generateUUID(),
      type: q.type,
      content: q.content,
      order: index, // Will be updated by the builder
      options: q.options as QuestionOption[],
      media: [],
      isSaved: false,
      isNewlyImported: true, // Flag for highlighting
    }))
  }, [])

  // Handle import
  const handleImport = useCallback(async () => {
    try {
      const questions = await uploadFile()
      const draftQuestions = transformToDraftQuestions(questions)
      onImportSuccess(draftQuestions)
    } catch {
      // Error is handled by the hook
    }
  }, [uploadFile, transformToDraftQuestions, onImportSuccess])

  // Handle retry - re-attempts upload with preserved file
  const handleRetry = useCallback(async () => {
    try {
      const questions = await retry()
      if (questions.length > 0) {
        const draftQuestions = transformToDraftQuestions(questions)
        onImportSuccess(draftQuestions)
      }
    } catch {
      // Error is handled by the hook
    }
  }, [retry, transformToDraftQuestions, onImportSuccess])

  // Handle close
  const handleClose = useCallback(() => {
    if (!isUploading && !isProcessing) {
      reset()
      onClose()
    }
  }, [isUploading, isProcessing, reset, onClose])

  // Handle confirm after success
  const handleConfirm = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isUploading && !isProcessing) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isUploading, isProcessing, handleClose])

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const showDropzone = !isUploading && !isProcessing && !isSuccess
  const showProgress = isUploading || isProcessing
  const showSuccess = isSuccess

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="import-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
        aria-hidden="true"
        onClick={handleClose}
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`
            relative bg-white dark:bg-[#0f1c13] rounded-2xl shadow-xl
            w-full max-w-lg transform transition-all
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2a3c30]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                  upload_file
                </span>
              </div>
              <h2
                id="import-modal-title"
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                Import Questions
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading || isProcessing}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {showDropzone && (
              <FileDropzone
                onFileSelect={handleFileSelect}
                selectedFile={state.file}
                isDisabled={false}
                error={isError ? state.error : null}
                isDragging={isDragging}
                onDragStateChange={setIsDragging}
              />
            )}

            {showProgress && (
              <UploadProgress
                progress={state.uploadProgress}
                status={isProcessing ? 'processing' : 'uploading'}
                fileName={state.file?.name}
                onCancel={cancelUpload}
              />
            )}

            {showSuccess && (
              <SuccessSummary
                count={state.importedCount}
                questions={state.importedQuestions}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-[#2a3c30]">
            {showDropzone && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isUploading || isProcessing}
                >
                  Cancel
                </Button>
                {canRetry ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleRetry}
                    icon="refresh"
                  >
                    Retry
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleImport}
                    disabled={!canUpload}
                    icon="upload"
                  >
                    Import Questions
                  </Button>
                )}
              </>
            )}

            {showSuccess && (
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirm}
                icon="check"
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Wrapped ImportQuestionsModal with ErrorBoundary
 */
const ImportQuestionsModalWithErrorBoundary: React.FC<ImportQuestionsModalProps> = (props) => {
  return (
    <ModalErrorBoundary
      onClose={props.onClose}
      title="Import Error"
      message="An unexpected error occurred while importing questions. Please close this dialog and try again."
      onError={(error, errorInfo) => {
        console.error('ImportQuestionsModal error:', error)
        console.error('Component stack:', errorInfo.componentStack)
      }}
    >
      <ImportQuestionsModal {...props} />
    </ModalErrorBoundary>
  )
}

export default ImportQuestionsModalWithErrorBoundary
