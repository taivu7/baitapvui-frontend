/**
 * useAssignmentActions Hook
 *
 * Custom hook for managing assignment save draft and publish actions.
 * Implements KAN-89, KAN-90, KAN-91, and KAN-92
 *
 * Features:
 * - Manages loading states for save and publish actions
 * - Handles error states and validation errors
 * - Controls assignment status (DRAFT/PUBLISHED)
 * - Provides methods for clearing errors
 * - Maps validation errors to fields and questions
 */

import { useState, useCallback, useMemo } from 'react'
import {
  AssignmentState,
  SaveDraftRequest,
  SaveDraftResponse,
  PublishRequest,
  PublishResponse,
  ApiAssignmentStatus,
  DEFAULT_ASSIGNMENT_STATE,
  UseAssignmentActionsReturn,
} from '../types/assignmentActions'
import {
  saveDraft as saveDraftApi,
  publishAssignment as publishAssignmentApi,
  createAssignment as createAssignmentApi,
  AssignmentActionError,
} from '../services/assignmentActionsApi'

/**
 * Hook options
 */
interface UseAssignmentActionsOptions {
  /** Initial assignment ID (null for new assignments) */
  assignmentId?: string | null
  /** Initial status */
  initialStatus?: ApiAssignmentStatus
  /** Callback when save draft succeeds */
  onSaveDraftSuccess?: (response: SaveDraftResponse) => void
  /** Callback when publish succeeds */
  onPublishSuccess?: (response: PublishResponse) => void
  /** Callback when an error occurs */
  onError?: (error: AssignmentActionError) => void
}

/**
 * Custom hook for managing assignment actions (save draft, publish)
 *
 * @param options - Hook configuration options
 * @returns Object with state and action functions
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   isLoading,
 *   canEdit,
 *   saveDraft,
 *   publish,
 *   clearErrors,
 *   getFieldErrors,
 *   getQuestionErrors,
 * } = useAssignmentActions({
 *   assignmentId: 'a123',
 *   onSaveDraftSuccess: (response) => {
 *     toast.success('Draft saved!')
 *   },
 *   onPublishSuccess: (response) => {
 *     toast.success('Assignment published!')
 *     navigate('/teacher/dashboard')
 *   },
 * })
 * ```
 */
