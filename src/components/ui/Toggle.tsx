/**
 * Toggle Component
 *
 * Accessible toggle switch component with label support.
 * Follows the design system patterns.
 */

import React from 'react'

interface ToggleOption {
  /** Option value */
  value: string
  /** Display label */
  label: string
  /** Optional icon */
  icon?: string
}

interface ToggleProps {
  /** Currently selected value */
  value: string
  /** Callback when value changes */
  onChange: (value: string) => void
  /** Array of toggle options (typically 2) */
  options: ToggleOption[]
  /** Optional label text */
  label?: string
  /** Whether the toggle is disabled */
  disabled?: boolean
  /** Optional additional CSS classes */
  className?: string
  /** Accessible name for the toggle group */
  ariaLabel?: string
}

const Toggle: React.FC<ToggleProps> = ({
  value,
  onChange,
  options,
  label,
  disabled = false,
  className = '',
  ariaLabel,
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="text-sm font-semibold text-[#111813] dark:text-white ml-1">
          {label}
        </span>
      )}
      <div
        role="radiogroup"
        aria-label={ariaLabel || label}
        className="inline-flex rounded-lg bg-gray-100 dark:bg-[#102216] p-1 border border-gray-200 dark:border-[#2a3c30]"
      >
        {options.map((option) => {
          const isSelected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-white dark:bg-[#1a2c20] text-[#111813] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#111813] dark:hover:text-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {option.icon && (
                <span
                  className={`material-symbols-outlined ${
                    isSelected ? 'text-primary' : ''
                  }`}
                  style={{ fontSize: '18px' }}
                >
                  {option.icon}
                </span>
              )}
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default React.memo(Toggle)
