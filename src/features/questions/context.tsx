/**
 * QuestionBuilderContext
 *
 * React Context for managing question builder state with persistence.
 * Implements KAN-81: Persist Question Builder State
 *
 * Features:
 * - Centralized state management
 * - sessionStorage persistence for page refresh resilience
 * - Automatic state restoration
 * - Question CRUD operations
 * - Media attachment handling
 * - Question reordering
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react'
import {
  QuestionBuilderState,
  QuestionBuilderContextValue,
  DraftQuestion,
  QuestionType,
  QuestionOption,
  DEFAULT_QUESTION_BUILDER_STATE,
  DEFAULT_DRAFT_QUESTION,
  QUESTION_BUILDER_STORAGE_KEY,
  MediaAttachment,
} from './types'
import questionApi from './api'
import { generateUUID } from './utils'

// =============================================================================
// Storage Helpers
// =============================================================================

/**
 * Load question builder state from sessionStorage
 */
function loadFromStorage(assignmentId: string): QuestionBuilderState | null {
  try {
    const key = `${QUESTION_BUILDER_STORAGE_KEY}_${assignmentId}`
    const stored = sessionStorage.getItem(key)
    if (!stored) return null

    const parsed = JSON.parse(stored) as QuestionBuilderState

    // Validate structure
    if (!Array.isArray(parsed.questions)) {
      console.warn('Invalid stored question data, clearing storage')
      sessionStorage.removeItem(key)
      return null
    }

    return parsed
  } catch (error) {
    console.warn('Failed to parse stored question data:', error)
    return null
  }
}

/**
 * Save question builder state to sessionStorage
 */
function saveToStorage(assignmentId: string, state: QuestionBuilderState): void {
  try {
    const key = `${QUESTION_BUILDER_STORAGE_KEY}_${assignmentId}`
    sessionStorage.setItem(key, JSON.stringify(state))
  } catch (error) {
    console.warn('Failed to save question data to storage:', error)
  }
}

/**
 * Clear question builder state from sessionStorage
 */
function clearStorage(assignmentId: string): void {
  try {
    const key = `${QUESTION_BUILDER_STORAGE_KEY}_${assignmentId}`
    sessionStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to clear question storage:', error)
  }
}

// =============================================================================
// Context Definition
// =============================================================================

const QuestionBuilderContext = createContext<QuestionBuilderContextValue | undefined>(undefined)

/**
 * Provider props
 */
interface QuestionBuilderProviderProps {
  assignmentId: string
  children: ReactNode
}

/**
 * QuestionBuilderProvider component
 */
