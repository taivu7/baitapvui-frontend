/**
 * useAssignmentActions Hook Tests
 *
 * Comprehensive test coverage for KAN-97, KAN-98, KAN-99
 * Tests Save Draft, Publish, and Status management functionality
 *
 * Note: These tests require Vitest and @testing-library/react to be installed:
 * npm install --save-dev vitest @testing-library/react @testing-library/react-hooks @testing-library/jest-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import useAssignmentActions from '../hooks/useAssignmentActions'
import * as assignmentActionsApi from '../services/assignmentActionsApi'
import {
  SaveDraftRequest,
  SaveDraftResponse,
  PublishResponse,
  ApiAssignmentStatus,
} from '../types/assignmentActions'

// Mock the API module
vi.mock('../services/assignmentActionsApi')

describe('useAssignmentActions', () => {
  // Test data
  const mockSaveDraftRequest: SaveDraftRequest = {
    basicInfo: {
      title: 'Test Assignment',
      description: 'Test description',
      dueDate: '2026-12-31T23:59:00Z',
    },
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        content: 'What is 2+2?',
        options: [
          { id: 'opt1', text: '3', isCorrect: false },
          { id: 'opt2', text: '4', isCorrect: true },
        ],
      },
    ],
  }

  const mockSaveDraftResponse: SaveDraftResponse = {
    assignmentId: 'a123',
    status: 'DRAFT' as ApiAssignmentStatus,
    updatedAt: '2026-01-24T10:00:00Z',
  }

  const mockPublishResponse: PublishResponse = {
    assignmentId: 'a123',
    status: 'PUBLISHED' as ApiAssignmentStatus,
    publishedAt: '2026-01-24T10:30:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // =============================================================================
  // KAN-97: Save Draft Flow Tests
  // =============================================================================

  describe('KAN-97: Save Draft Flow', () => {
    it('should save draft with incomplete data (happy path)', async () => {
      // Mock API success
      vi.spyOn(assignmentActionsApi, 'createAssignment').mockResolvedValue(
        mockSaveDraftResponse
      )

      const { result } = renderHook(() => useAssignmentActions())

      expect(result.current.state.assignmentId).toBeNull()
      expect(result.current.state.status).toBe('DRAFT')

      // Save draft
      await act(async () => {
        const response = await result.current.saveDraft(mockSaveDraftRequest)
        expect(response).toEqual(mockSaveDraftResponse)
      })

      // Verify state updated
      expect(result.current.state.assignmentId).toBe('a123')
      expect(result.current.state.status).toBe('DRAFT')
      expect(result.current.state.lastSavedAt).toBe('2026-01-24T10:00:00Z')
      expect(result.current.state.error).toBeNull()
      expect(result.current.state.validationErrors).toEqual([])
    })

    it('should save draft with partially filled questions', async () => {
      const incompleteRequest: SaveDraftRequest = {
        basicInfo: {
          title: 'Incomplete Assignment',
        },
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice',
            content: 'Incomplete question',
            options: [
              // No correct answer set
              { id: 'opt1', text: 'Option 1', isCorrect: false },
              { id: 'opt2', text: '', isCorrect: false }, // Empty option text
            ],
          },
        ],
      }

      vi.spyOn(assignmentActionsApi, 'createAssignment').mockResolvedValue(
        mockSaveDraftResponse
      )

      const { result } = renderHook(() => useAssignmentActions())

      await act(async () => {
        const response = await result.current.saveDraft(incompleteRequest)
        expect(response).toEqual(mockSaveDraftResponse)
      })

      // Should succeed - no validation for drafts
      expect(result.current.state.error).toBeNull()
    })

    it('should handle multiple save draft actions', async () => {
      vi.spyOn(assignmentActionsApi, 'createAssignment').mockResolvedValue(
        mockSaveDraftResponse
      )
      vi.spyOn(assignmentActionsApi, 'saveDraft').mockResolvedValue({
        ...mockSaveDraftResponse,
        updatedAt: '2026-01-24T10:05:00Z',
      })

      const { result } = renderHook(() => useAssignmentActions())

      // First save (create)
      await act(async () => {
        await result.current.saveDraft(mockSaveDraftRequest)
      })

      expect(result.current.state.assignmentId).toBe('a123')
      expect(result.current.state.lastSavedAt).toBe('2026-01-24T10:00:00Z')

      // Second save (update)
      await act(async () => {
        await result.current.saveDraft(mockSaveDraftRequest)
      })

      expect(result.current.state.lastSavedAt).toBe('2026-01-24T10:05:00Z')
      expect(assignmentActionsApi.saveDraft).toHaveBeenCalledWith('a123', mockSaveDraftRequest)
    })

    it('should handle 404 error (invalid assignment ID)', async () => {
      const error = new assignmentActionsApi.AssignmentActionError(
        'Assignment not found.',
        'NOT_FOUND',
        [],
        404
      )

      vi.spyOn(assignmentActionsApi, 'saveDraft').mockRejectedValue(error)

      const { result } = renderHook(() =>
        useAssignmentActions({
          assignmentId: 'invalid-id',
        })
      )

      await act(async () => {
        const response = await result.current.saveDraft(mockSaveDraftRequest)
        expect(response).toBeNull()
      })

      expect(result.current.state.error).toBe('Assignment not found.')
      expect(error.isNotFoundError()).toBe(true)
    })

    it('should handle 403 forbidden error (not owner)', async () => {
      const error = new assignmentActionsApi.AssignmentActionError(
        'You do not have permission to perform this action.',
        'FORBIDDEN',
        [],
        403
      )

      vi.spyOn(assignmentActionsApi, 'saveDraft').mockRejectedValue(error)

      const { result } = renderHook(() =>
        useAssignmentActions({
          assignmentId: 'a123',
        })
      )

      await act(async () => {
        await result.current.saveDraft(mockSaveDraftRequest)
      })

      expect(result.current.state.error).toBe(
        'You do not have permission to perform this action.'
      )
      expect(error.isForbiddenError()).toBe(true)
    })

    it('should handle malformed payload (400 bad request)', async () => {
      const error = new assignmentActionsApi.AssignmentActionError(
        'Invalid request. Please check your input and try again.',
        'BAD_REQUEST',
        [],
        400
      )

      vi.spyOn(assignmentActionsApi, 'saveDraft').mockRejectedValue(error)

      const { result } = renderHook(() =>
        useAssignmentActions({
          assignmentId: 'a123',
        })
      )

      await act(async () => {
        await result.current.saveDraft(mockSaveDraftRequest)
      })

      expect(result.current.state.error).toContain('Invalid request')
    })

    it('should call onSaveDraftSuccess callback on success', async () => {
      const onSuccess = vi.fn()

      vi.spyOn(assignmentActionsApi, 'createAssignment').mockResolvedValue(
        mockSaveDraftResponse
      )

      const { result } = renderHook(() =>
        useAssignmentActions({
          onSaveDraftSuccess: onSuccess,
        })
      )

      await act(async () => {
        await result.current.saveDraft(mockSaveDraftRequest)
      })

      expect(onSuccess).toHaveBeenCalledWith(mockSaveDraftResponse)
    })

    it('should call onError callback on failure', async () => {
      const onError = vi.fn()
      const error = new assignmentActionsApi.AssignmentActionError(
        'Network error',
        'NETWORK_ERROR'
      )

      vi.spyOn(assignmentActionsApi, 'createAssignment').mockRejectedValue(error)

      const { result } = renderHook(() =>
        useAssignmentActions({
          onError,
        })
      )

      await act(async () => {
        await result.current.saveDraft(mockSaveDraftRequest)
      })

      expect(onError).toHaveBeenCalledWith(error)
    })

    it('should clear previous errors before saving', async () => {
      vi.spyOn(assignmentActionsApi, 'createAssignment')
        .mockRejectedValueOnce(
          new assignmentActionsApi.AssignmentActionError('First error', 'ERROR')
        )
        .mockResolvedValueOnce(mockSaveDraftResponse)

      const { result } = renderHook(() => useAssignmentActions())

      // First save fails
      await act(async () => {
        await result.current.saveDraft(mockSaveDraftRequest)
      })
      expect(result.current.state.error).toBe('First error')

      // Second save succeeds and clears error
      await act(async () => {
        await result.current.saveDraft(mockSaveDraftRequest)
      })
      expect(result.current.state.error).toBeNull()
    })
  })

  // =============================================================================
  // KAN-98: Publish Flow Tests
  // =============================================================================

  describe('KAN-98: Publish Flow', () => {
    it('should publish valid assignment (happy path)', async () => {
      vi.spyOn(assignmentActionsApi, 'publishAssignment').mockResolvedValue(
        mockPublishResponse
      )

      const { result } = renderHook(() =>
        useAssignmentActions({
          assignmentId: 'a123',
          initialStatus: 'DRAFT',
        })
      )

      expect(result.current.canPublish).toBe(true)

      await act(async () => {
        const response = await result.current.publish(mockSaveDraftRequest)
        expect(response).toEqual(mockPublishResponse)
      })

      expect(result.current.state.status).toBe('PUBLISHED')
      expect(result.current.state.publishedAt).toBe('2026-01-24T10:30:00Z')
      expect(result.current.canPublish).toBe(false)
      expect(result.current.canEdit).toBe(false)
    })

    it('should handle publish with missing required fields (validation errors)', async () => {
      const validationErrors = [
        { scope: 'assignment' as const, field: 'title', message: 'Title is required' },
        { scope: 'assignment' as const, field: 'classId', message: 'Please select a class' },
      ]

      const error = new assignmentActionsApi.AssignmentActionError(
        'Validation failed. Please fix the errors and try again.',
        'PUBLISH_VALIDATION_ERROR',
        validationErrors,
        422
      )

      vi.spyOn(assignmentActionsApi, 'publishAssignment').mockRejectedValue(error)

      const { result } = renderHook(() =>
        useAssignmentActions({
          assignmentId: 'a123',
        })
      )

      await act(async () => {
        await result.current.publish(mockSaveDraftRequest)
      })

      expect(result.current.state.validationErrors).toEqual(validationErrors)
      expect(error.isValidationError()).toBe(true)

      // Verify helper methods
      const fieldErrors = result.current.getFieldErrors()
      expect(fieldErrors).toEqual({
        title: 'Title is required',
        classId: 'Please select a class',
      })
    })

    it('should handle publish with invalid questions', async () => {
      const validationErrors = [
        {
          scope: 'question' as const,
          questionId: 'q1',
          message: 'Must have at least one correct answer',
        },
        {
          scope: 'question' as const,
          questionId: 'q2',
          message: 'Option text cannot be empty',
        },
      ]

      const error = new assignmentActionsApi.AssignmentActionError(
        'Validation failed',
        'PUBLISH_VALIDATION_ERROR',
        validationErrors,
        422
      )

      vi.spyOn(assignmentActionsApi, 'publishAssignment').mockRejectedValue(error)

      const { result } = renderHook(() =>
        useAssignmentActions({
          assignmentId: 'a123',
        })
      )

      await act(async () => {
        await result.current.publish(mockSaveDraftRequest)
      })

      const questionErrors = result.current.getQuestionErrors()
      expect(questionErrors).toEqual({
        q1: 'Must have at least one correct answer',
        q2: 'Option text cannot be empty',
      })
    })

    it('should handle already published assignment (409 conflict)', async () => {
      const error = new assignmentActionsApi.AssignmentActionError(
        'This assignment has already been published.',
        'CONFLICT',
        [],
        409
      )

      vi.spyOn(assignmentActionsApi, 'publishAssignment').mockRejectedValue(error)

      const { result } = renderHook(() =>
        useAssignmentActions({
          assignmentId: 'a123',
          initialStatus: 'DRAFT',
        })
      )

      await act(async () => {
        await result.current.publish(mockSaveDraftRequest)
      })

      expect(result.current.state.error).toBe('This assignment has already been published.')
      expect(error.isConflictError()).toBe(true)
    })

    it('should prevent publish when status is PUBLISHED', async () => {
      const { result } = renderHook(() =>
        useAssignmentActions({
          assignmentId: 'a123',
          initialStatus: 'PUBLISHED',
        })
      )

      expect(result.current.canPublish).toBe(false)

      await act(async () => {
        const response = await result.current.publish(mockSaveDraftRequest)
        expect(response).toBeNull()
      })

      expect(result.current.state.error).toBe('This assignment has already been published.')
    })

    it('should create assignment first if no ID, then publish', async () => {
      vi.spyOn(assignmentActionsApi, 'createAssignment').mockResolvedValue(
        mockSaveDraftResponse
      )
      vi.spyOn(assignmentActionsApi, 'publishAssignment').mockResolvedValue(
        mockPublishResponse
      )

      const { result } = renderHook(() => useAssignmentActions())

      expect(result.current.state.assignmentId).toBeNull()

      await act(async () => {
        await result.current.publish(mockSaveDraftRequest)
      })

      expect(assignmentActionsApi.createAssignment).toHaveBeenCalledWith(
        mockSaveDraftRequest
      )
      expect(assignmentActionsApi.publishAssignment).toHaveBeenCalledWith(
        'a123',
        mockSaveDraftRequest
      )
      expect(result.current.state.status).toBe('PUBLISHED')
    })

    it('should call onPublishSuccess callback on success', async () => {
      const onSuccess = vi.fn()

      vi.spyOn(assignmentActionsApi, 'publishAssignment').mockResolvedValue(
        mockPublishResponse
      )

      const { result } = renderHook(() =>
        useAssignmentActions({
          assignmentId: 'a123',
          onPublishSuccess: onSuccess,
        })
      )

      await act(async () => {
        await result.current.publish(mockSaveDraftRequest)
      })

      expect(onSuccess).toHaveBeenCalledWith(mockPublishResponse)
    })
  })

  // =============================================================================
  // KAN-99: Assignment Status & Permissions Tests
  // =============================================================================

  describe('KAN-99: Assignment Status & Permissions', () => {
    it('should have correct permissions for DRAFT status', () => {
      const { result } = renderHook(() =>
        useAssignmentActions({
          initialStatus: 'DRAFT',
        })
      )

      expect(result.current.state.status).toBe('DRAFT')
      expect(result.current.canEdit).toBe(true)
      expect(result.current.canPublish).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    it('should have correct permissions for PUBLISHED status', () => {
      const { result } = renderHook(() =>
        useAssignmentActions({
          initialStatus: 'PUBLISHED',
        })
      )

      expect(result.current.state.status).toBe('PUBLISHED')
      expect(result.current.canEdit).toBe(false)
      expect(result.current.canPublish).toBe(false)
    })

    it('should update status correctly after publish', async () => {
      vi.spyOn(assignmentActionsApi, 'publishAssignment').mockResolvedValue(
        mockPublishResponse
      )

      const { result } = renderHook(() =>
        useAssignmentActions({
          assignmentId: 'a123',
          initialStatus: 'DRAFT',
        })
      )

      expect(result.current.state.status).toBe('DRAFT')

      await act(async () => {
        await result.current.publish(mockSaveDraftRequest)
      })

      expect(result.current.state.status).toBe('PUBLISHED')
      expect(result.current.state.publishedAt).toBe('2026-01-24T10:30:00Z')
    })

    it('should allow manual status update via setStatus', () => {
      const { result } = renderHook(() =>
        useAssignmentActions({
          initialStatus: 'DRAFT',
        })
      )

      act(() => {
        result.current.setStatus('PUBLISHED')
      })

      expect(result.current.state.status).toBe('PUBLISHED')
      expect(result.current.canEdit).toBe(false)
      expect(result.current.canPublish).toBe(false)
    })

    it('should allow manual assignment ID update via setAssignmentId', () => {
      const { result } = renderHook(() => useAssignmentActions())

      expect(result.current.state.assignmentId).toBeNull()

      act(() => {
        result.current.setAssignmentId('a456')
      })

      expect(result.current.state.assignmentId).toBe('a456')
    })

    it('should show loading state during save', async () => {
      let resolvePromise: (value: SaveDraftResponse) => void
      const promise = new Promise<SaveDraftResponse>((resolve) => {
        resolvePromise = resolve
      })

      vi.spyOn(assignmentActionsApi, 'createAssignment').mockReturnValue(promise)

      const { result } = renderHook(() => useAssignmentActions())

      // Start save
      act(() => {
        result.current.saveDraft(mockSaveDraftRequest)
      })

      // Should be in loading state
      await waitFor(() => {
        expect(result.current.state.isSaving).toBe(true)
        expect(result.current.isLoading).toBe(true)
      })

      // Resolve promise
      await act(async () => {
        resolvePromise!(mockSaveDraftResponse)
        await promise
      })

      expect(result.current.state.isSaving).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })

    it('should show loading state during publish', async () => {
      let resolvePromise: (value: PublishResponse) => void
      const promise = new Promise<PublishResponse>((resolve) => {
        resolvePromise = resolve
      })

      vi.spyOn(assignmentActionsApi, 'publishAssignment').mockReturnValue(promise)

      const { result } = renderHook(() =>
        useAssignmentActions({
          assignmentId: 'a123',
        })
      )

      // Start publish
      act(() => {
        result.current.publish(mockSaveDraftRequest)
      })

      // Should be in loading state
      await waitFor(() => {
        expect(result.current.state.isPublishing).toBe(true)
        expect(result.current.isLoading).toBe(true)
        expect(result.current.canPublish).toBe(false) // Can't publish while publishing
      })

      // Resolve promise
      await act(async () => {
        resolvePromise!(mockPublishResponse)
        await promise
      })

      expect(result.current.state.isPublishing).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  // =============================================================================
  // Error Management Tests
  // =============================================================================

  describe('Error Management', () => {
    it('should clear all errors', async () => {
      const error = new assignmentActionsApi.AssignmentActionError(
        'Test error',
        'ERROR',
        [{ scope: 'assignment', field: 'title', message: 'Title error' }]
      )

      vi.spyOn(assignmentActionsApi, 'createAssignment').mockRejectedValue(error)

      const { result } = renderHook(() => useAssignmentActions())

      await act(async () => {
        await result.current.saveDraft(mockSaveDraftRequest)
      })

      expect(result.current.state.error).toBe('Test error')
      expect(result.current.state.validationErrors.length).toBe(1)

      act(() => {
        result.current.clearErrors()
      })

      expect(result.current.state.error).toBeNull()
      expect(result.current.state.validationErrors).toEqual([])
    })

    it('should clear specific field error', async () => {
      const validationErrors = [
        { scope: 'assignment' as const, field: 'title', message: 'Title error' },
        { scope: 'assignment' as const, field: 'classId', message: 'Class error' },
      ]

      const error = new assignmentActionsApi.AssignmentActionError(
        'Validation failed',
        'VALIDATION_ERROR',
        validationErrors
      )

      vi.spyOn(assignmentActionsApi, 'publishAssignment').mockRejectedValue(error)

      const { result } = renderHook(() =>
        useAssignmentActions({
          assignmentId: 'a123',
        })
      )

      await act(async () => {
        await result.current.publish(mockSaveDraftRequest)
      })

      expect(result.current.state.validationErrors.length).toBe(2)

      act(() => {
        result.current.clearFieldError('title')
      })

      expect(result.current.state.validationErrors.length).toBe(1)
      expect(result.current.state.validationErrors[0].field).toBe('classId')
    })

    it('should clear specific question error', async () => {
      const validationErrors = [
        { scope: 'question' as const, questionId: 'q1', message: 'Q1 error' },
        { scope: 'question' as const, questionId: 'q2', message: 'Q2 error' },
      ]

      const error = new assignmentActionsApi.AssignmentActionError(
        'Validation failed',
        'VALIDATION_ERROR',
        validationErrors
      )

      vi.spyOn(assignmentActionsApi, 'publishAssignment').mockRejectedValue(error)

      const { result } = renderHook(() =>
        useAssignmentActions({
          assignmentId: 'a123',
        })
      )

      await act(async () => {
        await result.current.publish(mockSaveDraftRequest)
      })

      expect(result.current.state.validationErrors.length).toBe(2)

      act(() => {
        result.current.clearFieldError(undefined, 'q1')
      })

      expect(result.current.state.validationErrors.length).toBe(1)
      expect(result.current.state.validationErrors[0].questionId).toBe('q2')
    })
  })
})
