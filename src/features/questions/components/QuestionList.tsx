/**
 * QuestionList Component
 *
 * Implements KAN-77: Implement Question Reordering
 *
 * Sidebar component for navigating between questions and reordering them.
 */

import React from 'react'
import { QuestionListProps } from '../types'
import { truncateText } from '../utils'

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  currentQuestionId,
  onSelectQuestion,
  onReorder,
  onDelete,
  className = '',
}) => {
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      onReorder(index, index - 1)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < questions.length - 1) {
      onReorder(index, index + 1)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Questions ({questions.length})
        </h3>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 px-4 bg-gray-50 dark:bg-[#0d1a12] rounded-lg border-2 border-dashed border-gray-300 dark:border-[#2a3c30]">
          <span className="material-symbols-outlined text-gray-400 dark:text-gray-600 text-4xl mb-2">
            quiz
          </span>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No questions yet. Add your first question to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((question, index) => {
            const isSelected = question.id === currentQuestionId
            const questionPreview = question.content.trim()
              ? truncateText(question.content, 50)
              : 'Untitled Question'

            return (
              <div
                key={question.id}
                className={`
                  group relative p-3 rounded-lg border transition-all cursor-pointer
                  ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-md'
                      : 'bg-white dark:bg-[#102216] border-gray-200 dark:border-[#2a3c30] hover:bg-gray-50 dark:hover:bg-[#1a2c20]'
                  }
                `}
                onClick={() => onSelectQuestion(question.id)}
              >
                {/* Question info */}
                <div className="flex items-start gap-3">
                  {/* Question number */}
                  <div
                    className={`
                    flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                    ${
                      isSelected
                        ? 'bg-primary text-[#111813]'
                        : 'bg-gray-200 dark:bg-[#2a3c30] text-gray-600 dark:text-gray-400'
                    }
                  `}
                  >
                    {index + 1}
                  </div>

                  {/* Question content preview */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {questionPreview}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          question.type === 'multiple_choice'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        }`}
                      >
                        {question.type === 'multiple_choice' ? 'MC' : 'Essay'}
                      </span>
                      {!question.isSaved && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          • Unsaved
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reorder controls (visible on hover) */}
                <div
                  className={`
                  absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1
                  opacity-0 group-hover:opacity-100 transition-opacity
                `}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className={`
                      p-1 rounded bg-white dark:bg-[#102216] shadow-md border border-gray-200 dark:border-[#2a3c30]
                      ${
                        index === 0
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:bg-gray-50 dark:hover:bg-[#1a2c20]'
                      }
                    `}
                    aria-label="Move question up"
                  >
                    <span
                      className="material-symbols-outlined text-gray-600 dark:text-gray-400"
                      style={{ fontSize: '16px' }}
                    >
                      arrow_upward
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === questions.length - 1}
                    className={`
                      p-1 rounded bg-white dark:bg-[#102216] shadow-md border border-gray-200 dark:border-[#2a3c30]
                      ${
                        index === questions.length - 1
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:bg-gray-50 dark:hover:bg-[#1a2c20]'
                      }
                    `}
                    aria-label="Move question down"
                  >
                    <span
                      className="material-symbols-outlined text-gray-600 dark:text-gray-400"
                      style={{ fontSize: '16px' }}
                    >
                      arrow_downward
                    </span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default QuestionList
