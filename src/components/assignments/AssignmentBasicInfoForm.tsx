/**
 * AssignmentBasicInfoForm Component
 *
 * Form for capturing basic assignment information including title and description.
 * Implements KAN-65: Build Assignment Basic Info Form
 *
 * Features:
 * - Assignment title input (required)
 * - Assignment description/instructions textarea (optional)
 * - Client-side validation
 * - Integration with AssignmentCreationContext for state management
 * - Accessible form controls with proper ARIA attributes
 */

import React, { useCallback, useState, useMemo, useEffect } from 'react'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import { useAssignmentCreation } from '../../context/AssignmentCreationContext'
import { AssignmentBasicInfoFormProps, AssignmentFormErrors } from '../../types/assignmentCreation'

/**
 * Maximum character limits
 */
const TITLE_MAX_LENGTH = 200
const DESCRIPTION_MAX_LENGTH = 5000

/**
 * AssignmentBasicInfoForm component for entering assignment title and description
 */
const AssignmentBasicInfoForm: React.FC<AssignmentBasicInfoFormProps> = ({
  className = '',
  isSubmitting = false,
}) => {
  const { formData, setTitle, setDescription } = useAssignmentCreation()
  const [errors, setErrors] = useState<AssignmentFormErrors>({})
  const [touched, setTouched] = useState<{ title: boolean; description: boolean }>({
    title: false,
    description: false,
  })

  // Validate title
  const validateTitle = useCallback((value: string): string | undefined => {
    const trimmedValue = value.trim()
    if (!trimmedValue) {
      return 'Assignment title is required'
    }
    if (trimmedValue.length < 3) {
      return 'Title must be at least 3 characters'
    }
    if (value.length > TITLE_MAX_LENGTH) {
      return `Title cannot exceed ${TITLE_MAX_LENGTH} characters`
    }
    return undefined
  }, [])

  // Validate description
  const validateDescription = useCallback((value: string): string | undefined => {
    if (value.length > DESCRIPTION_MAX_LENGTH) {
      return `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`
    }
    return undefined
  }, [])

  // Update errors when form data changes and fields are touched
  useEffect(() => {
    const newErrors: AssignmentFormErrors = {}

    if (touched.title) {
      const titleError = validateTitle(formData.title)
      if (titleError) newErrors.title = titleError
    }

    if (touched.description) {
      const descError = validateDescription(formData.description)
      if (descError) newErrors.description = descError
    }

    setErrors(newErrors)
  }, [formData.title, formData.description, touched, validateTitle, validateDescription])

  // Handle title change
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value)
    },
    [setTitle]
  )

  // Handle title blur for validation
  const handleTitleBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, title: true }))
  }, [])

  // Handle description change
  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value)
    },
    [setDescription]
  )

  // Handle description blur for validation
  const handleDescriptionBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, description: true }))
  }, [])

  // Character count display
  const titleCharCount = useMemo(
    () => `${formData.title.length}/${TITLE_MAX_LENGTH}`,
    [formData.title.length]
  )

  const descriptionCharCount = useMemo(
    () => `${formData.description.length}/${DESCRIPTION_MAX_LENGTH}`,
    [formData.description.length]
  )

  // Check if title is approaching limit
  const isTitleNearLimit = formData.title.length > TITLE_MAX_LENGTH * 0.8
  const isDescriptionNearLimit = formData.description.length > DESCRIPTION_MAX_LENGTH * 0.8

  return (
    <div
      className={`bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 p-6 ${className}`}
      role="group"
      aria-labelledby="basic-info-heading"
    >
      {/* Section Header */}
      <div className="mb-6">
        <h2
          id="basic-info-heading"
          className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-primary">edit_note</span>
          Basic Information
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Enter the title and instructions for your assignment.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Title Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5 ml-1">
            <label
              htmlFor="assignment-title"
              className="text-sm font-semibold text-[#111813] dark:text-white"
            >
              Assignment Title <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-xs ${
                isTitleNearLimit
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {titleCharCount}
            </span>
          </div>
          <Input
            id="assignment-title"
            type="text"
            placeholder="Enter assignment title (e.g., Math Homework - Chapter 3)"
            value={formData.title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            error={errors.title}
            disabled={isSubmitting}
            maxLength={TITLE_MAX_LENGTH}
            aria-required="true"
            aria-describedby={errors.title ? 'title-error' : 'title-hint'}
          />
          {!errors.title && (
            <p id="title-hint" className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
              Give your assignment a clear, descriptive title
            </p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5 ml-1">
            <label
              htmlFor="assignment-description"
              className="text-sm font-semibold text-[#111813] dark:text-white"
            >
              Instructions / Description{' '}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <span
              className={`text-xs ${
                isDescriptionNearLimit
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {descriptionCharCount}
            </span>
          </div>
          <Textarea
            id="assignment-description"
            placeholder="Add instructions or notes for your students..."
            value={formData.description}
            onChange={handleDescriptionChange}
            onBlur={handleDescriptionBlur}
            error={errors.description}
            disabled={isSubmitting}
            maxLength={DESCRIPTION_MAX_LENGTH}
            rows={5}
            aria-describedby={errors.description ? 'description-error' : 'description-hint'}
          />
          {!errors.description && (
            <p
              id="description-hint"
              className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1"
            >
              Provide any additional context or instructions for students
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(AssignmentBasicInfoForm)
