/**
 * ValidationErrorBanner Component
 *
 * Displays a summary banner of validation errors from the backend.
 * Implements KAN-91: Display Validation Errors Before Publish
 *
 * Features:
 * - Shows summary error message at top
 * - Lists all validation errors with icons
 * - Click on error to scroll to the relevant section
 * - Dismiss button to clear errors
 * - Accessible with proper ARIA attributes
 */

import React, { memo, useCallback } from 'react'
import { ValidationError, ValidationErrorBannerProps } from '../../types/assignmentActions'

/**
 * Get icon for error scope
 */
const getErrorIcon = (scope: 'assignment' | 'question'): string => {
  return scope === 'assignment' ? 'description' : 'quiz'
}

/**
 * Get label for error scope
 */
const getErrorLabel = (error: ValidationError): string => {
  if (error.scope === 'assignment' && error.field) {
    // Convert field name to display label
    const fieldLabels: Record<string, string> = {
      title: 'Assignment Title',
      description: 'Instructions',
      dueDate: 'Due Date',
      dueTime: 'Due Time',
      classId: 'Class Selection',
    }
    return fieldLabels[error.field] || error.field
  }
  if (error.scope === 'question' && error.questionId) {
    return `Question ${error.questionId}`
  }
  return 'General'
}

/**
 * Individual error item component
 */
interface ErrorItemProps {
  error: ValidationError
  onClick?: (error: ValidationError) => void
}

const ErrorItem: React.FC<ErrorItemProps> = ({ error, onClick }) => {
  const handleClick = useCallback(() => {
    onClick?.(error)
  }, [error, onClick])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick?.(error)
      }
    },
    [error, onClick]
  )

  const isClickable = !!onClick

  return (
    <li
      className={`
        flex items-start gap-3 py-2 px-3
        rounded-lg
        ${isClickable ? 'cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors' : ''}
      `}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      aria-label={isClickable ? `Click to go to ${getErrorLabel(error)}` : undefined}
    >
      <span
        className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5"
        aria-hidden="true"
        style={{ fontSize: '18px' }}
      >
        {getErrorIcon(error.scope)}
      </span>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-red-800 dark:text-red-200">
          {getErrorLabel(error)}:
        </span>{' '}
        <span className="text-red-700 dark:text-red-300">{error.message}</span>
      </div>
      {isClickable && (
        <span
          className="material-symbols-outlined text-red-400 flex-shrink-0"
          aria-hidden="true"
          style={{ fontSize: '16px' }}
        >
          arrow_forward
        </span>
      )}
    </li>
  )
}

/**
 * ValidationErrorBanner Component
 *
 * Displays a summary of validation errors with the ability to navigate to each error.
 *
 * @param props - ValidationErrorBannerProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <ValidationErrorBanner
 *   errors={[
 *     { scope: 'assignment', field: 'title', message: 'Title is required' },
 *     { scope: 'question', questionId: 'q1', message: 'Must have at least one correct answer' }
 *   ]}
 *   onDismiss={() => clearErrors()}
 *   onErrorClick={(error) => scrollToError(error)}
 * />
 * ```
 */
const ValidationErrorBanner: React.FC<ValidationErrorBannerProps> = ({
  errors,
  onDismiss,
  onErrorClick,
  className = '',
}) => {
  // Don't render if no errors
  if (!errors || errors.length === 0) {
    return null
  }

  // Count errors by scope
  const assignmentErrors = errors.filter((e) => e.scope === 'assignment')
  const questionErrors = errors.filter((e) => e.scope === 'question')

  // Generate summary text
  const getSummaryText = (): string => {
    const parts: string[] = []
    if (assignmentErrors.length > 0) {
      parts.push(
        `${assignmentErrors.length} ${assignmentErrors.length === 1 ? 'field error' : 'field errors'}`
      )
    }
    if (questionErrors.length > 0) {
      parts.push(
        `${questionErrors.length} ${questionErrors.length === 1 ? 'question error' : 'question errors'}`
      )
    }
    return parts.join(' and ')
  }

  return (
    <div
      className={`
        rounded-xl
        bg-red-50 dark:bg-red-900/20
        border border-red-200 dark:border-red-800
        overflow-hidden
        ${className}
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-red-100/50 dark:bg-red-900/30">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-red-500"
            aria-hidden="true"
            style={{ fontSize: '24px' }}
          >
            error
          </span>
          <div>
            <h3 className="font-bold text-red-800 dark:text-red-200">
              Cannot publish assignment
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300">
              Please fix the following {getSummaryText()} before publishing.
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="
              p-1.5 rounded-lg
              text-red-500 hover:text-red-700
              hover:bg-red-200 dark:hover:bg-red-800
              transition-colors
            "
            aria-label="Dismiss error banner"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              close
            </span>
          </button>
        )}
      </div>

      {/* Error List */}
      <div className="px-2 py-2">
        <ul className="space-y-1" aria-label="List of validation errors">
          {/* Assignment-level errors first */}
          {assignmentErrors.map((error, index) => (
            <ErrorItem
              key={`assignment-${error.field || index}`}
              error={error}
              onClick={onErrorClick}
            />
          ))}

          {/* Question-level errors */}
          {questionErrors.map((error, index) => (
            <ErrorItem
              key={`question-${error.questionId || index}`}
              error={error}
              onClick={onErrorClick}
            />
          ))}
        </ul>
      </div>

      {/* Footer hint */}
      {onErrorClick && (
        <div className="px-4 py-2 border-t border-red-200 dark:border-red-800 bg-red-100/30 dark:bg-red-900/20">
          <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: '14px' }}
            >
              info
            </span>
            Click on an error to navigate to the relevant section.
          </p>
        </div>
      )}
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ValidationErrorBanner)
