/**
 * ImportQuestionsModal Component Tests
 *
 * Unit tests for the ImportQuestionsModal component.
 * Tests file upload UI, validation, progress states, and accessibility.
 *
 * Implements testing for:
 * - KAN-100: Build Import Questions UI
 * - KAN-102: Handle Import Success & Error States
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImportQuestionsModal from '../components/assignments/ImportQuestionsModal'
import importQuestionsApi from '../services/importQuestionsApi'

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
    constructor(type: string, message: string) {
      super(message)
      this.type = type
    }
    toImportError() {
      return { type: this.type, message: this.message }
    }
  },
}))

describe('ImportQuestionsModal', () => {
  const mockAssignmentId = 'test-assignment-123'
  const mockOnClose = vi.fn()
  const mockOnImportSuccess = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    assignmentId: mockAssignmentId,
    onImportSuccess: mockOnImportSuccess,
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
  ]

  const createMockFile = (
    name: string,
    size: number,
    type: string
  ): File => {
    const content = new Array(size).fill('a').join('')
    return new File([content], name, { type })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(importQuestionsApi.importQuestionsFromFile).mockResolvedValue({
      questions: mockImportedQuestions,
      count: 1,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders nothing when isOpen is false', () => {
      render(<ImportQuestionsModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders modal when isOpen is true', () => {
      render(<ImportQuestionsModal {...defaultProps} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Import Questions')).toBeInTheDocument()
    })

    it('displays file format hints', () => {
      render(<ImportQuestionsModal {...defaultProps} />)
      expect(screen.getByText('DOCX, PDF')).toBeInTheDocument()
      expect(screen.getByText(/Max 10/)).toBeInTheDocument()
    })

    it('displays drag and drop instructions', () => {
      render(<ImportQuestionsModal {...defaultProps} />)
      expect(screen.getByText(/Drag and drop your file here/)).toBeInTheDocument()
      expect(screen.getByText(/click to browse/)).toBeInTheDocument()
    })
  })

  describe('File Selection', () => {
    it('accepts file via file input', async () => {
      const user = userEvent.setup()
      render(<ImportQuestionsModal {...defaultProps} />)

      const file = createMockFile(
        'test.pdf',
        1000,
        'application/pdf'
      )

      // Find the hidden file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      expect(fileInput).toBeInTheDocument()

      // Simulate file selection
      await user.upload(fileInput, file)

      // File should be shown
      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument()
      })
    })

    it('shows error for invalid file type', async () => {
      const user = userEvent.setup()
      render(<ImportQuestionsModal {...defaultProps} />)

      const file = createMockFile('test.txt', 1000, 'text/plain')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/Invalid file type/)).toBeInTheDocument()
      })
    })

    it('shows error for file too large', async () => {
      const user = userEvent.setup()
      render(<ImportQuestionsModal {...defaultProps} />)

      // File larger than 10MB
      const file = createMockFile('test.pdf', 11 * 1024 * 1024, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/too large/)).toBeInTheDocument()
      })
    })
  })

  describe('Import Button', () => {
    it('Import button is disabled when no file is selected', () => {
      render(<ImportQuestionsModal {...defaultProps} />)

      const importButton = screen.getByRole('button', { name: /Import Questions/i })
      expect(importButton).toBeDisabled()
    })

    it('Import button is enabled when valid file is selected', async () => {
      const user = userEvent.setup()
      render(<ImportQuestionsModal {...defaultProps} />)

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        const importButton = screen.getByRole('button', { name: /Import Questions/i })
        expect(importButton).not.toBeDisabled()
      })
    })
  })

  describe('Upload Flow', () => {
    it('shows progress during upload', async () => {
      const user = userEvent.setup()

      // Make the upload take some time and update progress
      vi.mocked(importQuestionsApi.importQuestionsFromFile).mockImplementation(
        async (_assignmentId, _file, onProgress) => {
          onProgress?.(50)
          await new Promise((resolve) => setTimeout(resolve, 100))
          onProgress?.(100)
          return { questions: mockImportedQuestions, count: 1 }
        }
      )

      render(<ImportQuestionsModal {...defaultProps} />)

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        const importButton = screen.getByRole('button', { name: /Import Questions/i })
        expect(importButton).not.toBeDisabled()
      })

      // Click import button
      const importButton = screen.getByRole('button', { name: /Import Questions/i })
      await user.click(importButton)

      // Should show progress
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
      })
    })

    it('shows success state after successful import', async () => {
      const user = userEvent.setup()
      render(<ImportQuestionsModal {...defaultProps} />)

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        const importButton = screen.getByRole('button', { name: /Import Questions/i })
        expect(importButton).not.toBeDisabled()
      })

      const importButton = screen.getByRole('button', { name: /Import Questions/i })
      await user.click(importButton)

      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
        expect(screen.getByText(/1 question/)).toBeInTheDocument()
      })
    })

    it('calls onImportSuccess with transformed questions', async () => {
      const user = userEvent.setup()
      render(<ImportQuestionsModal {...defaultProps} />)

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        const importButton = screen.getByRole('button', { name: /Import Questions/i })
        expect(importButton).not.toBeDisabled()
      })

      const importButton = screen.getByRole('button', { name: /Import Questions/i })
      await user.click(importButton)

      await waitFor(() => {
        expect(mockOnImportSuccess).toHaveBeenCalled()
      })

      // Verify the structure of passed questions
      const passedQuestions = mockOnImportSuccess.mock.calls[0][0]
      expect(passedQuestions).toHaveLength(1)
      expect(passedQuestions[0]).toHaveProperty('id')
      expect(passedQuestions[0]).toHaveProperty('type', 'multiple_choice')
      expect(passedQuestions[0]).toHaveProperty('content', 'What is 2 + 2?')
    })
  })

  describe('Close Modal', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<ImportQuestionsModal {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('calls onClose when X button is clicked', async () => {
      const user = userEvent.setup()
      render(<ImportQuestionsModal {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: /Close modal/i })
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('calls onClose when clicking outside the modal', async () => {
      const user = userEvent.setup()
      render(<ImportQuestionsModal {...defaultProps} />)

      // Click on the backdrop
      const backdrop = document.querySelector('[aria-hidden="true"]')
      if (backdrop) {
        await user.click(backdrop)
        expect(mockOnClose).toHaveBeenCalled()
      }
    })

    it('calls onClose when Escape key is pressed', async () => {
      const user = userEvent.setup()
      render(<ImportQuestionsModal {...defaultProps} />)

      await user.keyboard('{Escape}')

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('calls onClose when Done button is clicked after success', async () => {
      const user = userEvent.setup()
      render(<ImportQuestionsModal {...defaultProps} />)

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        const importButton = screen.getByRole('button', { name: /Import Questions/i })
        expect(importButton).not.toBeDisabled()
      })

      const importButton = screen.getByRole('button', { name: /Import Questions/i })
      await user.click(importButton)

      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
      })

      const doneButton = screen.getByRole('button', { name: /Done/i })
      await user.click(doneButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ImportQuestionsModal {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'import-modal-title')
    })

    it('has accessible dropzone button', () => {
      render(<ImportQuestionsModal {...defaultProps} />)

      const dropzone = screen.getByRole('button', {
        name: /Upload document file/i,
      })
      expect(dropzone).toBeInTheDocument()
      expect(dropzone).toHaveAttribute('tabIndex', '0')
    })

    it('progress bar has proper ARIA attributes', async () => {
      const user = userEvent.setup()

      vi.mocked(importQuestionsApi.importQuestionsFromFile).mockImplementation(
        async (_assignmentId, _file, onProgress) => {
          onProgress?.(50)
          await new Promise((resolve) => setTimeout(resolve, 500))
          return { questions: mockImportedQuestions, count: 1 }
        }
      )

      render(<ImportQuestionsModal {...defaultProps} />)

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        const importButton = screen.getByRole('button', { name: /Import Questions/i })
        expect(importButton).not.toBeDisabled()
      })

      const importButton = screen.getByRole('button', { name: /Import Questions/i })
      await user.click(importButton)

      await waitFor(() => {
        const progressbar = screen.getByRole('progressbar')
        expect(progressbar).toHaveAttribute('aria-valuemin', '0')
        expect(progressbar).toHaveAttribute('aria-valuemax', '100')
        expect(progressbar).toHaveAttribute('aria-label', expect.stringContaining('progress'))
      })
    })

    it('error messages are announced to screen readers', async () => {
      const user = userEvent.setup()
      render(<ImportQuestionsModal {...defaultProps} />)

      const file = createMockFile('test.txt', 1000, 'text/plain')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(fileInput, file)

      await waitFor(() => {
        const alert = screen.getByRole('alert')
        expect(alert).toBeInTheDocument()
      })
    })
  })

  describe('Drag and Drop', () => {
    it('shows visual feedback during drag', () => {
      render(<ImportQuestionsModal {...defaultProps} />)

      const dropzone = screen.getByRole('button', {
        name: /Upload document file/i,
      })

      // Simulate drag over
      fireEvent.dragOver(dropzone)

      expect(screen.getByText(/Drop file here/)).toBeInTheDocument()
    })

    it('accepts file via drag and drop', async () => {
      render(<ImportQuestionsModal {...defaultProps} />)

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const dropzone = screen.getByRole('button', {
        name: /Upload document file/i,
      })

      // Simulate drag and drop
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
        },
      })

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument()
      })
    })
  })
})
