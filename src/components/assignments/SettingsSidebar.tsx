/**
 * SettingsSidebar Component
 *
 * Simplified settings panel for the assignment creation page sidebar.
 * Matches the design reference with just class, due date, and due time.
 */

import React, { useCallback, useMemo } from 'react'
import { useAssignmentCreation } from '../../context/AssignmentCreationContext'
import useTeacherClasses from '../../hooks/useTeacherClasses'

interface SettingsSidebarProps {
  isLoading?: boolean
  className?: string
}

/**
 * Get minimum date for due date picker (today)
 */
const getMinDate = (): string => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  isLoading = false,
  className = '',
}) => {
  const { formData, setClassId, setDueDate, setDueTime } = useAssignmentCreation()
  const { classes, isLoading: classesLoading } = useTeacherClasses()

  // Convert classes to select options
  const classOptions = useMemo(
    () =>
      classes.map((cls) => ({
        value: cls.id,
        label: cls.studentCount ? `${cls.name}` : cls.name,
      })),
    [classes]
  )

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

  const isFormDisabled = isLoading

  return (
    <div
      className={`bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 ${className}`}
    >
      {/* Header */}
      <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
        Settings
      </h3>

      {/* Assign to Class */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
          Assign to Class
        </label>
        <div className="relative">
          <select
            value={formData.settings.classId}
            onChange={handleClassChange}
            disabled={isFormDisabled || classesLoading}
            className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-0 text-sm text-gray-900 dark:text-white cursor-pointer appearance-none"
          >
            <option value="">Select a class...</option>
            {classOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </div>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
          Due Date
        </label>
        <div className="relative group">
          <span className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary material-symbols-outlined text-lg transition-colors">
            calendar_today
          </span>
          <input
            type="date"
            value={formData.settings.dueDate || ''}
            onChange={handleDueDateChange}
            disabled={isFormDisabled}
            min={getMinDate()}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-0 text-sm text-gray-900 dark:text-white transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* Due Time */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
          Due Time
        </label>
        <div className="relative group">
          <span className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary material-symbols-outlined text-lg transition-colors">
            schedule
          </span>
          <input
            type="time"
            value={formData.settings.dueTime || ''}
            onChange={handleDueTimeChange}
            disabled={isFormDisabled || !formData.settings.dueDate}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-0 text-sm text-gray-900 dark:text-white transition-all cursor-pointer disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  )
}

export default SettingsSidebar
