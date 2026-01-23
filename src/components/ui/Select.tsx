/**
 * Select Component
 *
 * Reusable select dropdown component following the same design patterns as Input.
 * Supports labels, error states, icons, and dark mode.
 */

import React from 'react'

interface SelectOption {
  /** Option value */
  value: string
  /** Display label */
  label: string
  /** Whether the option is disabled */
  disabled?: boolean
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Label text displayed above the select */
  label?: string
  /** Icon name from Material Symbols */
  icon?: string
  /** Error message to display */
  error?: string
  /** Helper text displayed below the select */
  helperText?: string
  /** Placeholder text for empty state */
  placeholder?: string
  /** Array of options */
  options: SelectOption[]
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, icon, error, helperText, placeholder, options, className = '', id, ...props },
    ref
  ) => {
    // Generate a unique ID if not provided
    const selectId = id || `select-${Math.random().toString(36).substring(7)}`

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-semibold text-[#111813] dark:text-white ml-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {icon}
              </span>
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helperText
                  ? `${selectId}-helper`
                  : undefined
            }
            className={`w-full rounded-lg border ${
              error ? 'border-red-500' : 'border-[#e5e7eb] dark:border-[#2a3c30]'
            } bg-white dark:bg-[#102216] py-3 ${
              icon ? 'pl-10' : 'pl-4'
            } pr-10 text-sm text-[#111813] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm outline-none appearance-none cursor-pointer ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              expand_more
            </span>
          </div>
        </div>
        {error && (
          <p id={`${selectId}-error`} className="text-sm text-red-500 ml-1" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="text-sm text-gray-500 dark:text-gray-400 ml-1">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
