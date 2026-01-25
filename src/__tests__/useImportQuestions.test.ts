/**
 * useImportQuestions Hook Tests
 *
 * Unit tests for the useImportQuestions custom hook.
 * Tests file selection, validation, upload, and error handling.
 *
 * Implements testing for KAN-101: File Upload & Progress Handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import useImportQuestions from '../hooks/useImportQuestions'
import importQuestionsApi, { ImportApiError } from '../services/importQuestionsApi'

// Mock the import questions API
vi.mock('../services/importQuestionsApi', () => ({
  default: {
    importQuestionsFromFile: vi.fn(),
    createCancelToken: vi.fn(() => ({
      token: {},
      cancel: vi.fn(),
    })),
  },
  ImportApiError: class ImportApiError extends Error {
    type: string
    details?: string
    statusCode?: number

    constructor(type: string, message: string, details?: string, statusCode?: number) {
      super(message)
      this.type = type
      this.details = details
      this.statusCode = statusCode
    }

    toImportError() {
      return {
        type: this.type,
        message: this.message,
        details: this.details,
      }
    }
  },
}))

describe('useImportQuestions', () => {
  const mockAssignmentId = 'test-assignment-123'
  const mockOnSuccess = vi.fn()
  const mockOnError = vi.fn()

  const createMockFile = (
    name: string,
    size: number,
    type: string
  ): File => {
    const content = new Array(size).fill('a').join('')
    return new File([content], name, { type })
  }

  const mockImportedQuestions = [
    {
      id: '1',
      type: 'multiple_choice' as const,
      content: 'What is 2 + 2?',
      order: 0,
      options: [
        { id: 'opt1', text: '3', isCorrect: false },
        { id: 'opt2', text: '4', isCorrect: true },
      ],
    },
    {
      id: '2',
      type: 'essay' as const,
      content: 'Describe the water cycle.',
      order: 1,
      options: [],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(importQuestionsApi.importQuestionsFromFile).mockResolvedValue({
      questions: mockImportedQuestions,
      count: 2,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('starts with idle status and no file', () => {
      const { result } = renderHook(() =>
        useImportQuestions({
          assignmentId: mockAssignmentId,
        })
      )

      expect(result.current.state.status).toBe('idle')
      expect(result.current.state.file).toBeNull()
      expect(result.current.state.uploadProgress).toBe(0)
      expect(result.current.state.error).toBeNull()
      expect(result.current.isIdle).toBe(true)
      expect(result.current.canUpload).toBe(false)
    })
  })

  describe('File Selection', () => {
    it('accepts valid DOCX file', () => {
      const { result } = renderHook(() =>
        useImportQuestions({
          assignmentId: mockAssignmentId,
        })
      )

      const file = createMockFile(
        'test.docx',
        1000,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )

      act(() => {
        const validation = result.current.selectFile(file)
        expect(validation.valid).toBe(true)
      })

      expect(result.current.state.file).toBe(file)
      expect(result.current.state.error).toBeNull()
      expect(result.current.canUpload).toBe(true)
    })

    it('accepts valid PDF file', () => {
      const { result } = renderHook(() =>
        useImportQuestions({
          assignmentId: mockAssignmentId,
        })
      )

      const file = createMockFile('test.pdf', 1000, 'application/pdf')

      act(() => {
        const validation = result.current.selectFile(file)
        expect(validation.valid).toBe(true)
      })

      expect(result.current.state.file).toBe(file)
      expect(result.current.canUpload).toBe(true)
    })

    it('rejects invalid file type', () => {
      const { result } = renderHook(() =>
        useImportQuestions({
          assignmentId: mockAssignmentId,
        })
      )

      const file = createMockFile('test.txt', 1000, 'text/plain')

      act(() => {
        const validation = result.current.selectFile(file)
        expect(validation.valid).toBe(false)
        expect(validation.errorCode).toBe('INVALID_TYPE')
      })

      expect(result.current.state.file).toBeNull()
      expect(result.current.state.status).toBe('error')
      expect(result.current.state.error).toContain('Invalid file type')
      expect(result.current.canUpload).toBe(false)
    })

    it('rejects file exceeding size limit', () => {
      const { result } = renderHook(() =>
        useImportQuestions({
          assignmentId: mockAssignmentId,
        })
      )

      // Create a file larger than 10MB
      const file = createMockFile('test.pdf', 11 * 1024 * 1024, 'application/pdf')

      act(() => {
        const validation = result.current.selectFile(file)
        expect(validation.valid).toBe(false)
        expect(validation.errorCode).toBe('FILE_TOO_LARGE')
      })

      expect(result.current.state.file).toBeNull()
      expect(result.current.state.error).toContain('too large')
    })
  })

  describe('File Upload', () => {
    it('uploads file and returns imported questions on success', async () => {
      const { result } = renderHook(() =>
        useImportQuestions({
          assignmentId: mockAssignmentId,
          onSuccess: mockOnSuccess,
        })
      )

      const file = createMockFile(
        'test.docx',
        1000,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )

      act(() => {
        result.current.selectFile(file)
      })

      let questions: typeof mockImportedQuestions = []

      await act(async () => {
        questions = await result.current.uploadFile()
      })

      expect(questions).toEqual(mockImportedQuestions)
      expect(result.current.state.status).toBe('success')
      expect(result.current.state.importedCount).toBe(2)
      expect(result.current.isSuccess).toBe(true)
      expect(mockOnSuccess).toHaveBeenCalledWith(mockImportedQuestions, 2)
    })

    it('handles upload error gracefully', async () => {
      const apiError = new (ImportApiError as unknown as new (type: string, message: string) => { type: string; message: string; toImportError: () => { type: string; message: string } })(
        'PARSING_ERROR',
        'Failed to parse document'
      )
      vi.mocked(importQuestionsApi.importQuestionsFromFile).mockRejectedValue(apiError)

      const { result } = renderHook(() =>
        useImportQuestions({
          assignmentId: mockAssignmentId,
          onError: mockOnError,
        })
      )

      const file = createMockFile('test.pdf', 1000, 'application/pdf')

      act(() => {
        result.current.selectFile(file)
      })

      await act(async () => {
        try {
          await result.current.uploadFile()
        } catch {
          // Expected to throw
        }
      })

      expect(result.current.state.status).toBe('error')
      expect(result.current.state.error).toBe('Failed to parse document')
      expect(result.current.isError).toBe(true)
      expect(mockOnError).toHaveBeenCalled()
    })

    it('throws error when no file is selected', async () => {
      const { result } = renderHook(() =>
        useImportQuestions({
          assignmentId: mockAssignmentId,
          onError: mockOnError,
        })
      )

      await expect(async () => {
        await act(async () => {
          await result.current.uploadFile()
        })
      }).rejects.toThrow('No file selected')
    })

    it('tracks upload progress', async () => {
      let progressCallback: ((progress: number) => void) | undefined

      vi.mocked(importQuestionsApi.importQuestionsFromFile).mockImplementation(
        async (_assignmentId, _file, onProgress) => {
          progressCallback = onProgress
          // Simulate progress updates
          onProgress?.(25)
          onProgress?.(50)
          onProgress?.(75)
          onProgress?.(100)
          return { questions: mockImportedQuestions, count: 2 }
        }
      )

      const { result } = renderHook(() =>
        useImportQuestions({
          assignmentId: mockAssignmentId,
        })
      )

      const file = createMockFile('test.pdf', 1000, 'application/pdf')

      act(() => {
        result.current.selectFile(file)
      })

      await act(async () => {
        await result.current.uploadFile()
      })

      expect(progressCallback).toBeDefined()
      expect(result.current.state.status).toBe('success')
    })
  })

  describe('Cancel Upload', () => {
    it('cancels an ongoing upload', async () => {
      const mockCancel = vi.fn()
      vi.mocked(importQuestionsApi.createCancelToken).mockReturnValue({
        token: {} as never,
        cancel: mockCancel,
      })

      // Make the upload take some time
      vi.mocked(importQuestionsApi.importQuestionsFromFile).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ questions: mockImportedQuestions, count: 2 })
            }, 1000)
          })
      )

      const { result } = renderHook(() =>
        useImportQuestions({
          assignmentId: mockAssignmentId,
        })
      )

      const file = createMockFile('test.pdf', 1000, 'application/pdf')

      act(() => {
        result.current.selectFile(file)
      })

      // Start upload but don't await
      act(() => {
        result.current.uploadFile()
      })

      // Cancel the upload
      act(() => {
        result.current.cancelUpload()
      })

      expect(mockCancel).toHaveBeenCalledWith('Upload was cancelled by user')
      expect(result.current.state.status).toBe('idle')
      expect(result.current.state.uploadProgress).toBe(0)
    })
  })

  describe('Reset', () => {
    it('resets state to initial values', async () => {
      const { result } = renderHook(() =>
        useImportQuestions({
          assignmentId: mockAssignmentId,
        })
      )

      const file = createMockFile('test.pdf', 1000, 'application/pdf')

      // Select a file
      act(() => {
        result.current.selectFile(file)
      })

      expect(result.current.state.file).toBe(file)

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.state.status).toBe('idle')
      expect(result.current.state.file).toBeNull()
      expect(result.current.state.uploadProgress).toBe(0)
      expect(result.current.state.error).toBeNull()
      expect(result.current.state.importedCount).toBe(0)
      expect(result.current.state.importedQuestions).toEqual([])
    })
  })

  describe('Computed Values', () => {
    it('correctly computes status booleans', () => {
      const { result } = renderHook(() =>
        useImportQuestions({
          assignmentId: mockAssignmentId,
        })
      )

      // Initial state - idle
      expect(result.current.isIdle).toBe(true)
      expect(result.current.isUploading).toBe(false)
      expect(result.current.isProcessing).toBe(false)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('canUpload is true only when file is selected and status is idle', () => {
      const { result } = renderHook(() =>
        useImportQuestions({
          assignmentId: mockAssignmentId,
        })
      )

      // No file - canUpload should be false
      expect(result.current.canUpload).toBe(false)

      // Select valid file
      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      act(() => {
        result.current.selectFile(file)
      })

      // File selected and idle - canUpload should be true
      expect(result.current.canUpload).toBe(true)
    })
  })
})
