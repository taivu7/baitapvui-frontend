/**
 * CreateAssignment Page
 *
 * Assignment creation page for teachers.
 * Implements the design from assignment-creation.png with two-column layout.
 *
 * Features:
 * - Two-column responsive layout
 * - Assignment title and instructions form
 * - Inline question editor with media attachments
 * - Import file upload section
 * - Settings sidebar (class, due date, due time)
 * - Save draft and publish functionality
 */

import React, { useCallback, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ImportFileCard,
  SettingsSidebar,
  QuestionCard,
  Question,
} from '../components/assignments'
import {
  AssignmentCreationProvider,
  useAssignmentCreation,
} from '../context/AssignmentCreationContext'
import { useAssignmentFormValidation } from '../hooks'
import { createDraft, updateDraft, DraftApiError } from '../services/assignmentDraftService'
import { AssignmentFormErrors } from '../types/assignmentCreation'

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9)

/**
 * Inner component that uses the AssignmentCreationContext
 */
const CreateAssignmentContent: React.FC = () => {
  const navigate = useNavigate()
  const { formData, isDirty, resetForm, setDraftId, setTitle, setDescription } =
    useAssignmentCreation()
  const { isValidForDraft, isValidForPublish, validateForDraft, validateForPublish } =
    useAssignmentFormValidation(formData)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<AssignmentFormErrors>({})

  // Local question state (will be integrated with QuestionBuilderContext later)
  const [questions, setQuestions] = useState<Question[]>([])

  // Handle back navigation
  const handleGoBack = useCallback(() => {
    if (isDirty || questions.length > 0) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      )
      if (!confirmed) return
    }
    navigate('/teacher/dashboard')
  }, [navigate, isDirty, questions.length])

  /**
   * Parse backend field errors
   */
  const parseFieldErrors = useCallback((error: DraftApiError): AssignmentFormErrors => {
    const errors: AssignmentFormErrors = {}
    if (error.isValidationError() && error.fieldErrors.length > 0) {
      for (const fieldError of error.fieldErrors) {
        switch (fieldError.field) {
          case 'title':
            errors.title = fieldError.message
            break
          case 'description':
            errors.description = fieldError.message
            break
          case 'settings.availability.from':
          case 'availability.from':
          case 'settings.availability.to':
          case 'availability.to':
            errors.dueDate = fieldError.message
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
      if (formData.draftId) {
        response = await updateDraft(formData.draftId, formData)
      } else {
        response = await createDraft(formData)
        setDraftId(response.draft_id)
      }

      resetForm()
      navigate('/teacher/dashboard', {
        state: { message: 'Assignment draft saved successfully!' },
      })
    } catch (error) {
      if (error instanceof DraftApiError) {
        const parsedErrors = parseFieldErrors(error)
        setFieldErrors(parsedErrors)
        setSubmitError(error.message || 'Please fix the validation errors.')
      } else {
        setSubmitError('An unexpected error occurred. Please try again.')
      }
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
      const publishData = {
        ...formData,
        settings: {
          ...formData.settings,
          visibility: 'published' as const,
        },
      }

      if (formData.draftId) {
        await updateDraft(formData.draftId, publishData)
      } else {
        await createDraft(publishData)
      }

      resetForm()
      navigate('/teacher/dashboard', {
        state: { message: 'Assignment published successfully!' },
      })
    } catch (error) {
      if (error instanceof DraftApiError) {
        const parsedErrors = parseFieldErrors(error)
        setFieldErrors(parsedErrors)
        setSubmitError(error.message || 'Please fix the validation errors.')
      } else {
        setSubmitError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForPublish, resetForm, navigate, parseFieldErrors])

  // Question management
  const handleAddQuestion = useCallback(() => {
    const newQuestion: Question = {
      id: generateId(),
      content: '',
      type: 'multiple_choice',
      options: [
        { id: generateId(), text: '', isCorrect: false },
        { id: generateId(), text: '', isCorrect: false },
      ],
      order: questions.length,
    }
    setQuestions((prev) => [...prev, newQuestion])
  }, [questions.length])

  const handleUpdateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    )
  }, [])

  const handleDeleteQuestion = useCallback((questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }, [])

  const handleAddOption = useCallback((questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q
        return {
          ...q,
          options: [...q.options, { id: generateId(), text: '', isCorrect: false }],
        }
      })
    )
  }, [])

  const handleUpdateOption = useCallback(
    (questionId: string, optionId: string, text: string) => {
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== questionId) return q
          return {
            ...q,
            options: q.options.map((opt) =>
              opt.id === optionId ? { ...opt, text } : opt
            ),
          }
        })
      )
    },
    []
  )

  const handleDeleteOption = useCallback((questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q
        return {
          ...q,
          options: q.options.filter((opt) => opt.id !== optionId),
        }
      })
    )
  }, [])

  const handleSetCorrectOption = useCallback((questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q
        return {
          ...q,
          options: q.options.map((opt) => ({
            ...opt,
            isCorrect: opt.id === optionId,
          })),
        }
      })
    )
  }, [])

  // File import handler
  const handleFileImport = useCallback((file: File) => {
    console.log('File selected for import:', file.name)
    // TODO: Implement file parsing and question generation
  }, [])

  // Question count display
  const questionCountText = useMemo(() => {
    const count = questions.length
    return count === 1 ? '1 Question' : `${count} Questions`
  }, [questions.length])

  return (
    <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#111813] dark:text-white tracking-tight">
                New Assignment
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Create a new task for your students
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSubmitting || !isValidForDraft}
              className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handlePublish}
              disabled={isSubmitting || !isValidForPublish}
              className="px-5 py-2.5 rounded-xl bg-primary text-[#0d3b1e] font-bold hover:bg-[#00d649] shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">publish</span>
              Publish
            </button>
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

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Algebra Mid-term Review"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 rounded-xl bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium ${
                      fieldErrors.title ? 'border-red-500' : ''
                    }`}
                  />
                  {fieldErrors.title && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.title}</p>
                  )}
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Instructions (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add instructions for your students..."
                    rows={3}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-xl bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Questions Section Header */}
            <div className="flex items-center justify-between pt-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">quiz</span>
                Questions
              </h3>
              <span className="text-sm font-medium text-gray-500 px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full">
                {questionCountText}
              </span>
            </div>

            {/* Question Cards */}
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={index + 1}
                isActive={true}
                onUpdate={(updates) => handleUpdateQuestion(question.id, updates)}
                onDelete={() => handleDeleteQuestion(question.id)}
                onAddOption={() => handleAddOption(question.id)}
                onUpdateOption={(optionId, text) =>
                  handleUpdateOption(question.id, optionId, text)
                }
                onDeleteOption={(optionId) => handleDeleteOption(question.id, optionId)}
                onSetCorrectOption={(optionId) =>
                  handleSetCorrectOption(question.id, optionId)
                }
              />
            ))}

            {/* Add Question Button */}
            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full py-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-bold group"
            >
              <div className="p-1 rounded-full bg-gray-100 dark:bg-white/5 group-hover:bg-primary group-hover:text-[#0d3b1e] transition-colors">
                <span className="material-symbols-outlined">add</span>
              </div>
              Add Manual Question
            </button>
          </div>

          {/* Right Column (1/3) - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Import File Card */}
            <ImportFileCard onFileSelect={handleFileImport} />

            {/* Settings */}
            <SettingsSidebar isLoading={isSubmitting} />
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
