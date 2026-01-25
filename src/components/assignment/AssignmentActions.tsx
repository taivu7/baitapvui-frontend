/**
 * AssignmentActions Component
 *
 * Action buttons for Save Draft and Publish assignment actions.
 * Implements KAN-89 and KAN-90
 *
 * Features:
 * - Save Draft button with loading state
 * - Publish button with confirmation dialog
 * - Disabled states based on assignment status
 * - Accessible with proper ARIA attributes
 */

import React, { memo, useState, useCallback } from 'react'
import { AssignmentActionsProps, ConfirmPublishDialogProps } from '../../types/assignmentActions'

// =============================================================================
// ConfirmPublishDialog Component
// =============================================================================

/**
 * Confirmation dialog for publishing an assignment
 */
const ConfirmPublishDialog: React.FC<ConfirmPublishDialogProps> = ({
  isOpen,
  isPublishing,
  assignmentTitle,
  onConfirm,
  onCancel,
}) => {
  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !isPublishing) {
        onCancel()
      }
    },
    [isPublishing, onCancel]
  )

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isPublishing) {
        onCancel()
      }
    },
    [isPublishing, onCancel]
  )

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-dialog-title"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: '24px' }}
            >
              publish
            </span>
          </div>
          <div>
            <h2
              id="publish-dialog-title"
              className="text-lg font-bold text-gray-900 dark:text-white"
            >
              Publish Assignment
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to publish{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              "{assignmentTitle || 'this assignment'}"
            </span>
            ?
          </p>
          <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <span
                className="material-symbols-outlined text-amber-500 flex-shrink-0"
                style={{ fontSize: '20px' }}
              >
                warning
              </span>
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium">Once published:</p>
                <ul className="mt-1 space-y-1 list-disc list-inside text-amber-700 dark:text-amber-300">
                  <li>Students will be able to see and complete the assignment</li>
                  <li>You will not be able to make major changes</li>
                  <li>The assignment cannot be unpublished</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onCancel}
            disabled={isPublishing}
            className="
              px-4 py-2.5 rounded-xl
              text-gray-600 dark:text-gray-300 font-medium
              hover:bg-gray-100 dark:hover:bg-gray-800
              border border-gray-200 dark:border-gray-700
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPublishing}
            className="
              px-4 py-2.5 rounded-xl
              bg-primary text-[#0d3b1e] font-bold
              hover:bg-[#00d649]
              shadow-lg shadow-green-500/20
              active:scale-95
              transition-all
              flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isPublishing ? (
              <>
                <span
                  className="material-symbols-outlined animate-spin"
                  style={{ fontSize: '18px' }}
                >
                  progress_activity
                </span>
                Publishing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  publish
                </span>
                Publish Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// AssignmentActions Component
// =============================================================================

/**
 * AssignmentActions Component
 *
 * Provides Save Draft and Publish buttons for assignment management.
 *
 * @param props - AssignmentActionsProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <AssignmentActions
 *   status="DRAFT"
 *   isSaving={false}
 *   isPublishing={false}
 *   isValidForDraft={true}
 *   isValidForPublish={true}
 *   onSaveDraft={handleSaveDraft}
 *   onPublish={handlePublish}
 * />
 * ```
 */
const AssignmentActions: React.FC<AssignmentActionsProps> = ({
  status,
  isSaving,
  isPublishing,
  isValidForDraft,
  isValidForPublish,
  onSaveDraft,
  onPublish,
  className = '',
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const isLoading = isSaving || isPublishing
  const isPublished = status === 'PUBLISHED'

  /**
   * Handle save draft click
   */
  const handleSaveDraftClick = useCallback(() => {
    if (!isLoading && isValidForDraft && !isPublished) {
      onSaveDraft()
    }
  }, [isLoading, isValidForDraft, isPublished, onSaveDraft])

  /**
   * Handle publish click - show confirmation dialog
   */
  const handlePublishClick = useCallback(() => {
    if (!isLoading && isValidForPublish && !isPublished) {
      setShowConfirmDialog(true)
    }
  }, [isLoading, isValidForPublish, isPublished])

  /**
   * Handle confirm publish
   */
  const handleConfirmPublish = useCallback(() => {
    onPublish()
  }, [onPublish])

  /**
   * Handle cancel publish
   */
  const handleCancelPublish = useCallback(() => {
    if (!isPublishing) {
      setShowConfirmDialog(false)
    }
  }, [isPublishing])

  // Close dialog when publishing completes
  React.useEffect(() => {
    if (!isPublishing && showConfirmDialog) {
      // Small delay to show success state before closing
      const timer = setTimeout(() => {
        setShowConfirmDialog(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isPublishing, showConfirmDialog])

  // If already published, show read-only indicator
  if (isPublished) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <span
            className="material-symbols-outlined text-green-600 dark:text-green-400"
            style={{ fontSize: '18px' }}
          >
            check_circle
          </span>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Published
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Save Draft Button */}
        <button
          onClick={handleSaveDraftClick}
          disabled={isLoading || !isValidForDraft}
          className="
            px-5 py-2.5 rounded-xl
            text-gray-600 dark:text-gray-300 font-medium
            hover:bg-white dark:hover:bg-white/5
            border border-transparent hover:border-gray-200 dark:hover:border-gray-700
            transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2
          "
          aria-label={isSaving ? 'Saving draft...' : 'Save as draft'}
        >
          {isSaving ? (
            <>
              <span
                className="material-symbols-outlined animate-spin"
                style={{ fontSize: '18px' }}
              >
                progress_activity
              </span>
              Saving...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                save
              </span>
              Save Draft
            </>
          )}
        </button>

        {/* Publish Button */}
        <button
          onClick={handlePublishClick}
          disabled={isLoading || !isValidForPublish}
          className="
            px-5 py-2.5 rounded-xl
            bg-primary text-[#0d3b1e] font-bold
            hover:bg-[#00d649]
            shadow-lg shadow-green-500/20
            active:scale-95
            transition-all
            flex items-center gap-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
          "
          aria-label={isPublishing ? 'Publishing...' : 'Publish assignment'}
        >
          {isPublishing ? (
            <>
              <span
                className="material-symbols-outlined animate-spin"
                style={{ fontSize: '18px' }}
              >
                progress_activity
              </span>
              Publishing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                publish
              </span>
              Publish
            </>
          )}
        </button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmPublishDialog
        isOpen={showConfirmDialog}
        isPublishing={isPublishing}
        assignmentTitle=""
        onConfirm={handleConfirmPublish}
        onCancel={handleCancelPublish}
      />
    </>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(AssignmentActions)
