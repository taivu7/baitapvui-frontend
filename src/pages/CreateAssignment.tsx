/**
 * CreateAssignment Page
 *
 * Assignment creation page for teachers.
 * Implements KAN-65, KAN-66, KAN-67, KAN-68 for basic info, settings, state persistence,
 * and real API integration.
 *
 * Features:
 * - Assignment basic info form (title, description)
 * - Assignment settings panel (class, due date, visibility, attempts)
 * - State persistence across navigation and page refresh
 * - Save draft and publish functionality with real API calls
 * - Form validation before submission
 * - Field-level error display from backend validation
 */

import React, { useCallback, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { AssignmentBasicInfoForm, AssignmentSettingsPanel } from '../components/assignments'
import {
  AssignmentCreationProvider,
  useAssignmentCreation,
} from '../context/AssignmentCreationContext'
import { useAssignmentFormValidation } from '../hooks'
import { createDraft, updateDraft, DraftApiError } from '../services/assignmentDraftService'
import { AssignmentFormErrors } from '../types/assignmentCreation'

/**
 * Inner component that uses the AssignmentCreationContext
 */
const CreateAssignmentContent: React.FC = () => {
  const navigate = useNavigate()
  const { formData, isDirty, resetForm, setDraftId } = useAssignmentCreation()
  const { isValidForDraft, isValidForPublish, validateForDraft, validateForPublish } =
    useAssignmentFormValidation(formData)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<AssignmentFormErrors>({})

  // Handle back navigation
  const handleGoBack = useCallback(() => {
    if (isDirty) {
      // Show confirmation if there are unsaved changes
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      )
      if (!confirmed) return
    }
    navigate('/teacher/dashboard')
  }, [navigate, isDirty])

  /**
   * Parse backend field errors and map them to form fields
   */
  const parseFieldErrors = useCallback((error: DraftApiError): AssignmentFormErrors => {
    const errors: AssignmentFormErrors = {}

    if (error.isValidationError() && error.fieldErrors.length > 0) {
      for (const fieldError of error.fieldErrors) {
        // Map backend field names to frontend field names
        switch (fieldError.field) {
          case 'title':
            errors.title = fieldError.message
            break
          case 'description':
            errors.description = fieldError.message
            break
          case 'settings.attempts':
          case 'attempts':
            // No direct mapping, include in general error
            break
          case 'settings.availability.from':
          case 'availability.from':
            errors.dueDate = fieldError.message
            break
          case 'settings.availability.to':
          case 'availability.to':
            errors.dueDate = fieldError.message
            break
          default:
            // For unmapped fields, we'll show in the general error
            break
        }
      }
    }

    return errors
  }, [])

  // Handle save draft
  const handleSaveDraft = useCallback(async () => {
    setSubmitError(null)
    setFieldErrors({})
    const validation = validateForDraft()

    if (!validation.isValid) {
      setSubmitError('Please fix the errors before saving.')
      setFieldErrors(validation.errors)
      return
    }

    setIsSubmitting(true)

    try {
      let response

      // Use updateDraft if we have a draftId, otherwise createDraft
      if (formData.draftId) {
        response = await updateDraft(formData.draftId, formData)
      } else {
        response = await createDraft(formData)
        // Store the returned draftId in context for future updates
        setDraftId(response.draft_id)
      }

      console.log('Draft saved successfully:', response)

      // Clear storage and navigate back on success
      resetForm()
      navigate('/teacher/dashboard', {
        state: { message: 'Assignment draft saved successfully!' },
      })
    } catch (error) {
      console.error('Failed to save draft:', error)

      if (error instanceof DraftApiError) {
        // Parse and display field-level errors
        const parsedErrors = parseFieldErrors(error)
        setFieldErrors(parsedErrors)

        // Show general error message
        if (error.isValidationError()) {
          setSubmitError(error.message || 'Please fix the validation errors.')
        } else {
          setSubmitError(error.message || 'Failed to save draft. Please try again.')
        }
      } else {
        setSubmitError('An unexpected error occurred. Please try again.')
      }
      // NOTE: Do NOT call resetForm() on error - keep the user's data
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForDraft, resetForm, navigate, setDraftId, parseFieldErrors])

  // Handle publish
  const handlePublish = useCallback(async () => {
    setSubmitError(null)
    setFieldErrors({})
    const validation = validateForPublish()

    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).filter(Boolean)
      setSubmitError(errorMessages.join('. ') || 'Please fix the errors before publishing.')
      setFieldErrors(validation.errors)
      return
    }

    setIsSubmitting(true)

    try {
      // First, save the draft with visibility set to 'published'
      const publishData = {
        ...formData,
        settings: {
          ...formData.settings,
          visibility: 'published' as const,
        },
      }

      let response

      // Use updateDraft if we have a draftId, otherwise createDraft
      if (formData.draftId) {
        response = await updateDraft(formData.draftId, publishData)
      } else {
        response = await createDraft(publishData)
      }

      console.log('Assignment published successfully:', response)

      // Clear storage and navigate back on success
      resetForm()
      navigate('/teacher/dashboard', {
        state: { message: 'Assignment published successfully!' },
      })
    } catch (error) {
      console.error('Failed to publish assignment:', error)

      if (error instanceof DraftApiError) {
        // Parse and display field-level errors
        const parsedErrors = parseFieldErrors(error)
        setFieldErrors(parsedErrors)

        // Show general error message
        if (error.isValidationError()) {
          setSubmitError(error.message || 'Please fix the validation errors.')
        } else {
          setSubmitError(error.message || 'Failed to publish assignment. Please try again.')
        }
      } else {
        setSubmitError('An unexpected error occurred. Please try again.')
      }
      // NOTE: Do NOT call resetForm() on error - keep the user's data
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForPublish, resetForm, navigate, parseFieldErrors])

  // Handle discard
  const handleDiscard = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        'Are you sure you want to discard all changes? This cannot be undone.'
      )
      if (!confirmed) return
    }
    resetForm()
    navigate('/teacher/dashboard')
  }, [isDirty, resetForm, navigate])

  // Summary of current settings for the action bar
  const settingsSummary = useMemo(() => {
    const parts: string[] = []
    if (formData.settings.classId) {
      parts.push('Class selected')
    }
    if (formData.settings.dueDate) {
      parts.push(`Due: ${formData.settings.dueDate}`)
    }
    return parts.join(' | ') || 'No settings configured'
  }, [formData.settings])

  return (
    <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Back Button and Page Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-4"
            aria-label="Go back to dashboard"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create Assignment
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Create a new assignment for your students.
              </p>
            </div>

            {/* Status Indicator */}
            {isDirty && (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <span className="material-symbols-outlined text-lg">edit</span>
                <span>Unsaved changes</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div
            className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-200 flex items-center gap-3"
            role="alert"
          >
            <span className="material-symbols-outlined text-red-500">error</span>
            <span>{submitError}</span>
            <button
              onClick={() => setSubmitError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Basic Info Form */}
          <AssignmentBasicInfoForm isSubmitting={isSubmitting} serverErrors={fieldErrors} />

          {/* Settings Panel */}
          <AssignmentSettingsPanel isLoading={isSubmitting} />

          {/* Questions Section Placeholder */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">quiz</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Questions
              </h2>
            </div>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 mb-4">
                <span className="material-symbols-outlined text-3xl">add_circle</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Question creation will be available in a future update.
              </p>
              <Button variant="secondary" disabled>
                <span className="material-symbols-outlined text-lg">add</span>
                Add Questions (Coming Soon)
              </Button>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-0 left-0 right-0 mt-8 -mx-6 lg:-mx-10 px-6 lg:px-10 py-4 bg-surface-light dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 shadow-lg">
          <div className="max-w-4xl mx-auto">
            {/* Settings Summary */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span>
              {settingsSummary}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Left side: Discard */}
              <Button
                variant="outline"
                onClick={handleDiscard}
                disabled={isSubmitting}
                className="w-full sm:w-auto order-3 sm:order-1"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                Discard
              </Button>

              {/* Right side: Save Draft and Publish */}
              <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto order-1 sm:order-2">
                <Button
                  variant="secondary"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting || !isValidForDraft}
                  className="flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-spin">
                        progress_activity
                      </span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">save</span>
                      Save Draft
                    </>
                  )}
                </Button>

                <Button
                  variant="primary"
                  onClick={handlePublish}
                  disabled={isSubmitting || !isValidForPublish}
                  className="flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-spin">
                        progress_activity
                      </span>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">publish</span>
                      Publish
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Validation Hints */}
            {!isValidForPublish && formData.title.trim() && (
              <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>
                  {!formData.settings.classId
                    ? 'Select a class to publish this assignment'
                    : 'Complete all required fields to publish'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

/**
 * CreateAssignment page wrapper with context provider
 */
const CreateAssignment: React.FC = () => {
  return (
    <AssignmentCreationProvider>
      <CreateAssignmentContent />
    </AssignmentCreationProvider>
  )
}

export default CreateAssignment
