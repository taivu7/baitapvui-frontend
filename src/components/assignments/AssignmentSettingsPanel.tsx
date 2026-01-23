/**
 * AssignmentSettingsPanel Component
 *
 * Panel for configuring assignment settings including class selection,
 * due date/time, visibility, and attempt limits.
 * Implements KAN-66: Implement Assignment Settings Panel
 *
 * Features:
 * - Class selection dropdown
 * - Due date picker
 * - Due time picker
 * - Visibility toggle (draft/published)
 * - Maximum attempts setting
 * - Integration with AssignmentCreationContext
 */

import React, { useCallback, useMemo } from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Toggle from '../ui/Toggle'
import { useAssignmentCreation } from '../../context/AssignmentCreationContext'
import { AssignmentSettingsPanelProps, AssignmentVisibility } from '../../types/assignmentCreation'
import useTeacherClasses from '../../hooks/useTeacherClasses'

/**
 * Maximum attempts options
 */
const MAX_ATTEMPTS_OPTIONS = [
  { value: '', label: 'Unlimited' },
  { value: '1', label: '1 attempt' },
  { value: '2', label: '2 attempts' },
  { value: '3', label: '3 attempts' },
  { value: '5', label: '5 attempts' },
  { value: '10', label: '10 attempts' },
]

/**
 * Visibility toggle options
 */
const VISIBILITY_OPTIONS = [
  { value: 'draft', label: 'Draft', icon: 'edit_document' },
  { value: 'published', label: 'Published', icon: 'publish' },
]

/**
 * Get minimum date for due date picker (today)
 */
const getMinDate = (): string => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

/**
 * AssignmentSettingsPanel component
 */
const AssignmentSettingsPanel: React.FC<AssignmentSettingsPanelProps> = ({
  className = '',
  isLoading = false,
}) => {
  const {
    formData,
    setClassId,
    setDueDate,
    setDueTime,
    setVisibility,
    setMaxAttempts,
  } = useAssignmentCreation()

  // Fetch available classes
  const { classes, isLoading: classesLoading, error: classesError } = useTeacherClasses()

  // Convert classes to select options
  const classOptions = useMemo(
    () =>
      classes.map((cls) => ({
        value: cls.id,
        label: cls.studentCount
          ? `${cls.name} (${cls.studentCount} students)`
          : cls.name,
      })),
    [classes]
  )

  // Handlers
  const handleClassChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setClassId(e.target.value)
    },
    [setClassId]
  )

  const handleDueDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value || null
      setDueDate(value)
      // Clear time if date is cleared
      if (!value) {
        setDueTime(null)
      }
    },
    [setDueDate, setDueTime]
  )

  const handleDueTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDueTime(e.target.value || null)
    },
    [setDueTime]
  )

  const handleVisibilityChange = useCallback(
    (value: string) => {
      setVisibility(value as AssignmentVisibility)
    },
    [setVisibility]
  )

  const handleMaxAttemptsChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      setMaxAttempts(value ? parseInt(value, 10) : null)
    },
    [setMaxAttempts]
  )

  // Handle clear due date
  const handleClearDueDate = useCallback(() => {
    setDueDate(null)
    setDueTime(null)
  }, [setDueDate, setDueTime])

  const isFormDisabled = isLoading

  return (
    <div
      className={`bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 p-6 ${className}`}
      role="group"
      aria-labelledby="settings-heading"
    >
      {/* Section Header */}
      <div className="mb-6">
        <h2
          id="settings-heading"
          className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-primary">settings</span>
          Assignment Settings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configure assignment options and scheduling.
        </p>
      </div>

      {/* Settings Fields */}
      <div className="space-y-6">
        {/* Class Selection */}
        <div>
          <Select
            id="assignment-class"
            label="Assign to Class"
            icon="school"
            placeholder="Select a class..."
            options={classOptions}
            value={formData.settings.classId}
            onChange={handleClassChange}
            disabled={isFormDisabled || classesLoading}
            error={classesError || undefined}
            helperText={
              classesLoading
                ? 'Loading classes...'
                : 'Choose which class will receive this assignment'
            }
          />
        </div>

        {/* Due Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Due Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label
                htmlFor="assignment-due-date"
                className="text-sm font-semibold text-[#111813] dark:text-white"
              >
                Due Date
              </label>
              {formData.settings.dueDate && (
                <button
                  type="button"
                  onClick={handleClearDueDate}
                  className="text-xs text-gray-500 hover:text-primary transition-colors"
                  aria-label="Clear due date"
                >
                  Clear
                </button>
              )}
            </div>
            <Input
              id="assignment-due-date"
              type="date"
              icon="calendar_today"
              value={formData.settings.dueDate || ''}
              onChange={handleDueDateChange}
              disabled={isFormDisabled}
              min={getMinDate()}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
              Optional - leave empty for no deadline
            </p>
          </div>

          {/* Due Time */}
          <div>
            <label
              htmlFor="assignment-due-time"
              className="block text-sm font-semibold text-[#111813] dark:text-white mb-1.5 ml-1"
            >
              Due Time
            </label>
            <Input
              id="assignment-due-time"
              type="time"
              icon="schedule"
              value={formData.settings.dueTime || ''}
              onChange={handleDueTimeChange}
              disabled={isFormDisabled || !formData.settings.dueDate}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
              {formData.settings.dueDate
                ? 'Set a specific time'
                : 'Select a date first'}
            </p>
          </div>
        </div>

        {/* Visibility Toggle */}
        <div>
          <Toggle
            label="Status"
            value={formData.settings.visibility}
            onChange={handleVisibilityChange}
            options={VISIBILITY_OPTIONS}
            disabled={isFormDisabled}
            ariaLabel="Assignment visibility status"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">
            {formData.settings.visibility === 'draft'
              ? 'Draft assignments are only visible to you'
              : 'Published assignments are visible to assigned students'}
          </p>
        </div>

        {/* Max Attempts */}
        <div>
          <Select
            id="assignment-max-attempts"
            label="Maximum Attempts"
            icon="replay"
            options={MAX_ATTEMPTS_OPTIONS}
            value={formData.settings.maxAttempts?.toString() || ''}
            onChange={handleMaxAttemptsChange}
            disabled={isFormDisabled}
            helperText="How many times can students submit this assignment?"
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 flex-shrink-0">
              info
            </span>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                About Assignment Settings
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                You can change these settings at any time before the due date. Students will
                be notified of any changes to published assignments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(AssignmentSettingsPanel)