const useAssignmentActions = (
  options: UseAssignmentActionsOptions = {}
): UseAssignmentActionsReturn => {
  const {
    assignmentId: initialAssignmentId = null,
    initialStatus = 'DRAFT',
    onSaveDraftSuccess,
    onPublishSuccess,
    onError,
  } = options

  // State management
  const [state, setState] = useState<AssignmentState>({
    ...DEFAULT_ASSIGNMENT_STATE,
    assignmentId: initialAssignmentId,
    status: initialStatus,
  })

  // =============================================================================
  // Derived State
  // =============================================================================

  /**
   * Whether any action is in progress
   */
  const isLoading = useMemo(() => {
    return state.isSaving || state.isPublishing
  }, [state.isSaving, state.isPublishing])

  /**
   * Whether the assignment can be edited
   * DRAFT: Full editing allowed
   * PUBLISHED: Read-only (no editing)
   */
  const canEdit = useMemo(() => {
    return state.status === 'DRAFT'
  }, [state.status])

  /**
   * Whether the assignment can be published
   * Only DRAFT assignments can be published
   */
  const canPublish = useMemo(() => {
    return state.status === 'DRAFT' && !state.isPublishing
  }, [state.status, state.isPublishing])

  // =============================================================================
  // Error Handling
  // =============================================================================

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      validationErrors: [],
    }))
  }, [])

  /**
   * Clear validation error for a specific field or question
   */
  const clearFieldError = useCallback((field?: string, questionId?: string) => {
    setState((prev) => ({
      ...prev,
      validationErrors: prev.validationErrors.filter((error) => {
        if (field && error.scope === 'assignment' && error.field === field) {
          return false
        }
        if (questionId && error.scope === 'question' && error.questionId === questionId) {
          return false
        }
        return true
      }),
    }))
  }, [])

  /**
   * Get validation errors for assignment-level fields
   */
  const getFieldErrors = useCallback((): Record<string, string> => {
    const fieldErrors: Record<string, string> = {}
    for (const error of state.validationErrors) {
      if (error.scope === 'assignment' && error.field) {
        fieldErrors[error.field] = error.message
      }
    }
    return fieldErrors
  }, [state.validationErrors])

  /**
   * Get validation errors for questions
   */
  const getQuestionErrors = useCallback((): Record<string, string> => {
    const questionErrors: Record<string, string> = {}
    for (const error of state.validationErrors) {
      if (error.scope === 'question' && error.questionId) {
        questionErrors[error.questionId] = error.message
      }
    }
    return questionErrors
  }, [state.validationErrors])

  // =============================================================================
  // Actions
  // =============================================================================

  /**
   * Save assignment as draft
   */
  const saveDraft = useCallback(
    async (data: SaveDraftRequest): Promise<SaveDraftResponse | null> => {
      // Clear previous errors
      clearErrors()

      setState((prev) => ({
        ...prev,
        isSaving: true,
      }))

      try {
        let response: SaveDraftResponse

        // If we have an assignment ID, update the existing draft
        // Otherwise, create a new assignment
        if (state.assignmentId) {
          response = await saveDraftApi(state.assignmentId, data)
        } else {
          response = await createAssignmentApi(data)
        }

        setState((prev) => ({
          ...prev,
          isSaving: false,
          assignmentId: response.assignmentId,
          status: response.status,
          lastSavedAt: response.updatedAt,
          error: null,
          validationErrors: [],
        }))

        // Call success callback
        onSaveDraftSuccess?.(response)

        return response
      } catch (error) {
        const actionError =
          error instanceof AssignmentActionError
            ? error
            : new AssignmentActionError(
                error instanceof Error ? error.message : 'Failed to save draft'
              )

        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: actionError.message,
          validationErrors: actionError.validationErrors,
        }))

        // Call error callback
        onError?.(actionError)

        return null
      }
    },
    [state.assignmentId, clearErrors, onSaveDraftSuccess, onError]
  )

  /**
   * Publish assignment
   */
  const publish = useCallback(
    async (data: PublishRequest): Promise<PublishResponse | null> => {
      // Check if assignment can be published
      if (!canPublish) {
        const error = new AssignmentActionError(
          state.status === 'PUBLISHED'
            ? 'This assignment has already been published.'
            : 'Cannot publish at this time.',
          'INVALID_STATE'
        )
        setState((prev) => ({
          ...prev,
          error: error.message,
        }))
        onError?.(error)
        return null
      }

      // Clear previous errors
      clearErrors()

      setState((prev) => ({
        ...prev,
        isPublishing: true,
      }))

      try {
        // If no assignment ID, we need to create first then publish
        let assignmentId = state.assignmentId
        if (!assignmentId) {
          const createResponse = await createAssignmentApi(data)
          assignmentId = createResponse.assignmentId
        }

        const response = await publishAssignmentApi(assignmentId, data)

        setState((prev) => ({
          ...prev,
          isPublishing: false,
          assignmentId: response.assignmentId,
          status: response.status,
          publishedAt: response.publishedAt,
          error: null,
          validationErrors: [],
        }))

        // Call success callback
        onPublishSuccess?.(response)

        return response
      } catch (error) {
        const actionError =
          error instanceof AssignmentActionError
            ? error
            : new AssignmentActionError(
                error instanceof Error ? error.message : 'Failed to publish assignment'
              )

        setState((prev) => ({
          ...prev,
          isPublishing: false,
          error: actionError.message,
          validationErrors: actionError.validationErrors,
        }))

        // Call error callback
        onError?.(actionError)

        return null
      }
    },
    [state.assignmentId, canPublish, state.status, clearErrors, onPublishSuccess, onError]
  )

  /**
   * Update assignment status from external source
   */
  const setStatus = useCallback((status: ApiAssignmentStatus) => {
    setState((prev) => ({
      ...prev,
      status,
    }))
  }, [])

  /**
   * Set assignment ID
   */
  const setAssignmentId = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      assignmentId: id,
    }))
  }, [])

  // =============================================================================
  // Return Value
  // =============================================================================

  return {
    state,
    isLoading,
    canEdit,
    canPublish,
    saveDraft,
    publish,
    clearErrors,
    clearFieldError,
    getFieldErrors,
    getQuestionErrors,
    setStatus,
    setAssignmentId,
  }
}

export default useAssignmentActions
