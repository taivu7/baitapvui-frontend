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
 * - Save draft and publish functionality (KAN-89, KAN-90, KAN-91, KAN-92)
 */

import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ImportFileCard,
  SettingsSidebar,
  QuestionCard,
  Question,
  AssignmentStatusBadge,
} from '../components/assignments'
import { ValidationErrorBanner, AssignmentActions } from '../components/assignment'
import {
  AssignmentCreationProvider,
  useAssignmentCreation,
} from '../context/AssignmentCreationContext'
import { useAssignmentFormValidation, useAssignmentActions } from '../hooks'
import { loadAssignment } from '../services/assignmentActionsApi'
import {
  ValidationError,
  SaveDraftRequest,
  SaveDraftResponse,
  PublishResponse,
  statusToDisplayMap,
} from '../types/assignmentActions'

// Generate unique IDs with timestamp for better uniqueness and backend compatibility
const generateId = () => `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

/**
 * Inner component that uses the AssignmentCreationContext
 */
const CreateAssignmentContent: React.FC = () => {
  const navigate = useNavigate()
  const { formData, isDirty, resetForm, setDraftId, setTitle, setDescription } =
    useAssignmentCreation()

  // Refs for scrolling to errors
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null)
  const questionsRef = useRef<HTMLDivElement>(null)

  // Local question state (will be integrated with QuestionBuilderContext later)
  const [questions, setQuestions] = useState<Question[]>([])

  // Loading state for initial assignment load
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(false)

  // Form validation hook (must come after questions state declaration)
  const { isValidForDraft, isValidForPublish, validateForDraft, validateForPublish } =
    useAssignmentFormValidation(formData, questions)

  // Use the new assignment actions hook
  const {
    state: assignmentState,
    isLoading,
    canEdit,
    saveDraft,
    publish,
    clearErrors,
    clearFieldError,
    getFieldErrors,
    getQuestionErrors,
    setAssignmentId,
    setStatus,
  } = useAssignmentActions({
    assignmentId: formData.draftId,
    onSaveDraftSuccess: (response: SaveDraftResponse) => {
      // Update draft ID in context
      setDraftId(response.assignmentId)
      // Navigate to dashboard with success message
      resetForm()
      navigate('/teacher/dashboard', {
        state: { message: 'Assignment draft saved successfully!' },
      })
    },
    onPublishSuccess: (_response: PublishResponse) => {
      // Navigate to dashboard with success message
      resetForm()
      navigate('/teacher/dashboard', {
        state: { message: 'Assignment published successfully!' },
      })
    },
  })

  // Keep assignment ID in sync with formData.draftId
  React.useEffect(() => {
    if (formData.draftId !== assignmentState.assignmentId) {
      setAssignmentId(formData.draftId)
    }
  }, [formData.draftId, assignmentState.assignmentId, setAssignmentId])

  // Load existing assignment on mount if ID is in URL
  useEffect(() => {
    const loadExistingAssignment = async () => {
      // Get assignmentId from URL params
      const params = new URLSearchParams(window.location.search)
      const assignmentId = params.get('id')

      if (!assignmentId) return

      setIsLoadingAssignment(true)
      try {
        const response = await loadAssignment(assignmentId)

        // Populate form data
        setTitle(response.title)
        setDescription(response.description || '')
        setDraftId(response.assignmentId)

        // Populate questions
        const loadedQuestions: Question[] = response.questions.map((q, index) => ({
          id: q.id,
          content: q.content,
          type: q.type === 'multiple_choice' ? 'multiple_choice' : 'essay',
          options: q.options?.map((opt) => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
          })) || [],
          order: index,
        }))
        setQuestions(loadedQuestions)

        // Update assignment state
        setAssignmentId(response.assignmentId)
        setStatus(response.status)

      } catch (error) {
        console.error('Failed to load assignment:', error)
        // Could show a toast here in the future
      } finally {
        setIsLoadingAssignment(false)
      }
    }

    loadExistingAssignment()
  }, [setTitle, setDescription, setDraftId, setAssignmentId, setStatus])

  // Get field errors from backend validation
  const backendFieldErrors = getFieldErrors()
  const backendQuestionErrors = getQuestionErrors()

  // Combine frontend and backend field errors
  const fieldErrors = useMemo(() => {
    const frontendErrors = validateForDraft().errors
    return {
      ...frontendErrors,
      ...backendFieldErrors,
    }
  }, [validateForDraft, backendFieldErrors])

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
   * Build request payload from form data and questions
   */
  const buildRequestPayload = useCallback((): SaveDraftRequest => {
    return {
      basicInfo: {
        title: formData.title,
        description: formData.description || undefined,
        dueDate: formData.settings.dueDate
          ? `${formData.settings.dueDate}T${formData.settings.dueTime || '23:59'}:00Z`
          : null,
      },
      questions: questions.map((q) => ({
        id: q.id,
        type: q.type === 'multiple_choice' ? 'multiple_choice' : 'essay',
        content: q.content,
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      })),
    }
  }, [formData, questions])

  // Handle save draft
  const handleSaveDraft = useCallback(async () => {
    // Clear previous errors
    clearErrors()

    // Validate frontend
    const validation = validateForDraft()
    if (!validation.isValid) {
      // Show validation errors in banner
      return
    }

    // Build payload and call API
    const payload = buildRequestPayload()
    await saveDraft(payload)
  }, [validateForDraft, buildRequestPayload, saveDraft, clearErrors])

  // Handle publish
  const handlePublish = useCallback(async () => {
    // Clear previous errors
    clearErrors()

    // Validate frontend
    const validation = validateForPublish()
    if (!validation.isValid) {
      // Show validation errors in banner
      return
    }

    // Build payload and call API
    const payload = buildRequestPayload()
    await publish(payload)
  }, [validateForPublish, buildRequestPayload, publish, clearErrors])

  /**
   * Scroll to error location when clicked in validation banner
   * Note: Errors are NOT cleared here - they will clear automatically when the user fixes the field
   */
  const handleErrorClick = useCallback((error: ValidationError) => {
    if (error.scope === 'assignment') {
      switch (error.field) {
        case 'title':
          titleInputRef.current?.focus()
          titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          break
        case 'description':
          descriptionInputRef.current?.focus()
          descriptionInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          break
        default:
          // For other fields, scroll to top of form
          window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (error.scope === 'question' && error.questionId) {
      // Scroll to questions section
      questionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    // Errors will clear automatically when user edits the field (via onChange handlers)
  }, [])

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
    // Clear any backend error for this question when it's updated
    clearFieldError(undefined, questionId)
  }, [clearFieldError])

  const handleDeleteQuestion = useCallback((questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
    // Clear any backend error for this question
    clearFieldError(undefined, questionId)
  }, [clearFieldError])

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

  // Check if there are any validation errors to show in banner
  const hasValidationErrors = assignmentState.validationErrors.length > 0

  // Get display status for badge
  const displayStatus = statusToDisplayMap[assignmentState.status]

  // Show loading state while fetching existing assignment
  if (isLoadingAssignment) {
    return (
      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-10">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <span className="material-symbols-outlined text-primary animate-spin text-4xl">
              progress_activity
            </span>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading assignment...</p>
          </div>
        </div>
      </main>
    )
  }

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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-[#111813] dark:text-white tracking-tight">
                  {formData.draftId ? 'Edit Assignment' : 'New Assignment'}
                </h1>
                {/* Status Badge */}
                <AssignmentStatusBadge status={displayStatus} />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {canEdit
                  ? 'Create a new task for your students'
                  : 'This assignment has been published and cannot be edited'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <AssignmentActions
            status={assignmentState.status}
            isSaving={assignmentState.isSaving}
            isPublishing={assignmentState.isPublishing}
            isValidForDraft={isValidForDraft}
            isValidForPublish={isValidForPublish}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
          />
        </div>

        {/* Validation Error Banner */}
        {hasValidationErrors && (
          <div className="mb-6">
            <ValidationErrorBanner
              errors={assignmentState.validationErrors}
              onDismiss={clearErrors}
              onErrorClick={handleErrorClick}
            />
          </div>
        )}

        {/* General Error Message */}
        {assignmentState.error && !hasValidationErrors && (
          <div
            className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-200 flex items-center gap-3"
            role="alert"
          >
            <span className="material-symbols-outlined text-red-500">error</span>
            <span>{assignmentState.error}</span>
            <button
              onClick={clearErrors}
              className="ml-auto text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

        {/* Questions Validation Warning */}
        {fieldErrors.questions && (
          <div
            className="mb-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 flex items-center gap-3"
            role="alert"
          >
            <span className="material-symbols-outlined text-amber-500">warning</span>
            <span>{fieldErrors.questions}</span>
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
                  <label
                    htmlFor="assignment-title"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Assignment Title
                  </label>
                  <input
                    ref={titleInputRef}
                    id="assignment-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      clearFieldError('title')
                    }}
                    placeholder="e.g., Algebra Mid-term Review"
                    disabled={isLoading || !canEdit}
                    className={`w-full px-4 py-3 rounded-xl bg-background-light dark:bg-background-dark border transition-all font-medium ${
                      fieldErrors.title
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-transparent focus:border-primary focus:ring-0'
                    } text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed`}
                    aria-invalid={!!fieldErrors.title}
                    aria-describedby={fieldErrors.title ? 'title-error' : undefined}
                  />
                  {fieldErrors.title && (
                    <p id="title-error" className="mt-1 text-sm text-red-500" role="alert">
                      {fieldErrors.title}
                    </p>
                  )}
                </div>

                {/* Instructions */}
                <div>
                  <label
                    htmlFor="assignment-description"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Instructions (Optional)
                  </label>
                  <textarea
                    ref={descriptionInputRef}
                    id="assignment-description"
                    value={formData.description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      clearFieldError('description')
                    }}
                    placeholder="Add instructions for your students..."
                    rows={3}
                    disabled={isLoading || !canEdit}
                    className="w-full px-4 py-3 rounded-xl bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div ref={questionsRef}>
              {/* Questions Section Header */}
              <div className="flex items-center justify-between pt-2 mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">quiz</span>
                  Questions
                </h3>
                <span className="text-sm font-medium text-gray-500 px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full">
                  {questionCountText}
                </span>
              </div>

              {/* Question Cards */}
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="relative">
                    {/* Question-level error indicator */}
                    {backendQuestionErrors[question.id] && (
                      <div className="absolute -left-3 top-4 w-1.5 h-8 bg-red-500 rounded-full" />
                    )}
                    <QuestionCard
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
                    {/* Question-level error message */}
                    {backendQuestionErrors[question.id] && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          error
                        </span>
                        {backendQuestionErrors[question.id]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Question Button */}
              {canEdit && (
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  disabled={isLoading}
                  className="w-full py-5 mt-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-bold group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="p-1 rounded-full bg-gray-100 dark:bg-white/5 group-hover:bg-primary group-hover:text-[#0d3b1e] transition-colors">
                    <span className="material-symbols-outlined">add</span>
                  </div>
                  Add Manual Question
                </button>
              )}
            </div>
          </div>

          {/* Right Column (1/3) - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Import File Card */}
            {canEdit && <ImportFileCard onFileSelect={handleFileImport} />}

            {/* Settings */}
            <SettingsSidebar isLoading={isLoading} />
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
