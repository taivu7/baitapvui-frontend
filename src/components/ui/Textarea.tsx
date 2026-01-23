/**
 * Textarea Component
 *
 * Reusable textarea component following the same design patterns as Input.
 * Supports labels, error states, and dark mode.
 */

import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text displayed above the textarea */
  label?: string
  /** Error message to display */
  error?: string
  /** Helper text displayed below the textarea */
  helperText?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    // Generate a unique ID if not provided
    const textareaId = id || `textarea-${Math.random().toString(36).substring(7)}`

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-semibold text-[#111813] dark:text-white ml-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
                ? `${textareaId}-helper`
                : undefined
          }
          className={`w-full rounded-lg border ${
            error ? 'border-red-500' : 'border-[#e5e7eb] dark:border-[#2a3c30]'
          } bg-white dark:bg-[#102216] py-3 px-4 text-sm text-[#111813] dark:text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm outline-none resize-y min-h-[100px] ${className}`}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-sm text-red-500 ml-1"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${textareaId}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400 ml-1"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
