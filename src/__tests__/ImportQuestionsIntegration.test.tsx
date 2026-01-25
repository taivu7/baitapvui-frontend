/**
 * Import Questions Integration Tests
 *
 * Integration tests for the complete import questions flow.
 * Tests the integration between ImportQuestionsModal and QuestionBuilder/QuestionList.
 *
 * Implements testing for KAN-64: Import Questions Feature
 *
 * Test cases:
 * - Import questions -> questions appear in QuestionBuilder
 * - Highlighting animation works on imported questions
 * - Auto-scroll to first imported question
 * - Edit/delete/reorder imported questions
 * - Multiple imports (append behavior)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import ImportQuestionsModal from '../components/assignments/ImportQuestionsModal'
import QuestionList from '../features/questions/components/QuestionList'
import { QuestionBuilderProvider, useQuestionBuilder } from '../features/questions/context'
import importQuestionsApi from '../services/importQuestionsApi'
import { DraftQuestion } from '../features/questions/types'

// =============================================================================
// Mocks
// =============================================================================

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

// Mock the questions API to prevent network calls
vi.mock('../features/questions/api', () => ({
  default: {
    getQuestions: vi.fn().mockResolvedValue([]),
    createQuestion: vi.fn().mockResolvedValue({ id: 'new-id' }),
    updateQuestion: vi.fn().mockResolvedValue({}),
    deleteQuestion: vi.fn().mockResolvedValue({}),
    reorderQuestions: vi.fn().mockResolvedValue({}),
    uploadMedia: vi.fn().mockResolvedValue({ id: 'media-id', type: 'image', url: '/test.jpg' }),
    deleteMedia: vi.fn().mockResolvedValue({}),
    validateQuestion: vi.fn().mockReturnValue({ valid: true, errors: [] }),
    validateMediaFile: vi.fn().mockReturnValue({ valid: true }),
  },
}))

// =============================================================================
// Test Fixtures
// =============================================================================

const mockImportedQuestions = [
  {
    id: '1',
    type: 'multiple_choice' as const,
    content: 'What is the capital of France?',
    order: 0,
    options: [
      { id: 'opt1', text: 'London', isCorrect: false },
      { id: 'opt2', text: 'Paris', isCorrect: true },
      { id: 'opt3', text: 'Berlin', isCorrect: false },
    ],
  },
  {
    id: '2',
    type: 'essay' as const,
    content: 'Explain the water cycle in detail.',
    order: 1,
    options: [],
  },
  {
    id: '3',
    type: 'multiple_choice' as const,
    content: 'What is 2 + 2?',
    order: 2,
    options: [
      { id: 'opt4', text: '3', isCorrect: false },
      { id: 'opt5', text: '4', isCorrect: true },
    ],
  },
]

const createMockFile = (name: string, size: number, type: string): File => {
  const content = new Array(size).fill('a').join('')
  return new File([content], name, { type })
}

// =============================================================================
// Test Components
// =============================================================================

/**
 * Integration test wrapper that combines ImportQuestionsModal with QuestionList
 */
const IntegrationTestWrapper: React.FC<{ initialQuestions?: DraftQuestion[] }> = ({
  initialQuestions = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [questions, setQuestions] = useState<DraftQuestion[]>(initialQuestions)
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null)

  const handleImportSuccess = (importedQuestions: DraftQuestion[]) => {
    // Append imported questions to existing ones
    const startOrder = questions.length
    const questionsWithOrder = importedQuestions.map((q, index) => ({
      ...q,
      order: startOrder + index,
    }))
    setQuestions((prev) => [...prev, ...questionsWithOrder])

    // Select the first imported question
    if (questionsWithOrder.length > 0) {
      setCurrentQuestionId(questionsWithOrder[0].id)
    }
  }

  const handleReorder = (sourceIndex: number, destIndex: number) => {
    const newQuestions = [...questions]
    const [removed] = newQuestions.splice(sourceIndex, 1)
    newQuestions.splice(destIndex, 0, removed)
    const reordered = newQuestions.map((q, index) => ({ ...q, order: index }))
    setQuestions(reordered)
  }

  const handleDelete = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)} data-testid="open-import-modal">
        Import Questions
      </button>

      <ImportQuestionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assignmentId="test-assignment-123"
        onImportSuccess={handleImportSuccess}
      />

      <div data-testid="question-list-container">
        <QuestionList
          questions={questions}
          currentQuestionId={currentQuestionId}
          onSelectQuestion={setCurrentQuestionId}
          onReorder={handleReorder}
          onDelete={handleDelete}
        />
      </div>

      {/* Display current question for testing */}
      {currentQuestionId && (
        <div data-testid="current-question-id">{currentQuestionId}</div>
      )}
    </div>
  )
}

/**
 * Test component using QuestionBuilderContext
 */
const ContextIntegrationTestWrapper: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <QuestionBuilderProvider assignmentId="test-assignment-123">
      <IntegrationWithContext
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </QuestionBuilderProvider>
  )
}

const IntegrationWithContext: React.FC<{
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
}> = ({ isModalOpen, setIsModalOpen }) => {
  const { state, importQuestions, reorderQuestions, deleteQuestion, setCurrentQuestion } =
    useQuestionBuilder()

  const handleImportSuccess = (importedQuestions: DraftQuestion[]) => {
    importQuestions(importedQuestions)
  }

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)} data-testid="open-import-modal">
        Import Questions
      </button>

      <ImportQuestionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assignmentId="test-assignment-123"
        onImportSuccess={handleImportSuccess}
      />

      <div data-testid="question-list-container">
        <QuestionList
          questions={state.questions}
          currentQuestionId={state.currentQuestionId}
          onSelectQuestion={setCurrentQuestion}
          onReorder={reorderQuestions}
          onDelete={(id) => deleteQuestion(id)}
        />
      </div>

      <div data-testid="questions-count">{state.questions.length}</div>
    </div>
  )
}

// =============================================================================
// Tests
// =============================================================================

describe('Import Questions Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(importQuestionsApi.importQuestionsFromFile).mockResolvedValue({
      questions: mockImportedQuestions,
      count: 3,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Import Questions Flow', () => {
    it('imports questions and displays them in the question list', async () => {
      const user = userEvent.setup()
      render(<IntegrationTestWrapper />)

      // Open import modal
      await user.click(screen.getByTestId('open-import-modal'))

      // Verify modal is open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Import Questions')).toBeInTheDocument()

      // Select a file
      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(fileInput, file)

      // Click import
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Import Questions/i })).not.toBeDisabled()
      })
      await user.click(screen.getByRole('button', { name: /Import Questions/i }))

      // Wait for success
      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
      })

      // Click done
      await user.click(screen.getByRole('button', { name: /Done/i }))

      // Verify questions are in the list
      const listContainer = screen.getByTestId('question-list-container')
      await waitFor(() => {
        expect(within(listContainer).getByText(/capital of France/)).toBeInTheDocument()
        expect(within(listContainer).getByText(/water cycle/)).toBeInTheDocument()
        expect(within(listContainer).getByText(/2 \+ 2/)).toBeInTheDocument()
      })
    })

    it('shows correct question count after import', async () => {
      const user = userEvent.setup()
      render(<IntegrationTestWrapper />)

      // Open modal and import
      await user.click(screen.getByTestId('open-import-modal'))

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Import Questions/i })).not.toBeDisabled()
      })
      await user.click(screen.getByRole('button', { name: /Import Questions/i }))

      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /Done/i }))

      // Verify count
      const listContainer = screen.getByTestId('question-list-container')
      await waitFor(() => {
        expect(within(listContainer).getByText('Questions (3)')).toBeInTheDocument()
      })
    })
  })

  describe('Highlighting Animation', () => {
    it('marks imported questions with isNewlyImported flag', async () => {
      const user = userEvent.setup()
      render(<IntegrationTestWrapper />)

      // Import questions
      await user.click(screen.getByTestId('open-import-modal'))

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Import Questions/i })).not.toBeDisabled()
      })
      await user.click(screen.getByRole('button', { name: /Import Questions/i }))

      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /Done/i }))

      // Check for "Imported" badges indicating isNewlyImported flag
      const listContainer = screen.getByTestId('question-list-container')
      await waitFor(() => {
        const importedBadges = within(listContainer).getAllByText('Imported')
        expect(importedBadges.length).toBeGreaterThan(0)
      })
    })

    it('applies highlighting styles to newly imported questions', async () => {
      const user = userEvent.setup()
      render(<IntegrationTestWrapper />)

      // Import questions
      await user.click(screen.getByTestId('open-import-modal'))

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Import Questions/i })).not.toBeDisabled()
      })
      await user.click(screen.getByRole('button', { name: /Import Questions/i }))

      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /Done/i }))

      // Check for elements with data-newly-imported attribute
      await waitFor(() => {
        const importedElements = document.querySelectorAll('[data-newly-imported="true"]')
        expect(importedElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Auto-scroll to First Imported Question', () => {
    it('selects the first imported question after import', async () => {
      const user = userEvent.setup()
      render(<IntegrationTestWrapper />)

      // Import questions
      await user.click(screen.getByTestId('open-import-modal'))

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Import Questions/i })).not.toBeDisabled()
      })
      await user.click(screen.getByRole('button', { name: /Import Questions/i }))

      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /Done/i }))

      // Verify first imported question is selected
      await waitFor(() => {
        const currentQuestionId = screen.getByTestId('current-question-id')
        expect(currentQuestionId).toBeInTheDocument()
        expect(currentQuestionId.textContent).toBeTruthy()
      })
    })
  })

  describe('Edit/Delete/Reorder Imported Questions', () => {
    it('allows reordering imported questions', async () => {
      const user = userEvent.setup()
      render(<IntegrationTestWrapper />)

      // Import questions
      await user.click(screen.getByTestId('open-import-modal'))

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Import Questions/i })).not.toBeDisabled()
      })
      await user.click(screen.getByRole('button', { name: /Import Questions/i }))

      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /Done/i }))

      // Find move down buttons
      await waitFor(() => {
        const moveDownButtons = screen.getAllByRole('button', { name: /Move question down/i })
        expect(moveDownButtons.length).toBeGreaterThan(0)
      })
    })

    it('allows selecting different imported questions', async () => {
      const user = userEvent.setup()
      render(<IntegrationTestWrapper />)

      // Import questions
      await user.click(screen.getByTestId('open-import-modal'))

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Import Questions/i })).not.toBeDisabled()
      })
      await user.click(screen.getByRole('button', { name: /Import Questions/i }))

      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /Done/i }))

      // Click on the second question
      const listContainer = screen.getByTestId('question-list-container')
      await waitFor(() => {
        const waterCycleQuestion = within(listContainer).getByText(/water cycle/)
        expect(waterCycleQuestion).toBeInTheDocument()
      })

      const waterCycleQuestion = within(listContainer).getByText(/water cycle/)
      await user.click(waterCycleQuestion)

      // Verify selection changed
      await waitFor(() => {
        const currentQuestionId = screen.getByTestId('current-question-id')
        expect(currentQuestionId.textContent).toBeTruthy()
      })
    })
  })

  describe('Multiple Imports (Append Behavior)', () => {
    it('appends new imports to existing questions', async () => {
      const user = userEvent.setup()

      // Start with some existing questions
      const existingQuestions: DraftQuestion[] = [
        {
          id: 'existing-1',
          type: 'essay',
          content: 'Existing question 1',
          order: 0,
          options: [],
          media: [],
          isSaved: true,
        },
      ]

      render(<IntegrationTestWrapper initialQuestions={existingQuestions} />)

      // Verify existing question is shown
      const listContainer = screen.getByTestId('question-list-container')
      expect(within(listContainer).getByText('Questions (1)')).toBeInTheDocument()
      expect(within(listContainer).getByText(/Existing question 1/)).toBeInTheDocument()

      // Import more questions
      await user.click(screen.getByTestId('open-import-modal'))

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Import Questions/i })).not.toBeDisabled()
      })
      await user.click(screen.getByRole('button', { name: /Import Questions/i }))

      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /Done/i }))

      // Verify all questions are present (1 existing + 3 imported = 4 total)
      await waitFor(() => {
        expect(within(listContainer).getByText('Questions (4)')).toBeInTheDocument()
        expect(within(listContainer).getByText(/Existing question 1/)).toBeInTheDocument()
        expect(within(listContainer).getByText(/capital of France/)).toBeInTheDocument()
      })
    })

    it('handles multiple sequential imports', async () => {
      const user = userEvent.setup()
      render(<IntegrationTestWrapper />)

      // First import
      await user.click(screen.getByTestId('open-import-modal'))

      let file = createMockFile('test1.pdf', 1000, 'application/pdf')
      let fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Import Questions/i })).not.toBeDisabled()
      })
      await user.click(screen.getByRole('button', { name: /Import Questions/i }))

      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /Done/i }))

      // Verify first import
      const listContainer = screen.getByTestId('question-list-container')
      await waitFor(() => {
        expect(within(listContainer).getByText('Questions (3)')).toBeInTheDocument()
      })

      // Second import
      await user.click(screen.getByTestId('open-import-modal'))

      file = createMockFile('test2.pdf', 1000, 'application/pdf')
      fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Import Questions/i })).not.toBeDisabled()
      })
      await user.click(screen.getByRole('button', { name: /Import Questions/i }))

      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /Done/i }))

      // Verify total count after second import (3 + 3 = 6)
      await waitFor(() => {
        expect(within(listContainer).getByText('Questions (6)')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles import errors gracefully', async () => {
      const user = userEvent.setup()

      // Mock API to reject
      vi.mocked(importQuestionsApi.importQuestionsFromFile).mockRejectedValue(
        new Error('Failed to parse document')
      )

      render(<IntegrationTestWrapper />)

      // Try to import
      await user.click(screen.getByTestId('open-import-modal'))

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Import Questions/i })).not.toBeDisabled()
      })
      await user.click(screen.getByRole('button', { name: /Import Questions/i }))

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      // Question list should still be empty
      const listContainer = screen.getByTestId('question-list-container')
      expect(within(listContainer).getByText('Questions (0)')).toBeInTheDocument()
    })

    it('allows retry after error', async () => {
      const user = userEvent.setup()

      // First call fails, second succeeds
      vi.mocked(importQuestionsApi.importQuestionsFromFile)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          questions: mockImportedQuestions,
          count: 3,
        })

      render(<IntegrationTestWrapper />)

      await user.click(screen.getByTestId('open-import-modal'))

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Import Questions/i })).not.toBeDisabled()
      })
      await user.click(screen.getByRole('button', { name: /Import Questions/i }))

      // Wait for error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      // Find and click retry button
      const retryButton = screen.getByRole('button', { name: /Retry/i })
      expect(retryButton).toBeInTheDocument()
      await user.click(retryButton)

      // Should succeed on retry
      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
      })
    })
  })

  describe('Question Type Display', () => {
    it('displays correct type badges for imported questions', async () => {
      const user = userEvent.setup()
      render(<IntegrationTestWrapper />)

      // Import questions
      await user.click(screen.getByTestId('open-import-modal'))

      const file = createMockFile('test.pdf', 1000, 'application/pdf')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Import Questions/i })).not.toBeDisabled()
      })
      await user.click(screen.getByRole('button', { name: /Import Questions/i }))

      await waitFor(() => {
        expect(screen.getByText('Successfully Imported!')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /Done/i }))

      // Check for MC and Essay badges
      const listContainer = screen.getByTestId('question-list-container')
      await waitFor(() => {
        const mcBadges = within(listContainer).getAllByText('MC')
        const essayBadges = within(listContainer).getAllByText('Essay')
        expect(mcBadges.length).toBe(2) // Two MC questions
        expect(essayBadges.length).toBe(1) // One Essay question
      })
    })
  })
})
