/**
 * useQuestionValidation Hook
 *
 * Custom hook for validating question data before saving.
 */

import { useMemo } from 'react'
import { DraftQuestion, QuestionType } from '../types'

interface ValidationResult {
  isValid: boolean
  errors: {
    content?: string
    options?: string
    correctAnswer?: string
  }
}

/**
 * Validate a single question
 */
export function useQuestionValidation(question: DraftQuestion): ValidationResult {
  return useMemo(() => {
    const errors: ValidationResult['errors'] = {}

    // Validate content
    if (!question.content.trim()) {
      errors.content = 'Question content is required'
    }

    // Validate multiple choice specific rules
    if (question.type === 'multiple_choice') {
      if (question.options.length === 0) {
        errors.options = 'At least one answer option is required'
      } else {
        // Check for empty options
        const hasEmptyOption = question.options.some((opt) => !opt.text.trim())
        if (hasEmptyOption) {
          errors.options = 'All answer options must have text'
        }

        // Check for correct answer
        const hasCorrectAnswer = question.options.some((opt) => opt.isCorrect)
        if (!hasCorrectAnswer) {
          errors.correctAnswer = 'At least one answer must be marked as correct'
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }, [question])
}

/**
 * Validate multiple questions
 */
export function useQuestionsValidation(questions: DraftQuestion[]): {
  allValid: boolean
  invalidQuestions: Array<{ index: number; questionId: string; errors: ValidationResult['errors'] }>
} {
  return useMemo(() => {
    const invalidQuestions: Array<{
      index: number
      questionId: string
      errors: ValidationResult['errors']
    }> = []

    questions.forEach((question, index) => {
      const errors: ValidationResult['errors'] = {}

      if (!question.content.trim()) {
        errors.content = 'Question content is required'
      }

      if (question.type === 'multiple_choice') {
        if (question.options.length === 0) {
          errors.options = 'At least one answer option is required'
        } else {
          const hasEmptyOption = question.options.some((opt) => !opt.text.trim())
          if (hasEmptyOption) {
            errors.options = 'All answer options must have text'
          }

          const hasCorrectAnswer = question.options.some((opt) => opt.isCorrect)
          if (!hasCorrectAnswer) {
            errors.correctAnswer = 'At least one answer must be marked as correct'
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        invalidQuestions.push({
          index: index + 1,
          questionId: question.id,
          errors,
        })
      }
    })

    return {
      allValid: invalidQuestions.length === 0,
      invalidQuestions,
    }
  }, [questions])
}

export default useQuestionValidation
