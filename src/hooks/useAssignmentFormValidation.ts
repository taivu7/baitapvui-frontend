/**
 * useAssignmentFormValidation Hook
 *
 * Custom hook for validating assignment form data.
 * Used in the CreateAssignment page before saving/publishing.
 */

import { useMemo, useCallback } from 'react'
import { AssignmentFormData, AssignmentFormErrors } from '../types/assignmentCreation'

/**
 * Question interface for validation purposes
 */
interface QuestionForValidation {
  id: string
  content: string
}

/**
 * Validation result interface
 */
interface ValidationResult {
  /** Whether the form is valid */
  isValid: boolean
  /** Validation errors */
  errors: AssignmentFormErrors
}

/**
 * Return type for useAssignmentFormValidation hook
 */
interface UseAssignmentFormValidationReturn {
  /** Current validation errors based on form data */
  errors: AssignmentFormErrors
  /** Whether the form is valid for saving as draft */
  isValidForDraft: boolean
  /** Whether the form is valid for publishing */
  isValidForPublish: boolean
  /** Validate the form for draft saving */
  validateForDraft: () => ValidationResult
  /** Validate the form for publishing */
  validateForPublish: () => ValidationResult
}

/**
 * Custom hook for assignment form validation
 *
 * @param formData - The form data to validate
 * @param questions - Array of questions to validate (required for publish)
 */
const useAssignmentFormValidation = (
  formData: AssignmentFormData,
  questions: QuestionForValidation[] = []
): UseAssignmentFormValidationReturn => {
  /**
   * Validate title
   */
  const validateTitle = useCallback((title: string): string | undefined => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return 'Assignment title is required'
    }
    if (trimmedTitle.length < 3) {
      return 'Title must be at least 3 characters'
    }
    if (title.length > 200) {
      return 'Title cannot exceed 200 characters'
    }
    return undefined
  }, [])

  /**
   * Validate description
   */
  const validateDescription = useCallback((description: string): string | undefined => {
    if (description.length > 5000) {
      return 'Description cannot exceed 5000 characters'
    }
    return undefined
  }, [])

  /**
   * Validate class selection (required for publish)
   */
  const validateClassId = useCallback((classId: string): string | undefined => {
    if (!classId) {
      return 'Please select a class'
    }
    return undefined
  }, [])

  /**
   * Validate due date format
   */
  const validateDueDate = useCallback((dueDate: string | null): string | undefined => {
    if (dueDate) {
      const date = new Date(dueDate)
      if (isNaN(date.getTime())) {
        return 'Invalid date format'
      }
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (date < today) {
        return 'Due date cannot be in the past'
      }
    }
    return undefined
  }, [])

  /**
   * Validate for draft saving (minimal requirements)
   */
  const validateForDraft = useCallback((): ValidationResult => {
    const errors: AssignmentFormErrors = {}

    // Only title is required for draft
    const titleError = validateTitle(formData.title)
    if (titleError) errors.title = titleError

    const descError = validateDescription(formData.description)
    if (descError) errors.description = descError

    const dueDateError = validateDueDate(formData.settings.dueDate)
    if (dueDateError) errors.dueDate = dueDateError

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }, [formData, validateTitle, validateDescription, validateDueDate])

  /**
   * Validate for publishing (all requirements)
   */
  const validateForPublish = useCallback((): ValidationResult => {
    const errors: AssignmentFormErrors = {}

    // Title is required
    const titleError = validateTitle(formData.title)
    if (titleError) errors.title = titleError

    // Description validation
    const descError = validateDescription(formData.description)
    if (descError) errors.description = descError

    // Class is required for publishing
    const classError = validateClassId(formData.settings.classId)
    if (classError) errors.classId = classError

    // Due date validation
    const dueDateError = validateDueDate(formData.settings.dueDate)
    if (dueDateError) errors.dueDate = dueDateError

    // At least one question is required for publishing
    if (questions.length === 0) {
      errors.questions = 'At least one question is required to publish'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }, [formData, validateTitle, validateDescription, validateClassId, validateDueDate, questions])

  /**
   * Current errors (for display purposes, validates as publish)
   */
  const errors = useMemo(() => {
    const draftValidation = validateForDraft()
    return draftValidation.errors
  }, [validateForDraft])

  /**
   * Check if valid for draft (minimal requirements)
   */
  const isValidForDraft = useMemo(() => {
    return validateForDraft().isValid
  }, [validateForDraft])

  /**
   * Check if valid for publishing (all requirements)
   */
  const isValidForPublish = useMemo(() => {
    return validateForPublish().isValid
  }, [validateForPublish])

  return {
    errors,
    isValidForDraft,
    isValidForPublish,
    validateForDraft,
    validateForPublish,
  }
}

export default useAssignmentFormValidation
