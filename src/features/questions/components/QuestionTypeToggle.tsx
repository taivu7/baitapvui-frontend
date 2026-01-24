/**
 * QuestionTypeToggle Component
 *
 * Implements KAN-78: Implement Answer Type Selection (MC / Essay)
 *
 * Toggle component for switching between Multiple Choice and Essay question types.
 */

import React from 'react'
import { QuestionType, QuestionTypeToggleProps } from '../types'

const QuestionTypeToggle: React.FC<QuestionTypeToggleProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const types: Array<{ value: QuestionType; label: string; icon: string }> = [
    { value: 'multiple_choice', label: 'Multiple Choice', icon: 'radio_button_checked' },
    { value: 'essay', label: 'Essay', icon: 'article' },
  ]

  return (
    <div className={`flex gap-2 ${className}`}>
      {types.map((type) => {
        const isSelected = value === type.value
        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all
              ${
                isSelected
                  ? 'bg-primary text-[#111813] shadow-md'
                  : 'bg-white dark:bg-[#102216] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2a3c30] hover:bg-gray-50 dark:hover:bg-[#1a2c20]'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-pressed={isSelected}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {type.icon}
            </span>
            <span>{type.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default QuestionTypeToggle