export const QuestionBuilderProvider: React.FC<QuestionBuilderProviderProps> = ({
  assignmentId,
  children,
}) => {
  const [state, setState] = useState<QuestionBuilderState>(DEFAULT_QUESTION_BUILDER_STATE)

  // Get current question
  const currentQuestion = useMemo(() => {
    if (!state.currentQuestionId) return null
    return state.questions.find((q) => q.id === state.currentQuestionId) || null
  }, [state.questions, state.currentQuestionId])

  // Load questions from backend on mount
  useEffect(() => {
    loadQuestions(assignmentId)
  }, [assignmentId])

  // Save to sessionStorage whenever state changes
  useEffect(() => {
    if (state.questions.length > 0 || state.isDirty) {
      saveToStorage(assignmentId, state)
    }
  }, [state, assignmentId])

  // =============================================================================
  // Question CRUD Operations
  // =============================================================================

  /**
   * Add a new question
   */
  const addQuestion = useCallback(
    (type: QuestionType = 'multiple_choice') => {
      const newQuestion: DraftQuestion = {
        ...DEFAULT_DRAFT_QUESTION,
        id: generateUUID(),
        type,
        order: state.questions.length,
        options: type === 'multiple_choice' ? [] : [],
      }

      setState((prev) => ({
        ...prev,
        questions: [...prev.questions, newQuestion],
        currentQuestionId: newQuestion.id,
        isDirty: true,
      }))
    },
    [state.questions.length]
  )

  /**
   * Update a question
   */
  const updateQuestion = useCallback((questionId: string, updates: Partial<DraftQuestion>) => {
    setState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates, isSaved: false } : q
      ),
      isDirty: true,
    }))
  }, [])

  /**
   * Delete a question
   */
  const deleteQuestion = useCallback(
    async (questionId: string) => {
      const question = state.questions.find((q) => q.id === questionId)
      if (!question) return

      // If question is saved on backend, delete it
      if (question.backendId) {
        try {
          await questionApi.deleteQuestion(question.backendId)
        } catch (error) {
          console.error('Failed to delete question from backend:', error)
          throw error
        }
      }

      // Remove from local state
      setState((prev) => {
        const filtered = prev.questions.filter((q) => q.id !== questionId)
        // Reorder remaining questions
        const reordered = filtered.map((q, index) => ({ ...q, order: index }))

        return {
          ...prev,
          questions: reordered,
          currentQuestionId:
            prev.currentQuestionId === questionId
              ? reordered[0]?.id || null
              : prev.currentQuestionId,
          isDirty: true,
        }
      })
    },
    [state.questions]
  )

  // =============================================================================
  // Question Navigation
  // =============================================================================

  /**
   * Set current question
   */
  const setCurrentQuestion = useCallback((questionId: string | null) => {
    setState((prev) => ({
      ...prev,
      currentQuestionId: questionId,
    }))
  }, [])

  // =============================================================================
  // Question Reordering
  // =============================================================================

  /**
   * Reorder questions (drag and drop)
   */
  const reorderQuestions = useCallback((sourceIndex: number, destinationIndex: number) => {
    setState((prev) => {
      const questions = [...prev.questions]
      const [removed] = questions.splice(sourceIndex, 1)
      questions.splice(destinationIndex, 0, removed)

      // Update order values
      const reordered = questions.map((q, index) => ({ ...q, order: index, isSaved: false }))

      return {
        ...prev,
        questions: reordered,
        isDirty: true,
      }
    })
  }, [])

  /**
   * Move question up
   */
  const moveQuestionUp = useCallback((questionId: string) => {
    setState((prev) => {
      const index = prev.questions.findIndex((q) => q.id === questionId)
      if (index <= 0) return prev

      const questions = [...prev.questions]
      ;[questions[index - 1], questions[index]] = [questions[index], questions[index - 1]]

      const reordered = questions.map((q, i) => ({ ...q, order: i, isSaved: false }))

      return {
        ...prev,
        questions: reordered,
        isDirty: true,
      }
    })
  }, [])

  /**
   * Move question down
   */
  const moveQuestionDown = useCallback((questionId: string) => {
    setState((prev) => {
      const index = prev.questions.findIndex((q) => q.id === questionId)
      if (index === -1 || index >= prev.questions.length - 1) return prev

      const questions = [...prev.questions]
      ;[questions[index], questions[index + 1]] = [questions[index + 1], questions[index]]

      const reordered = questions.map((q, i) => ({ ...q, order: i, isSaved: false }))

      return {
        ...prev,
        questions: reordered,
        isDirty: true,
      }
    })
  }, [])

  // =============================================================================
  // Question Type Operations
  // =============================================================================

  /**
   * Set question type
   */
  const setQuestionType = useCallback((questionId: string, type: QuestionType) => {
    setState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q

        // When switching to multiple choice, preserve or initialize options
        if (type === 'multiple_choice' && q.options.length === 0) {
          return {
            ...q,
            type,
            options: [],
            isSaved: false,
          }
        }

        // When switching to essay, preserve options but they won't be used
        return {
          ...q,
          type,
          isSaved: false,
        }
      }),
      isDirty: true,
    }))
  }, [])

  // =============================================================================
  // Question Content Operations
  // =============================================================================

  /**
   * Set question content
   */
  const setQuestionContent = useCallback((questionId: string, content: string) => {
    updateQuestion(questionId, { content })
  }, [updateQuestion])

  // =============================================================================
  // Multiple Choice Options Operations
  // =============================================================================

  /**
   * Add option to multiple choice question
   */
  const addOption = useCallback((questionId: string) => {
    setState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId || q.type !== 'multiple_choice') return q

        const newOption: QuestionOption = {
          id: generateUUID(),
          text: '',
          isCorrect: false,
        }

        return {
          ...q,
          options: [...q.options, newOption],
          isSaved: false,
        }
      }),
      isDirty: true,
    }))
  }, [])

  /**
   * Update option text
   */
  const updateOption = useCallback((questionId: string, optionId: string, text: string) => {
    setState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q

        return {
          ...q,
          options: q.options.map((opt) => (opt.id === optionId ? { ...opt, text } : opt)),
          isSaved: false,
        }
      }),
      isDirty: true,
    }))
  }, [])

  /**
   * Delete option
   */
  const deleteOption = useCallback((questionId: string, optionId: string) => {
    setState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q

        return {
          ...q,
          options: q.options.filter((opt) => opt.id !== optionId),
          isSaved: false,
        }
      }),
      isDirty: true,
    }))
  }, [])

  /**
   * Set correct option (for single answer)
   */
  const setCorrectOption = useCallback(
    (questionId: string, optionId: string, isCorrect: boolean) => {
      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.id !== questionId) return q

          // For single answer MC, uncheck others when setting one as correct
          return {
            ...q,
            options: q.options.map((opt) => ({
              ...opt,
              isCorrect: opt.id === optionId ? isCorrect : false,
            })),
            isSaved: false,
          }
        }),
        isDirty: true,
      }))
    },
    []
  )

  // =============================================================================
  // Media Operations
  // =============================================================================

  /**
   * Upload media for a question
   */
  const uploadMedia = useCallback(async (questionId: string, file: File) => {
    // Validate file
    const validation = questionApi.validateMediaFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    try {
      const media = await questionApi.uploadMedia(file)

      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.id !== questionId) return q

          return {
            ...q,
            media: [...q.media, media],
            isSaved: false,
          }
        }),
        isDirty: true,
      }))
    } catch (error) {
      console.error('Failed to upload media:', error)
      throw error
    }
  }, [])

  /**
   * Delete media from a question
   */
  const deleteMedia = useCallback(async (questionId: string, mediaId: string) => {
    try {
      await questionApi.deleteMedia(mediaId)

      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.id !== questionId) return q

          return {
            ...q,
            media: q.media.filter((m) => m.id !== mediaId),
            isSaved: false,
          }
        }),
        isDirty: true,
      }))
    } catch (error) {
      console.error('Failed to delete media:', error)
      throw error
    }
  }, [])

  // =============================================================================
  // Persistence Operations
  // =============================================================================

  /**
   * Save a single question to backend
   */
  const saveQuestion = useCallback(
    async (questionId: string) => {
      const question = state.questions.find((q) => q.id === questionId)
      if (!question) return

      // Validate question
      const validation = questionApi.validateQuestion(
        question.type,
        question.content,
        question.options
      )
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '))
      }

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        if (question.backendId) {
          // Update existing question
          await questionApi.updateQuestion(question.backendId, {
            type: question.type,
            content: question.content,
            order: question.order,
            options: question.options.map((opt) => ({
              id: opt.id,
              text: opt.text,
              isCorrect: opt.isCorrect,
            })),
          })
        } else {
          // Create new question
          const created = await questionApi.createQuestion(assignmentId, {
            type: question.type,
            content: question.content,
            order: question.order,
            options: question.options.map((opt) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
            })),
          })

          // Update with backend ID
          setState((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
              q.id === questionId ? { ...q, backendId: created.id, isSaved: true } : q
            ),
          }))
        }

        setState((prev) => ({
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === questionId ? { ...q, isSaved: true } : q
          ),
          isLoading: false,
        }))
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to save question'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))
        throw error
      }
    },
    [state.questions, assignmentId]
  )

  /**
   * Save all questions to backend
   */
  const saveAllQuestions = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      // Save each question sequentially
      for (const question of state.questions) {
        if (!question.isSaved) {
          await saveQuestion(question.id)
        }
      }

      // Save reordering if needed
      if (state.isDirty) {
        await questionApi.reorderQuestions(assignmentId, {
          questions: state.questions
            .filter((q) => q.backendId)
            .map((q) => ({
              id: q.backendId!,
              order: q.order,
            })),
        })
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isDirty: false,
      }))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save questions'
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }, [state.questions, state.isDirty, assignmentId, saveQuestion])

  /**
   * Load questions from backend
   */
  const loadQuestions = useCallback(
    async (assignmentId: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        // Try to load from sessionStorage first
        const storedState = loadFromStorage(assignmentId)
        if (storedState && storedState.questions.length > 0) {
          setState({
            ...storedState,
            isLoading: false,
          })
          return
        }

        // Load from backend
        const questions = await questionApi.getQuestions(assignmentId)

        const draftQuestions: DraftQuestion[] = questions.map((q) => ({
          id: generateUUID(),
          backendId: q.id,
          type: q.type,
          content: q.content,
          order: q.order,
          options: q.options || [],
          media: q.media || [],
          isSaved: true,
        }))

        setState({
          questions: draftQuestions,
          currentQuestionId: draftQuestions[0]?.id || null,
          isLoading: false,
          error: null,
          isDirty: false,
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load questions'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))
      }
    },
    []
  )

  /**
   * Reset builder state
   */
  const resetBuilder = useCallback(() => {
    setState(DEFAULT_QUESTION_BUILDER_STATE)
    clearStorage(assignmentId)
  }, [assignmentId])

  // =============================================================================
  // Context Value
  // =============================================================================

  const contextValue = useMemo<QuestionBuilderContextValue>(
    () => ({
      state,
      currentQuestion,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      setCurrentQuestion,
      reorderQuestions,
      moveQuestionUp,
      moveQuestionDown,
      setQuestionType,
      setQuestionContent,
      addOption,
      updateOption,
      deleteOption,
      setCorrectOption,
      uploadMedia,
      deleteMedia,
      saveQuestion,
      saveAllQuestions,
      loadQuestions,
      resetBuilder,
    }),
    [
      state,
      currentQuestion,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      setCurrentQuestion,
      reorderQuestions,
      moveQuestionUp,
      moveQuestionDown,
      setQuestionType,
      setQuestionContent,
      addOption,
      updateOption,
      deleteOption,
      setCorrectOption,
      uploadMedia,
      deleteMedia,
      saveQuestion,
      saveAllQuestions,
      loadQuestions,
      resetBuilder,
    ]
  )

  return (
    <QuestionBuilderContext.Provider value={contextValue}>
      {children}
    </QuestionBuilderContext.Provider>
  )
}

/**
 * Custom hook to access question builder context
 */
export function useQuestionBuilder(): QuestionBuilderContextValue {
  const context = useContext(QuestionBuilderContext)
  if (!context) {
    throw new Error('useQuestionBuilder must be used within a QuestionBuilderProvider')
  }
  return context
}

export default QuestionBuilderContext
