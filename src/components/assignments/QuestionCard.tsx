/**
 * QuestionCard Component
 *
 * Inline question card for the assignment creation page.
 * Matches the design reference with question number badge, drag handle,
 * media attachment buttons, answer type toggle, and options.
 */

import React, { useState, useCallback } from 'react'

export interface QuestionOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface Question {
  id: string
  content: string
  type: 'multiple_choice' | 'essay'
  options: QuestionOption[]
  order: number
}

interface QuestionCardProps {
  question: Question
  questionNumber: number
  isActive?: boolean
  onUpdate: (updates: Partial<Question>) => void
  onDelete: () => void
  onAddOption: () => void
  onUpdateOption: (optionId: string, text: string) => void
  onDeleteOption: (optionId: string) => void
  onSetCorrectOption: (optionId: string) => void
  onMediaClick?: (type: 'image' | 'video' | 'audio') => void
  className?: string
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  isActive = true,
  onUpdate,
  onDelete,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onSetCorrectOption,
  onMediaClick,
  className = '',
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate({ content: e.target.value })
    },
    [onUpdate]
  )

  const handleTypeChange = useCallback(
    (type: 'multiple_choice' | 'essay') => {
      onUpdate({ type })
    },
    [onUpdate]
  )

  const handleDelete = useCallback(() => {
    if (showDeleteConfirm) {
      onDelete()
      setShowDeleteConfirm(false)
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }, [showDeleteConfirm, onDelete])

  return (
    <div
      className={`bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border-2 ${
        isActive ? 'border-primary/30' : 'border-gray-100 dark:border-gray-800'
      } shadow-sm relative group transition-all ${className}`}
    >
      {/* Green accent bar */}
      {isActive && (
        <div className="absolute -left-3 top-6 w-1 h-12 bg-primary rounded-r-lg shadow-[0_0_10px_rgba(19,236,91,0.5)]" />
      )}

      {/* Header with question number and actions */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary font-bold text-sm ring-1 ring-primary/20">
            {questionNumber}
          </span>
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Question {questionNumber}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
            title="Move"
          >
            <span className="material-symbols-outlined">drag_indicator</span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={`p-2 transition-colors rounded-lg ${
              showDeleteConfirm
                ? 'text-white bg-red-500 hover:bg-red-600'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
            title={showDeleteConfirm ? 'Click again to confirm' : 'Delete'}
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>

      {/* Question content */}
      <div className="space-y-4 mb-6">
        <div className="relative group/input">
          <textarea
            value={question.content}
            onChange={handleContentChange}
            placeholder="Enter your question here..."
            rows={2}
            className="w-full pl-4 pr-4 py-4 rounded-xl bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-0 text-lg font-medium text-gray-900 dark:text-white placeholder-gray-400 transition-all resize-none shadow-inner"
          />

          {/* Media attachment buttons */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mr-1">
              Attach Media:
            </span>
            <button
              type="button"
              onClick={() => onMediaClick?.('image')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 text-gray-500 dark:text-gray-400 text-xs font-bold transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
            >
              <span className="material-symbols-outlined text-[18px]">image</span>
              Image
            </button>
            <button
              type="button"
              onClick={() => onMediaClick?.('video')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 dark:hover:text-pink-400 text-gray-500 dark:text-gray-400 text-xs font-bold transition-all border border-transparent hover:border-pink-200 dark:hover:border-pink-800"
            >
              <span className="material-symbols-outlined text-[18px]">videocam</span>
              Video
            </button>
            <button
              type="button"
              onClick={() => onMediaClick?.('audio')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 text-gray-500 dark:text-gray-400 text-xs font-bold transition-all border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
              Audio
            </button>
          </div>
        </div>
      </div>

      {/* Answer type section */}
      <div className="bg-background-light dark:bg-background-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-gray-200 dark:border-gray-700 pb-4">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">settings</span>
            Answer Type
          </label>
          <div className="flex bg-white dark:bg-surface-dark rounded-lg p-1 shadow-sm border border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => handleTypeChange('multiple_choice')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${
                question.type === 'multiple_choice'
                  ? 'bg-primary text-[#0d3b1e] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">list</span>
              Multiple Choice
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('essay')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-colors ${
                question.type === 'essay'
                  ? 'bg-primary text-[#0d3b1e] shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">edit_note</span>
              Essay
            </button>
          </div>
        </div>

        {/* Multiple choice options */}
        {question.type === 'multiple_choice' && (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-3 group">
                <div className="flex items-center justify-center size-6 shrink-0">
                  <input
                    type="radio"
                    name={`q${question.id}_correct`}
                    checked={option.isCorrect}
                    onChange={() => onSetCorrectOption(option.id)}
                    className="size-5 text-primary border-gray-300 focus:ring-primary bg-transparent cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => onUpdateOption(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-0 text-sm text-gray-900 dark:text-white shadow-sm transition-colors placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => onDeleteOption(option.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={onAddOption}
              className="text-sm font-bold text-primary hover:text-green-400 mt-2 flex items-center gap-1 pl-9 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Option
            </button>
          </div>
        )}

        {/* Essay type info */}
        {question.type === 'essay' && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-2xl mb-2 block">edit_note</span>
            <p className="text-sm">Students will provide a written response.</p>
            <p className="text-xs mt-1">This question requires manual grading.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionCard
