/**
 * useQuestionValidation Hook
 *
 * Custom hook for validating question data before saving.
 * Provides real-time validation feedback for questions.
 */

import { useMemo } from 'react'
import { DraftQuestion } from '../types'

export interface ValidationErrors {
  content?: string
  options?: string
  correctAnswer?: string
  optionTexts?: Record<string, string> // optionId -> error message
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationErrors
  hasErrors: boolean
}

/**
 * Validate a single question - can be used outside of React components
 */
export function validateQuestion(question: DraftQuestion): ValidationResult {
  const errors: ValidationErrors = {}

  // Validate content
  if (!question.content.trim()) {
    errors.content = 'Question content is required'
  }

  // Validate multiple choice specific rules
  if (question.type === 'multiple_choice') {
    if (question.options.length === 0) {
      errors.options = 'At least one answer option is required'
    } else {
      // Check for empty options and collect per-option errors
      const optionTexts: Record<string, string> = {}
      question.options.forEach((opt) => {
        if (!opt.text.trim()) {
          optionTexts[opt.id] = 'Option text is required'
        }
      })

      if (Object.keys(optionTexts).length > 0) {
        errors.optionTexts = optionTexts
        errors.options = 'All answer options must have text'
      }

      // Check for correct answer
      const hasCorrectAnswer = question.options.some((opt) => opt.isCorrect)
      if (!hasCorrectAnswer) {
        errors.correctAnswer = 'Please select a correct answer'
      }
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  return {
    isValid: !hasErrors,
    errors,
    hasErrors,
  }
}

/**
 * Validate a single question - React hook version
 */
export function useQuestionValidation(question: DraftQuestion | null): ValidationResult {
  return useMemo(() => {
    if (!question) {
      return {
        isValid: true,
        errors: {},
        hasErrors: false,
      }
    }
    return validateQuestion(question)
  }, [question])
}

/**
 * Validate multiple questions
 */
export function useQuestionsValidation(questions: DraftQuestion[]): {
  allValid: boolean
  invalidCount: number
  invalidQuestions: Array<{ index: number; questionId: string; errors: ValidationErrors }>
  validationMap: Map<string, ValidationResult>
} {
  return useMemo(() => {
    const invalidQuestions: Array<{
      index: number
      questionId: string
      errors: ValidationErrors
    }> = []
    const validationMap = new Map<string, ValidationResult>()

    questions.forEach((question, index) => {
      const result = validateQuestion(question)
      validationMap.set(question.id, result)

      if (!result.isValid) {
        invalidQuestions.push({
          index: index + 1,
          questionId: question.id,
          errors: result.errors,
        })
      }
    })

    return {
      allValid: invalidQuestions.length === 0,
      invalidCount: invalidQuestions.length,
      invalidQuestions,
      validationMap,
    }
  }, [questions])
}

export default useQuestionValidation
