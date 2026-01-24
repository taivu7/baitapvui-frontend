/**
 * MultipleChoiceOptions Component
 *
 * Implements KAN-79: Implement Multiple Choice Options UI
 *
 * Component for managing multiple choice answer options.
 * Now includes real-time validation feedback.
 */

import React from 'react'
import { MultipleChoiceOptionsProps } from '../types'
import { ValidationErrors } from '../hooks/useQuestionValidation'
import Button from '../../../components/ui/Button'

interface MultipleChoiceOptionsWithValidationProps extends MultipleChoiceOptionsProps {
  validationErrors?: ValidationErrors
}

const MultipleChoiceOptions: React.FC<MultipleChoiceOptionsWithValidationProps> = ({
  options,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onSetCorrect,
  validationErrors,
  className = '',
}) => {
  const optionTextErrors = validationErrors?.optionTexts || {}
  const hasNoCorrectAnswer = !!validationErrors?.correctAnswer
  const hasNoOptions = !!validationErrors?.options && options.length === 0
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Answer Options
        </h3>
        <Button
          type="button"
          variant="secondary"
          onClick={onAddOption}
          icon="add"
          className="!py-2 !px-3 !text-xs"
        >
          Add Option
        </Button>
      </div>

      {options.length === 0 ? (
        <div className={`text-center py-8 px-4 rounded-lg border-2 border-dashed ${
          hasNoOptions
            ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800'
            : 'bg-gray-50 dark:bg-[#0d1a12] border-gray-300 dark:border-[#2a3c30]'
        }`}>
          <span className={`material-symbols-outlined text-4xl mb-2 ${
            hasNoOptions ? 'text-red-400 dark:text-red-500' : 'text-gray-400 dark:text-gray-600'
          }`}>
            {hasNoOptions ? 'error' : 'library_add'}
          </span>
          <p className={`text-sm ${
            hasNoOptions ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {hasNoOptions
              ? 'At least one answer option is required'
              : 'No options yet. Click "Add Option" to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {options.map((option, index) => {
            const hasError = !!optionTextErrors[option.id]
            return (
              <div
                key={option.id}
                className={`flex items-start gap-3 p-3 bg-white dark:bg-[#102216] border rounded-lg ${
                  hasError
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-200 dark:border-[#2a3c30]'
                }`}
              >
                {/* Radio button for correct answer */}
                <div className="flex items-center pt-2">
                  <input
                    type="radio"
                    name="correct-answer"
                    checked={option.isCorrect}
                    onChange={(e) => onSetCorrect(option.id, e.target.checked)}
                    className={`w-4 h-4 focus:ring-2 ${
                      hasNoCorrectAnswer && !options.some((o) => o.isCorrect)
                        ? 'text-red-500 focus:ring-red-500'
                        : 'text-primary focus:ring-primary'
                    }`}
                    aria-label={`Mark option ${index + 1} as correct`}
                  />
                </div>

                {/* Option text input */}
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Option {index + 1}
                  </label>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => onUpdateOption(option.id, e.target.value)}
                    placeholder="Enter option text..."
                    className={`w-full px-3 py-2 bg-gray-50 dark:bg-[#0d1a12] border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 ${
                      hasError
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                        : 'border-gray-200 dark:border-[#2a3c30] focus:ring-primary'
                    }`}
                    aria-label={`Option ${index + 1} text`}
                    aria-invalid={hasError}
                  />
                  {hasError && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      {optionTextErrors[option.id]}
                    </p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onDeleteOption(option.id)}
                  className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  aria-label={`Delete option ${index + 1}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    delete
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {options.length > 0 && (
        <>
          {hasNoCorrectAnswer && (
            <div className="flex items-center gap-2 text-red-500 dark:text-red-400 mt-2">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                error
              </span>
              <p className="text-xs">{validationErrors?.correctAnswer}</p>
            </div>
          )}
          {!hasNoCorrectAnswer && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Select the correct answer by clicking the radio button.
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default MultipleChoiceOptions
