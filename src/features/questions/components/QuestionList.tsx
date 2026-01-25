/**
 * QuestionList Component
 *
 * Implements KAN-77: Implement Question Reordering
 * Implements KAN-64: Add virtualization for large lists
 *
 * Sidebar component for navigating between questions and reordering them.
 * Uses virtualization for lists with 50+ questions for performance.
 */

import React, { useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { QuestionListProps, DraftQuestion } from '../types'
import { truncateText } from '../utils'

// =============================================================================
// Constants
// =============================================================================

/**
 * Threshold for enabling virtualization
 * Lists with more than this many questions will be virtualized
 */
const VIRTUALIZATION_THRESHOLD = 50

/**
 * Estimated height of each question item in pixels
 */
const ITEM_HEIGHT = 80

// =============================================================================
// Sub-components
// =============================================================================

interface QuestionListItemProps {
  question: DraftQuestion
  index: number
  isSelected: boolean
  isFirst: boolean
  isLast: boolean
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

const QuestionListItem: React.FC<QuestionListItemProps> = ({
  question,
  index,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onMoveUp,
  onMoveDown,
}) => {
  const isNewlyImported = question.isNewlyImported
  const questionPreview = question.content.trim()
    ? truncateText(question.content, 50)
    : 'Untitled Question'

  return (
    <div
      data-question-id={question.id}
      data-newly-imported={isNewlyImported}
      className={`
        group relative p-3 rounded-lg border transition-all cursor-pointer
        ${
          isNewlyImported
            ? 'animate-pulse bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 ring-2 ring-green-300 dark:ring-green-700'
            : isSelected
              ? 'bg-primary/10 border-primary shadow-md'
              : 'bg-white dark:bg-[#102216] border-gray-200 dark:border-[#2a3c30] hover:bg-gray-50 dark:hover:bg-[#1a2c20]'
        }
      `}
      onClick={onSelect}
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
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                question.type === 'multiple_choice'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
              }`}
            >
              {question.type === 'multiple_choice' ? 'MC' : 'Essay'}
            </span>
            {isNewlyImported && (
              <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                Imported
              </span>
            )}
            {!question.isSaved && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                Unsaved
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
          onClick={onMoveUp}
          disabled={isFirst}
          className={`
            p-1 rounded bg-white dark:bg-[#102216] shadow-md border border-gray-200 dark:border-[#2a3c30]
            ${
              isFirst
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
          onClick={onMoveDown}
          disabled={isLast}
          className={`
            p-1 rounded bg-white dark:bg-[#102216] shadow-md border border-gray-200 dark:border-[#2a3c30]
            ${
              isLast
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
}

// =============================================================================
// Main Component
// =============================================================================

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  currentQuestionId,
  onSelectQuestion,
  onReorder,
  onDelete: _onDelete,
  className = '',
}) => {
  const parentRef = useRef<HTMLDivElement>(null)

  // Determine if we should use virtualization
  const shouldVirtualize = questions.length > VIRTUALIZATION_THRESHOLD

  // Set up virtualizer for large lists
  const virtualizer = useVirtualizer({
    count: questions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5, // Render 5 extra items outside viewport for smooth scrolling
    enabled: shouldVirtualize,
  })

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

  // Render question item
  const renderQuestionItem = (question: DraftQuestion, index: number) => {
    return (
      <QuestionListItem
        key={question.id}
        question={question}
        index={index}
        isSelected={question.id === currentQuestionId}
        isFirst={index === 0}
        isLast={index === questions.length - 1}
        onSelect={() => onSelectQuestion(question.id)}
        onMoveUp={() => handleMoveUp(index)}
        onMoveDown={() => handleMoveDown(index)}
      />
    )
  }

  // Virtualized list content
  const virtualizedContent = useMemo(() => {
    if (!shouldVirtualize) return null

    const virtualItems = virtualizer.getVirtualItems()

    return (
      <div
        ref={parentRef}
        className="h-[400px] overflow-auto"
        role="listbox"
        aria-label={`Questions list with ${questions.length} items (virtualized)`}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const question = questions[virtualItem.index]
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div className="py-1">
                  {renderQuestionItem(question, virtualItem.index)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }, [shouldVirtualize, virtualizer, questions, currentQuestionId])

  // Standard list content (for smaller lists)
  const standardContent = useMemo(() => {
    if (shouldVirtualize) return null

    return (
      <div className="space-y-2">
        {questions.map((question, index) => renderQuestionItem(question, index))}
      </div>
    )
  }, [shouldVirtualize, questions, currentQuestionId])

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Questions ({questions.length})
          {shouldVirtualize && (
            <span className="ml-2 text-xs text-gray-400 font-normal">
              (virtualized)
            </span>
          )}
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
      ) : shouldVirtualize ? (
        virtualizedContent
      ) : (
        standardContent
      )}
    </div>
  )
}

export default QuestionList
