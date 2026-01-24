/**
 * QuestionEditor Component
 *
 * Implements KAN-75, KAN-76, KAN-78, KAN-79, KAN-80
 *
 * Main editor component for creating and editing questions.
 * Includes content editor, type toggle, options management, and media attachments.
 * Now includes real-time validation feedback.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { QuestionEditorProps } from '../types'
import { useQuestionBuilder } from '../context'
import { useQuestionValidation } from '../hooks/useQuestionValidation'
import useDebounce from '../../../hooks/useDebounce'
import QuestionTypeToggle from './QuestionTypeToggle'
import MultipleChoiceOptions from './MultipleChoiceOptions'
import MediaAttachmentToolbar from './MediaAttachmentToolbar'
import Textarea from '../../../components/ui/Textarea'

// Debounce delay for content updates (ms)
const CONTENT_DEBOUNCE_DELAY = 300

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onUpdate,
  onDelete,
  className = '',
}) => {
  const {
    setQuestionType,
    setQuestionContent,
    addOption,
    updateOption,
    deleteOption,
    setCorrectOption,
    uploadMedia,
    deleteMedia,
  } = useQuestionBuilder()

  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Local content state for debouncing
  const [localContent, setLocalContent] = useState(question.content)
  const debouncedContent = useDebounce(localContent, CONTENT_DEBOUNCE_DELAY)
  const isInitialMount = useRef(true)

  // Sync local content when question changes (e.g., switching questions)
  useEffect(() => {
    setLocalContent(question.content)
  }, [question.id]) // Only reset when question ID changes

  // Update context when debounced content changes
  useEffect(() => {
    // Skip initial mount to avoid unnecessary update
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Only update if content actually changed
    if (debouncedContent !== question.content) {
      setQuestionContent(question.id, debouncedContent)
    }
  }, [debouncedContent, question.id, question.content, setQuestionContent])

  // Real-time validation (use local content for immediate feedback)
  const questionForValidation = { ...question, content: localContent }
  const validation = useQuestionValidation(questionForValidation)

  const handleTypeChange = (type: 'multiple_choice' | 'essay') => {
    setQuestionType(question.id, type)
  }

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value)
  }, [])

  const handleUploadMedia = async (file: File) => {
    setIsUploadingMedia(true)
    try {
      await uploadMedia(question.id, file)
    } finally {
      setIsUploadingMedia(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    await deleteMedia(question.id, mediaId)
  }

  const handleDelete = () => {
    if (deleteConfirmOpen) {
      onDelete()
      setDeleteConfirmOpen(false)
    } else {
      setDeleteConfirmOpen(true)
      setTimeout(() => setDeleteConfirmOpen(false), 3000)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with type toggle and delete button */}
      <div className="flex items-center justify-between">
        <QuestionTypeToggle value={question.type} onChange={handleTypeChange} />

        <button
          type="button"
          onClick={handleDelete}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              deleteConfirmOpen
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white dark:bg-[#102216] text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
            }
          `}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            delete
          </span>
          <span>{deleteConfirmOpen ? 'Click again to confirm' : 'Delete Question'}</span>
        </button>
      </div>

      {/* Question content editor */}
      <div>
        <label
          htmlFor={`question-content-${question.id}`}
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
        >
          Question Content
        </label>
        <Textarea
          id={`question-content-${question.id}`}
          value={localContent}
          onChange={handleContentChange}
          placeholder="Enter your question here..."
          rows={4}
          className="w-full"
        />
        {!localContent.trim() && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
            Question content is required
          </p>
        )}
      </div>

      {/* Media attachment toolbar */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Media Attachments
        </h3>
        <MediaAttachmentToolbar
          media={question.media}
          onUpload={handleUploadMedia}
          onDelete={handleDeleteMedia}
          isUploading={isUploadingMedia}
        />
      </div>

      {/* Multiple choice options (only for MC type) */}
      {question.type === 'multiple_choice' && (
        <MultipleChoiceOptions
          options={question.options}
          onAddOption={() => addOption(question.id)}
          onUpdateOption={(optionId, text) => updateOption(question.id, optionId, text)}
          onDeleteOption={(optionId) => deleteOption(question.id, optionId)}
          onSetCorrect={(optionId, isCorrect) => setCorrectOption(question.id, optionId, isCorrect)}
          validationErrors={validation.errors}
        />
      )}

      {/* Essay type info */}
      {question.type === 'essay' && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-500 text-xl">info</span>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Essay Question
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Students will provide a written response. This question requires manual grading.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status indicators */}
      <div className="flex items-center gap-4">
        {!question.isSaved && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              schedule
            </span>
            <span>Unsaved changes</span>
          </div>
        )}
        {!validation.isValid && (
          <div className="flex items-center gap-2 text-xs text-red-500 dark:text-red-400">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              error
            </span>
            <span>Please fix validation errors before saving</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionEditor
