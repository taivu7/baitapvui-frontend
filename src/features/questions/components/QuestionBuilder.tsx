/**
 * QuestionBuilder Component
 *
 * Implements KAN-75: Build Question Builder Base Layout
 * Implements KAN-103: Inject Imported Questions into Question Builder
 *
 * Main container component for the Question Builder feature.
 * Provides the layout and integrates all question editing functionality.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { QuestionBuilderProps, DraftQuestion } from '../types'
import { useQuestionBuilder } from '../context'
import QuestionList from './QuestionList'
import QuestionEditor from './QuestionEditor'
import Button from '../../../components/ui/Button'
import ImportQuestionsModal from '../../../components/assignments/ImportQuestionsModal'
import { ToastContainer, useToast } from '../../../components/ui/Toast'

const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  assignmentId,
  className = '',
}) => {
  const {
    state,
    currentQuestion,
    addQuestion,
    deleteQuestion,
    setCurrentQuestion,
    reorderQuestions,
    saveAllQuestions,
    importQuestions,
  } = useQuestionBuilder()

  // Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Toast notifications
  const toast = useToast()

  // Ref for scrolling to imported questions
  const questionListRef = useRef<HTMLDivElement>(null)

  const handleAddQuestion = () => {
    addQuestion('multiple_choice')
  }

  const handleDeleteCurrentQuestion = async () => {
    if (currentQuestion) {
      await deleteQuestion(currentQuestion.id)
    }
  }

  const handleSaveAll = async () => {
    try {
      await saveAllQuestions()
      toast.success('Questions Saved', 'All questions have been saved successfully.')
    } catch (error) {
      console.error('Failed to save questions:', error)
      toast.error('Save Failed', 'Failed to save questions. Please try again.')
    }
  }

  // Handle opening import modal
  const handleOpenImportModal = useCallback(() => {
    setIsImportModalOpen(true)
  }, [])

  // Handle closing import modal
  const handleCloseImportModal = useCallback(() => {
    setIsImportModalOpen(false)
  }, [])

  // Handle successful import
  const handleImportSuccess = useCallback(
    (importedDraftQuestions: DraftQuestion[]) => {
      // Import the questions into the builder
      importQuestions(importedDraftQuestions)

      // Close the modal
      setIsImportModalOpen(false)

      // Show success toast
      toast.success(
        'Questions Imported',
        `Successfully imported ${importedDraftQuestions.length} question${importedDraftQuestions.length !== 1 ? 's' : ''}.`
      )

      // Scroll to the first imported question after a short delay
      setTimeout(() => {
        if (questionListRef.current) {
          const firstImportedElement = questionListRef.current.querySelector('[data-newly-imported="true"]')
          if (firstImportedElement) {
            firstImportedElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      }, 100)
    },
    [importQuestions, toast]
  )

  // Effect to scroll to current question when it changes
  useEffect(() => {
    if (state.currentQuestionId && questionListRef.current) {
      const currentElement = questionListRef.current.querySelector(
        `[data-question-id="${state.currentQuestionId}"]`
      )
      if (currentElement) {
        currentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [state.currentQuestionId])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-[#2a3c30]">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Question Builder</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage questions for your assignment
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Import from File button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenImportModal}
            icon="upload_file"
            aria-label="Import questions from file"
          >
            <span className="hidden sm:inline">Import from File</span>
            <span className="sm:hidden">Import</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleAddQuestion}
            icon="add"
          >
            Add Question
          </Button>

          {state.isDirty && (
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveAll}
              icon="save"
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Saving...' : 'Save All'}
            </Button>
          )}
        </div>
      </div>

      {/* Error display */}
      {state.error && (
        <div className="mb-4 flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <span className="material-symbols-outlined text-red-500 text-xl">error</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900 dark:text-red-300">Error</p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{state.error}</p>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left sidebar - Question list */}
        <div ref={questionListRef} className="w-80 flex-shrink-0 overflow-y-auto">
          <QuestionList
            questions={state.questions}
            currentQuestionId={state.currentQuestionId}
            onSelectQuestion={setCurrentQuestion}
            onReorder={reorderQuestions}
            onDelete={deleteQuestion}
          />
        </div>

        {/* Main editor area */}
        <div className="flex-1 overflow-y-auto">
          {currentQuestion ? (
            <div className="max-w-4xl">
              <QuestionEditor
                question={currentQuestion}
                onUpdate={() => {}}
                onDelete={handleDeleteCurrentQuestion}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center py-12 px-6">
                <span className="material-symbols-outlined text-gray-300 dark:text-gray-700 text-6xl mb-4">
                  quiz
                </span>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Question Selected
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {state.questions.length === 0
                    ? 'Add your first question or import from a file'
                    : 'Select a question from the list to edit'}
                </p>
                {state.questions.length === 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleAddQuestion}
                      icon="add"
                    >
                      Add First Question
                    </Button>
                    <span className="text-gray-400 dark:text-gray-500 text-sm">or</span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOpenImportModal}
                      icon="upload_file"
                    >
                      Import from File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#2a3c30]">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-gray-600 dark:text-gray-400">
              Total Questions: <strong className="text-gray-900 dark:text-white">{state.questions.length}</strong>
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Multiple Choice:{' '}
              <strong className="text-gray-900 dark:text-white">
                {state.questions.filter((q) => q.type === 'multiple_choice').length}
              </strong>
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Essay:{' '}
              <strong className="text-gray-900 dark:text-white">
                {state.questions.filter((q) => q.type === 'essay').length}
              </strong>
            </span>
          </div>

          {state.isDirty && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                schedule
              </span>
              <span>Unsaved changes</span>
            </div>
          )}
        </div>
      </div>

      {/* Import Questions Modal */}
      <ImportQuestionsModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        assignmentId={assignmentId}
        onImportSuccess={handleImportSuccess}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.removeToast} />
    </div>
  )
}

export default QuestionBuilder
